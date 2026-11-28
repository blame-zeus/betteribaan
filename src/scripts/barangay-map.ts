/**
 * The interactive barangay map (components/BarangayMap.astro).
 *
 * Imported only by that component, so pages without a map load none of this.
 * Each `[data-map-board]` starts when it nears the viewport: MapLibre (bundled,
 * lazily imported), its stylesheet and the outlines from `data-src`, then the
 * basemap from OpenFreeMap and elevation from AWS Terrain Tiles. Until then,
 * and without WebGL, the server-rendered SVG map and the index keep working.
 *
 * Settings (measures, camera, tiles) are in lib/map-config.ts; colours are the
 * site's tokens, read at runtime, so the map follows the light and dark themes.
 */
import type {
  ExpressionSpecification,
  LngLatBoundsLike,
  Map as MapLibreMap,
  PaddingOptions,
  StyleSpecification,
} from 'maplibre-gl';
import type { FeatureCollection, MultiPolygon, Point, Polygon } from 'geojson';
import { MAP_TILES, MAP_VIEW, measureById, type MapMeasure } from '../lib/map-config';

interface Props {
  name: string;
  slug: string;
  code: string;
  center: [number, number];
  [measure: string]: unknown;
}
type Collection = FeatureCollection<Polygon | MultiPolygon, Props>;

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration = (ms: number) => (reduced ? 0 : ms);

const normalize = (value: string): string =>
  value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

const hasWebGL = (() => {
  let result: boolean | undefined;
  return () => {
    if (result === undefined) {
      const probe = document.createElement('canvas');
      result = Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'));
    }
    return result;
  };
})();

/**
 * A CSS colour as an rgb()/rgba() string MapLibre can parse. Browsers report
 * `color-mix()` and some tokens as `color(srgb …)`, which MapLibre rejects.
 */
function token(host: HTMLElement, expr: string): string {
  const probe = document.createElement('span');
  probe.style.color = expr;
  probe.style.display = 'none';
  host.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  const srgb = value.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/);
  if (!srgb) return value;
  const [r, g, b] = srgb.slice(1, 4).map((n) => Math.round(Number(n) * 255));
  return srgb[4] ? `rgba(${r}, ${g}, ${b}, ${srgb[4]})` : `rgb(${r}, ${g}, ${b})`;
}

function palette(host: HTMLElement) {
  const t = (expr: string) => token(host, expr);
  return {
    land: t('var(--c-panel-2)'),
    green: t('color-mix(in srgb, var(--c-ok) 12%, var(--c-panel-2))'),
    water: t('color-mix(in srgb, var(--c-accent) 24%, var(--c-panel-2))'),
    road: t('color-mix(in srgb, var(--c-ink) 16%, var(--c-panel-2))'),
    line: t('var(--c-surface)'),
    ink: t('var(--c-ink)'),
    halo: t('var(--c-surface)'),
    low: t('color-mix(in srgb, var(--c-accent) 16%, var(--c-surface))'),
    high: t('var(--c-accent)'),
    hot: t('var(--c-clay)'),
    faint: t('color-mix(in srgb, var(--c-line) 60%, var(--c-surface))'),
    shadow: t('var(--c-ink)'),
  };
}
type Palette = ReturnType<typeof palette>;

/** The basemap. Barangay layers are added on top once the style has loaded. */
function baseStyle(p: Palette): StyleSpecification {
  return {
    version: 8,
    glyphs: MAP_TILES.glyphs,
    sources: {
      omt: { type: 'vector', url: MAP_TILES.vector },
      // Terrain and hillshade read the same tiles through two sources, as MapLibre
      // recommends; the browser's cache serves the second request.
      dem: { type: 'raster-dem', tiles: [MAP_TILES.dem], encoding: 'terrarium', tileSize: 256, maxzoom: 13 },
      hills: { type: 'raster-dem', tiles: [MAP_TILES.dem], encoding: 'terrarium', tileSize: 256, maxzoom: 13 },
    },
    layers: [
      { id: 'ground', type: 'background', paint: { 'background-color': p.land } },
      { id: 'landcover', type: 'fill', source: 'omt', 'source-layer': 'landcover', paint: { 'fill-color': p.green, 'fill-opacity': 0.7 } },
      { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': p.water } },
      {
        id: 'hillshade',
        type: 'hillshade',
        source: 'hills',
        paint: { 'hillshade-shadow-color': p.shadow, 'hillshade-highlight-color': p.halo, 'hillshade-exaggeration': 0.3 },
      },
      {
        id: 'roads',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor']]],
        paint: {
          'line-color': p.road,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 15, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary', 'secondary'], 3, 1.2]],
        },
      },
    ],
  };
}

/** Bounds of a set of features, for framing. */
function boundsOf(features: Collection['features']): [[number, number], [number, number]] | null {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const f of features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const ring of polys.flat()) {
      for (const [x, y] of ring) {
        if (x < w) w = x;
        if (x > e) e = x;
        if (y < s) s = y;
        if (y > n) n = y;
      }
    }
  }
  return Number.isFinite(w) ? [[w, s], [e, n]] : null;
}

/** Add a stylesheet once and resolve when it has loaded (or failed: the map still works). */
function loadStylesheet(href: string): Promise<void> {
  const existing = document.querySelector<HTMLLinkElement>(`link[data-map-css]`);
  if (existing) return Promise.resolve();
  return new Promise((resolve) => {
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
    link.dataset.mapCss = '';
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => resolve(), { once: true });
    document.head.append(link);
  });
}

function mount(board: HTMLElement): void {
  const $ = <T extends Element = HTMLElement>(selector: string) => board.querySelector<T>(selector);
  const canvas = $('[data-map-canvas]')!;
  const fallback = $('[data-map-fallback]')!;
  const status = $('[data-map-status]')!;
  const tip = $('[data-map-tip]')!;
  const card = $('[data-map-card]')!;
  const nameNode = $('[data-map-name]');
  const codeNode = $('[data-map-code]');
  const countNode = $('[data-map-count]');
  const filter = $<HTMLInputElement>('[data-map-filter]');
  const shapes = [...board.querySelectorAll<HTMLElement>('[data-map-shape]')];
  const items = [...board.querySelectorAll<HTMLElement>('[data-map-item]')];
  const rows = [...board.querySelectorAll<HTMLElement>('[data-map-row]')];
  const targets = [...shapes, ...items];
  const slugOf = (el: Element) => el.getAttribute('data-map-shape') ?? el.getAttribute('data-map-item') ?? '';
  const defaultName = nameNode?.textContent ?? '';
  const defaultCode = codeNode?.textContent ?? '';
  /** Names and codes from the server-rendered index: the map needs no data module. */
  const info = new Map(items.map((el) => [slugOf(el), { name: el.dataset.name ?? '', code: el.dataset.code ?? '' }]));

  let hovered: string | null = null;
  let selected: string | null = null;
  let query = '';
  let measure: MapMeasure = measureById(board.dataset.measure);

  /** Set by the live map once its layers exist; until then only the SVG and index react. */
  let live: {
    state: (slug: string, state: Record<string, boolean>) => void;
    frame: (slug: string) => void;
    showCard: (slug: string | null) => void;
  } | null = null;

  const say = (text: string | null) => {
    status.hidden = !text;
    status.textContent = text ?? '';
  };

  const matches = (slug: string) => {
    if (!query) return true;
    const i = info.get(slug);
    return normalize(`${i?.name ?? ''} ${i?.code ?? ''}`).includes(query);
  };

  const refresh = () => {
    const shown = hovered ?? selected;
    for (const t of targets) t.classList.toggle('is-active', shown !== null && slugOf(t) === shown);
    for (const r of rows) r.classList.toggle('is-active', shown !== null && r.dataset.mapRow === shown);
    if (!nameNode || !codeNode) return;
    const i = shown ? info.get(shown) : undefined;
    nameNode.textContent = i?.name ?? defaultName;
    codeNode.textContent = i ? `Boundary code ${i.code}` : defaultCode;
  };

  const setHover = (slug: string | null) => {
    if (slug === hovered) return;
    if (hovered) live?.state(hovered, { hover: false });
    hovered = slug;
    if (slug) live?.state(slug, { hover: true });
    refresh();
  };

  const setSelected = (slug: string | null, fly = true) => {
    if (selected) live?.state(selected, { selected: false });
    selected = slug;
    if (slug) live?.state(slug, { selected: true });
    live?.showCard(slug);
    refresh();
    if (slug && fly) live?.frame(slug);
  };

  /* ---------- The index and SVG work with or without the live map ---------- */
  for (const t of targets) {
    const slug = slugOf(t);
    t.addEventListener('mouseenter', () => setHover(slug));
    t.addEventListener('focusin', () => setHover(slug));
  }
  board.addEventListener('mouseleave', () => setHover(null));
  board.addEventListener('focusout', (event) => {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !board.contains(next)) setHover(null);
  });
  // Once the live map is up, a name in the index selects on the map instead of
  // leaving the page; modified clicks still open the link.
  for (const item of items) {
    item.addEventListener('click', (event) => {
      if (!live || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      setSelected(slugOf(item));
    });
  }

  if (filter && countNode) {
    const total = rows.length;
    const apply = () => {
      query = normalize(filter.value);
      let visible = 0;
      for (const row of rows) {
        const show = matches(row.dataset.mapRow ?? '');
        row.hidden = !show;
        if (show) visible += 1;
      }
      for (const shape of shapes) {
        const muted = !matches(slugOf(shape));
        shape.classList.toggle('is-muted', muted);
        live?.state(slugOf(shape), { muted });
      }
      countNode.textContent = !query ? `${total} barangays` : visible ? `${visible} of ${total} barangays` : 'No barangay matches';
    };
    filter.addEventListener('input', apply);
    filter.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && filter.value) {
        filter.value = '';
        apply();
      } else if (event.key === 'Enter') {
        // Enter picks the first match, so the index works as a finder.
        const first = rows.find((r) => !r.hidden);
        if (first && live) {
          event.preventDefault();
          setSelected(first.dataset.mapRow ?? null);
        }
      }
    });
  }

  /* ---------- The live map ---------- */
  async function start(): Promise<void> {
    if (!hasWebGL()) return; // the SVG map and the index stay
    say('Loading the map…');
    const [{ default: maplibregl }, workerUrl, data] = await Promise.all([
      import('maplibre-gl'),
      import('maplibre-gl/dist/maplibre-gl-csp-worker.js?url'),
      fetch(board.dataset.src!).then((r) => {
        if (!r.ok) throw new Error(`outlines: HTTP ${r.status}`);
        return r.json() as Promise<Collection>;
      }),
      // As a URL, not a CSS import, so the stylesheet is not render-blocking on map pages.
      import('maplibre-gl/dist/maplibre-gl.css?url').then(({ default: href }) => loadStylesheet(href)),
    ]);
    maplibregl.setWorkerUrl(workerUrl.default);

    const features = data.features.filter((f) => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');
    const bySlug = new Map(features.map((f) => [f.properties.slug, f]));
    const labels: FeatureCollection<Point, Props> = {
      type: 'FeatureCollection',
      features: features.map((f) => ({ type: 'Feature', properties: f.properties, geometry: { type: 'Point', coordinates: f.properties.center } })),
    };
    const town = (JSON.parse(board.dataset.bounds ?? 'null') as [number, number, number, number] | null) ?? boundsOf(features)?.flat();
    if (!town) throw new Error('outlines: no geometry');
    const [w, s, e, n] = town as [number, number, number, number];
    const home: LngLatBoundsLike = [[w, s], [e, n]];
    const slack = MAP_VIEW.slack;

    let threeD = true;
    let p = palette(board);
    const valueOf = (f: (typeof features)[number], m = measure) => Number(f.properties[m.property] ?? 0);
    const maxOf = (m = measure) => Math.max(Number.EPSILON, ...features.map((f) => valueOf(f, m)));
    const fmt = (n: number, m = measure) =>
      `${n.toLocaleString('en-PH', { minimumFractionDigits: m.digits, maximumFractionDigits: m.digits })} ${m.unit}`;

    /** Padding that leaves room for the controls, the legend and the card. */
    const padding = (): PaddingOptions => {
      const narrow = canvas.clientWidth < 640;
      return narrow
        ? { top: 64, bottom: card.hidden ? 40 : card.offsetHeight + 24, left: 20, right: 20 }
        : { top: 70, bottom: 70, left: 60, right: card.hidden ? 60 : 340 };
    };

    const map: MapLibreMap = new maplibregl.Map({
      container: canvas,
      style: baseStyle(p),
      bounds: home,
      fitBoundsOptions: { padding: padding() },
      maxPitch: 70,
      minZoom: MAP_VIEW.minZoom,
      maxZoom: MAP_VIEW.maxZoom,
      maxBounds: [[w - slack * 3, s - slack * 3], [e + slack * 3, n + slack * 3]],
      attributionControl: false,
      cooperativeGestures: matchMedia('(pointer: coarse)').matches,
      fadeDuration: duration(200),
      // Tiles the visitor has already seen are not fetched again within the page.
      maxTileCacheZoomLevels: 6,
    });
    const attribution = new maplibregl.AttributionControl({ compact: true, customAttribution: MAP_TILES.attribution });
    map.addControl(attribution, 'bottom-right');

    const isSelectedOrHover: ExpressionSpecification = [
      'any',
      ['boolean', ['feature-state', 'hover'], false],
      ['boolean', ['feature-state', 'selected'], false],
    ];
    const muted: ExpressionSpecification = ['boolean', ['feature-state', 'muted'], false];
    const ratio = (): ExpressionSpecification => ['/', ['to-number', ['get', measure.property], 0], maxOf()];
    const color = (): ExpressionSpecification => [
      'case',
      muted,
      p.faint,
      isSelectedOrHover,
      p.hot,
      ['interpolate', ['linear'], ratio(), 0, p.low, 1, p.high],
    ];
    // Filtered-out barangays drop flat and grey: extrusion opacity cannot vary per feature.
    const height = (): ExpressionSpecification | number => (threeD ? ['case', muted, 0, ['*', ratio(), MAP_VIEW.peak]] : 0);

    let ready = false;
    const apply3D = () => {
      map.setTerrain(threeD ? { source: 'dem', exaggeration: MAP_VIEW.terrain } : null);
      map.setPaintProperty('bgy-fill', 'fill-extrusion-height', height());
    };
    const addOverlay = () => {
      if (map.getSource('bgy')) return;
      map.addSource('bgy', { type: 'geojson', data: { type: 'FeatureCollection', features }, promoteId: 'slug' });
      map.addSource('bgy-labels', { type: 'geojson', data: labels, promoteId: 'slug' });
      map.addLayer({
        id: 'bgy-fill',
        type: 'fill-extrusion',
        source: 'bgy',
        paint: {
          'fill-extrusion-color': color(),
          'fill-extrusion-height': height(),
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.88,
          'fill-extrusion-vertical-gradient': true,
        },
      });
      map.addLayer({
        id: 'bgy-line',
        type: 'line',
        source: 'bgy',
        paint: { 'line-color': p.line, 'line-width': ['case', isSelectedOrHover, 2.4, 1.1], 'line-opacity': ['case', muted, 0.3, 1] },
      });
      map.addLayer({
        id: 'bgy-names',
        type: 'symbol',
        source: 'bgy-labels',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': [MAP_TILES.font],
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 9, 14, 14],
          'text-padding': 3,
          'text-max-width': 8,
        },
        paint: { 'text-color': p.ink, 'text-halo-color': p.halo, 'text-halo-width': 1.6, 'text-opacity': ['case', muted, 0.35, 1] },
      });
      apply3D();
    };

    /** Re-paint after a measure or theme change; tiles and camera are kept. */
    const repaint = () => {
      map.setPaintProperty('ground', 'background-color', p.land);
      map.setPaintProperty('landcover', 'fill-color', p.green);
      map.setPaintProperty('water', 'fill-color', p.water);
      map.setPaintProperty('roads', 'line-color', p.road);
      map.setPaintProperty('hillshade', 'hillshade-shadow-color', p.shadow);
      map.setPaintProperty('hillshade', 'hillshade-highlight-color', p.halo);
      map.setPaintProperty('bgy-fill', 'fill-extrusion-color', color());
      map.setPaintProperty('bgy-fill', 'fill-extrusion-height', height());
      map.setPaintProperty('bgy-line', 'line-color', p.line);
      map.setPaintProperty('bgy-names', 'text-color', p.ink);
      map.setPaintProperty('bgy-names', 'text-halo-color', p.halo);
      const label = $('[data-legend-label]');
      const maxNode = $('[data-legend-max]');
      if (label) label.textContent = measure.legend;
      if (maxNode) maxNode.textContent = fmt(maxOf());
      const legendNote = $('[data-measure-legend]');
      const note = $('[data-measure-note]');
      if (legendNote) legendNote.textContent = measure.legend.toLowerCase();
      if (note) note.textContent = measure.note;
    };

    /** Frame the whole town, tilted in 3D, so no edge is cut off by the pitch. */
    const goHome = (ms: number) =>
      map.fitBounds(home, {
        padding: padding(),
        pitch: threeD ? MAP_VIEW.pitch : 0,
        bearing: threeD ? MAP_VIEW.bearing : 0,
        duration: duration(ms),
        essential: false,
      });

    const frame = (slug: string) => {
      const f = bySlug.get(slug);
      const b = f && boundsOf([f]);
      if (!b) return;
      map.fitBounds(b, {
        padding: padding(),
        maxZoom: MAP_VIEW.focusZoom - (canvas.clientWidth < 640 ? 1 : 0),
        pitch: threeD ? MAP_VIEW.pitch - 5 : 0,
        bearing: threeD ? MAP_VIEW.bearing : 0,
        duration: duration(1100),
      });
    };

    const describe = (f: (typeof features)[number]) => {
      const strong = document.createElement('strong');
      strong.textContent = f.properties.name;
      const span = document.createElement('span');
      span.textContent = `${measure.legend}: ${fmt(valueOf(f))}`;
      return [strong, span];
    };

    const showCard = (slug: string | null) => {
      const f = slug ? bySlug.get(slug) : undefined;
      if (!f) {
        card.hidden = true;
        card.replaceChildren();
        return;
      }
      const close = Object.assign(document.createElement('button'), { type: 'button', className: 'map-card-close', textContent: '×' });
      close.setAttribute('aria-label', 'Close');
      close.addEventListener('click', () => setSelected(null, false));
      const name = Object.assign(document.createElement('p'), { className: 'map-card-name', textContent: f.properties.name });
      const dl = document.createElement('dl');
      const share = (valueOf(f) / features.reduce((sum, x) => sum + valueOf(x), 0)) * 100;
      for (const [k, v] of [
        [measure.legend, fmt(valueOf(f))],
        // A share of the measure's own total, labelled so it is not read as the town's.
        [`Share of ${measure.shareOf}`, `${share.toFixed(1)}%`],
        ['Boundary code', f.properties.code],
      ]) {
        const div = document.createElement('div');
        div.append(Object.assign(document.createElement('dt'), { textContent: k }), Object.assign(document.createElement('dd'), { textContent: v }));
        dl.append(div);
      }
      const link = Object.assign(document.createElement('a'), {
        className: 'map-card-link',
        href: `/geography#barangay-${f.properties.slug}`,
        textContent: 'In the barangay table',
      });
      card.replaceChildren(close, name, dl, link);
      card.hidden = false;
    };

    live = {
      state: (slug, state) => {
        if (!ready || !bySlug.has(slug)) return;
        map.setFeatureState({ source: 'bgy', id: slug }, state);
        map.setFeatureState({ source: 'bgy-labels', id: slug }, state);
      },
      frame,
      showCard,
    };

    /** Put every barangay's state back after the layers are (re)built. */
    const restoreStates = () => {
      for (const slug of bySlug.keys()) {
        const state = { hover: slug === hovered, selected: slug === selected, muted: !matches(slug) };
        map.setFeatureState({ source: 'bgy', id: slug }, state);
        map.setFeatureState({ source: 'bgy-labels', id: slug }, state);
      }
    };

    map.on('load', () => {
      addOverlay();
      ready = true;
      restoreStates();
      repaint();
      // Start with credits folded: on a phone they otherwise cover half the map.
      board.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
      canvas.inert = false;
      canvas.removeAttribute('aria-hidden');
      const hadFocus = fallback.contains(document.activeElement);
      fallback.setAttribute('aria-hidden', 'true');
      for (const link of fallback.querySelectorAll('a')) link.setAttribute('tabindex', '-1');
      if (hadFocus) map.getCanvas().focus();
      board.classList.add('is-ready');
      for (const el of board.querySelectorAll<HTMLElement>('[data-map-ui]')) el.hidden = false;
      say(null);
      const focus = board.dataset.focus;
      if (focus && bySlug.has(focus)) setSelected(focus);
      else goHome(1800);
    });
    map.on('error', (event) => {
      // Single tiles can fail without harm; only a failure before load matters.
      if (!ready) say('The map could not load. The outline map still works.');
      console.warn('barangay map', event.error?.message ?? event);
    });

    /* Hover, tooltip and selection on the map */
    map.on('mousemove', 'bgy-fill', (event) => {
      const slug = String(event.features?.[0]?.properties?.slug ?? '');
      const f = bySlug.get(slug);
      if (!f) return;
      map.getCanvas().style.cursor = 'pointer';
      setHover(slug);
      tip.replaceChildren(...describe(f));
      tip.hidden = false;
      const x = Math.min(event.point.x + 14, canvas.clientWidth - tip.offsetWidth - 8);
      const y = Math.min(event.point.y + 14, canvas.clientHeight - tip.offsetHeight - 8);
      tip.style.transform = `translate(${x}px, ${y}px)`;
    });
    map.on('mouseleave', 'bgy-fill', () => {
      map.getCanvas().style.cursor = '';
      setHover(null);
      tip.hidden = true;
    });
    map.on('click', (event) => {
      const hit = map.queryRenderedFeatures(event.point, { layers: ['bgy-fill'] })[0];
      setSelected(hit ? String(hit.properties.slug) : null);
    });

    /* Controls */
    const toggle = $<HTMLButtonElement>('[data-map-3d]');
    toggle?.addEventListener('click', () => {
      threeD = !threeD;
      toggle.setAttribute('aria-pressed', String(threeD));
      toggle.textContent = threeD ? '3D' : '2D';
      apply3D();
      map.easeTo({ pitch: threeD ? MAP_VIEW.pitch : 0, bearing: threeD ? MAP_VIEW.bearing : 0, duration: duration(800) });
    });
    for (const button of board.querySelectorAll<HTMLButtonElement>('[data-map-zoom]')) {
      button.addEventListener('click', () => map.zoomTo(map.getZoom() + Number(button.dataset.mapZoom), { duration: duration(300) }));
    }
    $('[data-map-reset]')?.addEventListener('click', () => {
      setSelected(null, false);
      goHome(1000);
    });
    for (const button of board.querySelectorAll<HTMLButtonElement>('[data-measure-option]')) {
      button.addEventListener('click', () => {
        measure = measureById(button.dataset.measureOption);
        for (const b of board.querySelectorAll('[data-measure-option]')) b.setAttribute('aria-checked', String(b === button));
        repaint();
        if (selected) showCard(selected);
      });
    }

    /* Theme: re-read the tokens and re-paint in place, without reloading tiles. */
    new MutationObserver(() => {
      if (!ready) return;
      p = palette(board);
      repaint();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    new ResizeObserver(() => map.resize()).observe(canvas);
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      io.disconnect();
      start().catch((error) => {
        say('The map could not load. The outline map still works.');
        console.warn('barangay map', error);
      });
    },
    { rootMargin: '400px' },
  );
  io.observe(board);
}

for (const board of document.querySelectorAll<HTMLElement>('[data-map-board]')) mount(board);

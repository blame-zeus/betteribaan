/** Behaviour for the Ibaan field guide. Every feature has a no-script fallback. */
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url';
import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import { BARANGAYS, IBAAN_GEOJSON, MAP } from '../data/town';

interface SearchEntry {
  title: string;
  description: string;
  href: string;
  section: string;
}

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/* ------------------------------------------------------------------ theme --- */
const themeToggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const themeMeta = document.querySelector<HTMLMetaElement>('[data-theme-color]');

function setTheme(theme: 'light' | 'dark'): void {
  document.documentElement.dataset.theme = theme;
  themeToggle?.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );
  if (themeMeta) themeMeta.content = theme === 'dark' ? '#0a0f17' : '#fbfbfa';
}

const currentTheme = document.documentElement.dataset.theme;
if (currentTheme === 'dark' || currentTheme === 'light') setTheme(currentTheme);

themeToggle?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  try {
    localStorage.setItem('bi-theme', next);
  } catch {
    /* Private browsing can deny storage; the theme still works for this visit. */
  }
});

/* ------------------------------------------------------------------- menu --- */
const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const primaryNav = document.querySelector<HTMLElement>('#primary-nav');

function closeMenu(): void {
  menuToggle?.setAttribute('aria-expanded', 'false');
  primaryNav?.classList.remove('open');
}

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  primaryNav?.classList.toggle('open', !open);
});

primaryNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && primaryNav?.classList.contains('open')) {
    closeMenu();
    menuToggle?.focus();
  }
});

/* ---------------------------------------------------------- header on scroll --- */
const header = document.querySelector<HTMLElement>('[data-header]');
const setHeaderState = (): void => {
  header?.classList.toggle('is-scrolled', window.scrollY > 6);
};

setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

/* ----------------------------------------------------------------- search --- */
const searchDialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]');
const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
const searchResults = document.querySelector<HTMLUListElement>('[data-search-results]');
const searchHint = document.querySelector<HTMLElement>('[data-search-hint]');

let searchData: SearchEntry[] | null = null;

async function loadSearchData(): Promise<SearchEntry[]> {
  if (!searchData) {
    const response = await fetch('/search.json');
    if (!response.ok) throw new Error(`Search data returned ${response.status}`);
    searchData = (await response.json()) as SearchEntry[];
  }
  return searchData;
}

function resultNode(entry: SearchEntry): HTMLLIElement {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = entry.href;

  const title = document.createElement('span');
  title.className = 'search-result-title';
  title.textContent = entry.title;

  const meta = document.createElement('span');
  meta.className = 'search-result-meta';
  meta.textContent = `${entry.section} · ${entry.description}`;

  link.append(title, meta);
  link.addEventListener('click', () => searchDialog?.close());
  item.append(link);
  return item;
}

function defaultResults(entries: SearchEntry[]): HTMLLIElement[] {
  return entries
    .filter((entry) => entry.section !== 'Barangay')
    .slice(0, 5)
    .map(resultNode);
}

async function renderSearch(query: string): Promise<void> {
  if (!searchResults) return;
  const q = normalize(query);
  searchResults.replaceChildren();

  try {
    const all = await loadSearchData();

    if (!q) {
      searchResults.append(...defaultResults(all));
      if (searchHint) {
        searchHint.textContent = 'Pages first. Type a barangay name to search the 26.';
      }
      return;
    }

    const matches = all
      .filter((entry) =>
        normalize(`${entry.title} ${entry.description} ${entry.section}`).includes(q),
      )
      .sort((a, b) => {
        const aTitle = normalize(a.title);
        const bTitle = normalize(b.title);
        const aStart = aTitle.startsWith(q) ? 0 : 1;
        const bStart = bTitle.startsWith(q) ? 0 : 1;
        return aStart - bStart || aTitle.localeCompare(bTitle);
      })
      .slice(0, 8);

    if (!matches.length) {
      const empty = document.createElement('li');
      empty.className = 'search-empty';
      empty.textContent = 'No page or barangay matches that name.';
      searchResults.append(empty);
      if (searchHint) searchHint.textContent = 'Try a shorter name, or browse the geography page.';
      return;
    }

    searchResults.append(...matches.map(resultNode));
    if (searchHint) {
      searchHint.textContent = `${matches.length} ${matches.length === 1 ? 'result' : 'results'} in this guide.`;
    }
  } catch {
    const error = document.createElement('li');
    error.className = 'search-empty';
    error.textContent = 'Search is unavailable. Use the geography page instead.';
    searchResults.append(error);
    if (searchHint) searchHint.textContent = 'Search could not load.';
  }
}

function openSearch(): void {
  if (!searchDialog) return;
  if (!searchDialog.open) searchDialog.showModal();
  document.body.classList.add('search-open');
  searchInput?.focus();
  void renderSearch(searchInput?.value ?? '');
}

function closeSearch(): void {
  searchDialog?.close();
}

document.querySelectorAll<HTMLElement>('[data-open-search]').forEach((button) => {
  button.addEventListener('click', openSearch);
});
document.querySelector<HTMLElement>('[data-close-search]')?.addEventListener('click', closeSearch);

searchDialog?.addEventListener('close', () => {
  document.body.classList.remove('search-open');
});
searchDialog?.addEventListener('click', (event) => {
  if (event.target === searchDialog) closeSearch();
});
searchInput?.addEventListener('input', () => void renderSearch(searchInput.value));
searchInput?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  const first = searchResults?.querySelector<HTMLAnchorElement>('a');
  if (!first) return;
  event.preventDefault();
  first.click();
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openSearch();
  }
});

/* ------------------------------------------------------------- barangay map --- */
const mapBoard = document.querySelector<HTMLElement>('[data-map-board]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface MapColors {
  land: string;
  green: string;
  water: string;
  road: string;
  line: string;
  ink: string;
  halo: string;
  low: string;
  high: string;
  shadow: string;
  building: string;
}

function cssColor(name: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  probe.style.display = 'none';
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function readMapColors(): MapColors {
  return {
    land: cssColor('--c-bg-alt'),
    green: cssColor('--c-ok-wash'),
    water: cssColor('--c-accent-wash'),
    road: cssColor('--c-line-strong'),
    line: cssColor('--c-surface'),
    ink: cssColor('--c-ink'),
    halo: cssColor('--c-surface'),
    low: cssColor('--c-accent-wash'),
    high: cssColor('--c-accent'),
    shadow: cssColor('--c-ink'),
    building: cssColor('--c-map-side'),
  };
}

const mapLabels = {
  type: 'FeatureCollection' as const,
  features: IBAAN_GEOJSON.features.map((feature) => ({
    type: 'Feature' as const,
    properties: feature.properties,
    geometry: { type: 'Point' as const, coordinates: feature.properties.center },
  })),
};

function mapStyle(colors: MapColors): StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
      dem: {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 14,
        attribution: 'Terrain: Mapzen, AWS Terrain Tiles',
      },
      ibaan: { type: 'geojson', data: IBAAN_GEOJSON, promoteId: 'code' },
      'ibaan-labels': { type: 'geojson', data: mapLabels },
    },
    layers: [
      { id: 'ground', type: 'background', paint: { 'background-color': colors.land } },
      {
        id: 'landcover',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landcover',
        paint: { 'fill-color': colors.green, 'fill-opacity': 0.55 },
      },
      {
        id: 'landuse',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landuse',
        paint: { 'fill-color': colors.land, 'fill-opacity': 0.4 },
      },
      {
        id: 'water',
        type: 'fill',
        source: 'omt',
        'source-layer': 'water',
        paint: { 'fill-color': colors.water },
      },
      {
        id: 'hillshade',
        type: 'hillshade',
        source: 'dem',
        paint: {
          'hillshade-shadow-color': colors.shadow,
          'hillshade-highlight-color': colors.halo,
          'hillshade-exaggeration': 0.2,
        },
      },
      {
        id: 'roads',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor']]],
        paint: {
          'line-color': colors.road,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.6, 15, ['match', ['get', 'class'], ['primary', 'trunk', 'secondary'], 3, 1.2]],
        },
      },
      {
        id: 'barangay-fill',
        type: 'fill',
        source: 'ibaan',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false], colors.high,
            ['boolean', ['feature-state', 'selected'], false], colors.high,
            colors.low,
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'muted'], false], 0.03,
            ['boolean', ['feature-state', 'hover'], false], 0.28,
            ['boolean', ['feature-state', 'selected'], false], 0.28,
            0.13,
          ],
        },
      },
      {
        id: 'iba-buildings',
        type: 'fill-extrusion',
        source: 'omt',
        'source-layer': 'building',
        paint: {
          'fill-extrusion-color': colors.building,
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 12],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.4,
          'fill-extrusion-vertical-gradient': true,
        },
      },
      {
        id: 'barangay-line',
        type: 'line',
        source: 'ibaan',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false], colors.high,
            ['boolean', ['feature-state', 'selected'], false], colors.high,
            ['boolean', ['feature-state', 'muted'], false], colors.road,
            colors.high,
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'muted'], false], 0.6,
            ['boolean', ['feature-state', 'hover'], false], 3.2,
            ['boolean', ['feature-state', 'selected'], false], 3.2,
            1.7,
          ],
          'line-opacity': ['case', ['boolean', ['feature-state', 'muted'], false], 0.45, 1],
        },
      },
      {
        id: 'barangay-labels',
        type: 'symbol',
        source: 'ibaan-labels',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 9, 14, 13],
          'text-allow-overlap': false,
          'text-padding': 4,
          'text-max-width': 10,
        },
        paint: { 'text-color': colors.ink, 'text-halo-color': colors.halo, 'text-halo-width': 1.5 },
      },
    ],
  };
}

const board = mapBoard;

if (board) {
  const viewToggle = board.querySelector<HTMLButtonElement>('[data-map-3d]');
  const resetButton = board.querySelector<HTMLButtonElement>('[data-map-reset]');
  const canvas = board.querySelector<HTMLElement>('[data-map-canvas]');
  const fallback = board.querySelector<HTMLElement>('[data-map-fallback]');
  const status = board.querySelector<HTMLElement>('[data-map-status]');
  const uiControls = [...board.querySelectorAll<HTMLElement>('[data-map-ui]')];
  const shapes = [...board.querySelectorAll<Element>('[data-map-shape]')];
  const items = [...board.querySelectorAll<Element>('[data-map-item]')];
  const rows = [...board.querySelectorAll<HTMLElement>('[data-map-row]')];
  const nameNode = board.querySelector<HTMLElement>('[data-map-name]');
  const codeNode = board.querySelector<HTMLElement>('[data-map-code]');
  const countNode = board.querySelector<HTMLElement>('[data-map-count]');
  const filter = board.querySelector<HTMLInputElement>('[data-map-filter]');
  const targets = [...shapes, ...items];
  const defaultName = nameNode?.textContent ?? 'Ibaan';
  const defaultCode = codeNode?.textContent ?? '';
  const codeBySlug = new Map(BARANGAYS.map((barangay) => [barangay.slug, barangay.code]));
  const slugByCode = new Map(BARANGAYS.map((barangay) => [barangay.code, barangay.slug]));

  let activeSlug: string | null = null;
  let selectedSlug: string | null = null;
  let currentQuery = '';
  let map: MapLibreMap | null = null;
  let focusMap: ((slug: string) => void) | null = null;
  let setMapMode: ((enabled: boolean) => void) | null = null;
  let resetMap: (() => void) | null = null;

  const setStatus = (message: string | null): void => {
    if (!status) return;
    status.hidden = message === null;
    status.textContent = message ?? '';
  };

  const stateOf = (slug: string | null, state: Record<string, boolean>): void => {
    const code = slug ? codeBySlug.get(slug) : undefined;
    if (!map?.loaded() || !map.getSource('ibaan') || !code) return;
    map.setFeatureState({ source: 'ibaan', id: code }, state);
  };

  const refresh = (): void => {
    const shown = activeSlug ?? selectedSlug;
    targets.forEach((target) => {
      const slug = slugOf(target);
      target.classList.toggle('is-active', shown !== null && slug === shown);
    });
    rows.forEach((row) => {
      row.classList.toggle('is-active', shown !== null && row.dataset.mapRow === shown);
    });

    if (!nameNode || !codeNode) return;
    if (!shown) {
      nameNode.textContent = defaultName;
      codeNode.textContent = defaultCode;
      return;
    }
    const source = targets.find((target) => slugOf(target) === shown);
    nameNode.textContent = source?.getAttribute('data-name') ?? defaultName;
    const code = source?.getAttribute('data-code');
    codeNode.textContent = code ? `Boundary code ${code}` : defaultCode;
  };

  const setActive = (slug: string | null): void => {
    if (slug === activeSlug) return;
    if (activeSlug) stateOf(activeSlug, { hover: false });
    activeSlug = slug;
    if (slug) stateOf(slug, { hover: true });
    refresh();
  };

  const setSelected = (slug: string | null, fly = true): void => {
    if (selectedSlug) stateOf(selectedSlug, { selected: false });
    selectedSlug = slug;
    if (slug) stateOf(slug, { selected: true });
    refresh();
    if (slug && fly) focusMap?.(slug);
  };

  const slugOf = (element: Element): string =>
    element.getAttribute('data-map-shape') ?? element.getAttribute('data-map-item') ?? '';

  const bind = (element: Element): void => {
    const slug = slugOf(element);
    element.addEventListener('mouseenter', () => setActive(slug));
    element.addEventListener('focusin', () => setActive(slug));
  };

  targets.forEach(bind);

  board.addEventListener('mouseleave', () => setActive(null));
  board.addEventListener('focusout', (event) => {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !board.contains(next)) setActive(null);
  });

  const matchesQuery = (name: string, code: string, query: string): boolean =>
    normalize(`${name} ${code}`).includes(query);

  if (filter && countNode) {
    const total = rows.length;

    const applyFilter = (): void => {
      currentQuery = normalize(filter.value);
      let visible = 0;

      rows.forEach((row) => {
        const item = row.querySelector<HTMLElement>('[data-map-item]');
        const show = matchesQuery(
          item?.getAttribute('data-name') ?? '',
          item?.getAttribute('data-code') ?? '',
          currentQuery,
        );
        row.hidden = !show;
        if (show) visible += 1;
      });

      shapes.forEach((shape) => {
        const muted = Boolean(currentQuery) && !matchesQuery(
          shape.getAttribute('data-name') ?? '',
          shape.getAttribute('data-code') ?? '',
          currentQuery,
        );
        shape.classList.toggle('is-muted', muted);
      });

      if (map?.loaded() && map.getSource('ibaan')) {
        BARANGAYS.forEach((barangay) => {
          const muted = Boolean(currentQuery) && !matchesQuery(barangay.name, barangay.code, currentQuery);
          map?.setFeatureState({ source: 'ibaan', id: barangay.code }, { muted });
        });
      }

      if (!currentQuery) countNode.textContent = `${total} barangays`;
      else if (visible === 0) countNode.textContent = 'No barangay matches';
      else countNode.textContent = `${visible} of ${total} barangays`;
    };

    filter.addEventListener('input', applyFilter);
    filter.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        filter.value = '';
        applyFilter();
      }
    });
  }

  viewToggle?.addEventListener('click', () => {
    const enabled = viewToggle.getAttribute('aria-pressed') !== 'true';
    setMapMode?.(enabled);
    viewToggle.setAttribute('aria-pressed', String(enabled));
    viewToggle.textContent = enabled ? '3D view' : '2D view';
  });

  resetButton?.addEventListener('click', () => {
    setSelected(null, false);
    resetMap?.();
  });

  async function initMap(): Promise<void> {
    const probe = document.createElement('canvas');
    if (!probe.getContext('webgl2') && !probe.getContext('webgl')) {
      setStatus('The interactive map needs WebGL. The flat outline is still available.');
      return;
    }

    setStatus('Loading the map…');
    try {
      const { default: maplibregl } = await import('maplibre-gl');
      if (!canvas) return;
      maplibregl.setWorkerUrl(maplibreWorkerUrl);

      const west = MAP.ibaan.bounds[0] - 0.04;
      const south = MAP.ibaan.bounds[1] - 0.04;
      const east = MAP.ibaan.bounds[2] + 0.04;
      const north = MAP.ibaan.bounds[3] + 0.04;
      const initialView = {
        center: MAP.ibaan.center as [number, number],
        zoom: 11.6,
        pitch: reducedMotion ? 0 : 52,
        bearing: reducedMotion ? 0 : -18,
      };
      let threeDee = !reducedMotion;

      map = new maplibregl.Map({
        container: canvas,
        style: mapStyle(readMapColors()),
        center: initialView.center,
        zoom: initialView.zoom - 0.6,
        pitch: 0,
        bearing: 0,
        maxPitch: 70,
        minZoom: 9.5,
        maxZoom: 16.5,
        maxBounds: [[west, south], [east, north]],
        attributionControl: false,
        cooperativeGestures: window.matchMedia('(pointer: coarse)').matches,
        fadeDuration: reducedMotion ? 0 : 180,
      });

      map.addControl(new maplibregl.AttributionControl({
        compact: true,
        customAttribution:
          '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> · Terrain: Mapzen/AWS · <a href="/sources">boundary sources</a>',
      }));

      const applyFeatureStates = (): void => {
        if (!map?.loaded() || !map.getSource('ibaan')) return;
        BARANGAYS.forEach((barangay) => {
          const muted = Boolean(currentQuery) && !matchesQuery(barangay.name, barangay.code, currentQuery);
          map?.setFeatureState(
            { source: 'ibaan', id: barangay.code },
            {
              muted,
              hover: barangay.slug === activeSlug,
              selected: barangay.slug === selectedSlug,
            },
          );
        });
      };

      const applyMode = (duration = reducedMotion ? 0 : 800): void => {
        if (!map?.loaded()) return;
        map.setTerrain(threeDee && map.getSource('dem') ? { source: 'dem', exaggeration: 1.4 } : null);
        if (map.getLayer('iba-buildings')) {
          map.setLayoutProperty('iba-buildings', 'visibility', threeDee ? 'visible' : 'none');
        }
        map.easeTo({
          pitch: threeDee ? initialView.pitch : 0,
          bearing: threeDee ? initialView.bearing : 0,
          duration,
        });
      };

      focusMap = (slug: string): void => {
        const feature = IBAAN_GEOJSON.features.find((item) => item.properties.slug === slug);
        if (!feature || !map) return;
        const rings = feature.geometry.type === 'Polygon'
          ? feature.geometry.coordinates
          : feature.geometry.coordinates.flat();
        const points = rings.flat();
        if (!points.length) return;
        const start = points[0] as [number, number];
        const bounds = points.reduce(
          (aggregate, point) => aggregate.extend(point as [number, number]),
          new maplibregl.LngLatBounds(start, start),
        );
        map.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 48, right: 48 },
          maxZoom: 13.4,
          pitch: threeDee ? 48 : 0,
          duration: reducedMotion ? 0 : 900,
        });
      };

      setMapMode = (enabled: boolean): void => {
        threeDee = enabled;
        applyMode();
      };

      resetMap = (): void => {
        map?.easeTo({
          ...initialView,
          pitch: threeDee ? initialView.pitch : 0,
          bearing: threeDee ? initialView.bearing : 0,
          duration: reducedMotion ? 0 : 1000,
        });
      };

      map.on('load', () => {
        if (!map || !canvas || !fallback) return;
        canvas.inert = false;
        canvas.removeAttribute('aria-hidden');
        fallback.setAttribute('aria-hidden', 'true');
        fallback.querySelectorAll('a').forEach((link) => link.setAttribute('tabindex', '-1'));
        board!.classList.add('is-ready');
        uiControls.forEach((control) => { control.hidden = false; });
        if (viewToggle) {
          viewToggle.setAttribute('aria-pressed', String(threeDee));
          viewToggle.textContent = threeDee ? '3D view' : '2D view';
        }
        setStatus(null);
        applyFeatureStates();
        applyMode(0);
        if (!reducedMotion) {
          map.easeTo({ ...initialView, duration: 1800, essential: false });
        }
      });

      map.on('error', (event) => {
        if (map && !map.loaded()) {
          setStatus('The map could not load. The flat outline is still available.');
        }
        console.warn('Ibaan map', event.error?.message ?? event);
      });

      map.on('mousemove', 'barangay-fill', (event) => {
        const slug = String(event.features?.[0]?.properties?.slug ?? '');
        if (!slug) return;
        map?.getCanvas().style.setProperty('cursor', 'pointer');
        setActive(slug);
      });

      map.on('mouseleave', 'barangay-fill', () => {
        map?.getCanvas().style.removeProperty('cursor');
        setActive(null);
      });

      map.on('click', 'barangay-fill', (event) => {
        const slug = slugByCode.get(String(event.features?.[0]?.properties?.code ?? ''));
        if (slug) setSelected(slug);
      });

      new MutationObserver(() => {
        if (!map?.loaded()) return;
        map.setStyle(mapStyle(readMapColors()));
        map.once('styledata', () => {
          applyFeatureStates();
          applyMode(0);
        });
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      new ResizeObserver(() => map?.resize()).observe(canvas);
    } catch (error) {
      setStatus('The map could not load. The flat outline is still available.');
      console.warn('Ibaan map', error);
    }
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void initMap();
      },
      { rootMargin: '300px' },
    );
    observer.observe(board);
  } else {
    void initMap();
  }
}

/* -------------------------------------------------------------- reveal/motion --- */
if (!reducedMotion) {
  document.documentElement.classList.add('js-motion');

  const heroTitle = document.querySelector<HTMLElement>('.hero-title');
  if (heroTitle) {
    heroTitle.querySelectorAll<HTMLElement>(':scope > span').forEach((span, index) => {
      span.style.setProperty('--i', String(index));
    });
  }

  requestAnimationFrame(() => {
    document.documentElement.classList.add('is-loaded');
  });

  const revealSelectors = [
    'main .hero-foot',
    'main .hero-facts',
    'main .section-head',
    'main .page-head-inner',
    'main .heritage-feature-grid',
    'main .heritage-grid',
    'main .context-grid > *',
    'main .photo-strip figure',
    'main .record-panel',
    'main .prose-wide > *',
    'main .characteristics > li',
    'main .conservation-grid > *',
    'main .source-groups > section',
    'main .credit-list li',
    'main .stats-grid',
    'main .figure-notes > *',
    'main .note-panel',
    'main .table-head',
    'main .table-wrap',
    'main .not-found-actions',
    'main .heritage-dark-grid > *',
  ];
  const revealItems = [...document.querySelectorAll<HTMLElement>(revealSelectors.join(','))];
  revealItems.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.setProperty('--reveal-delay', `${(index % 4) * 60}ms`);
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));

    if (mapBoard) {
      const mapObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            mapBoard.classList.add('is-in');
            mapObserver.disconnect();
          });
        },
        { threshold: 0.15 },
      );
      mapObserver.observe(mapBoard);
    }
  } else {
    revealItems.forEach((item) => item.classList.add('in'));
    mapBoard?.classList.add('is-in');
  }
}

if (mapBoard && reducedMotion) mapBoard.classList.add('is-in');

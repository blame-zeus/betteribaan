# AGENTS.md — working on Better Ibaan

Read this before changing anything. It is the shared guide for every AI agent (Claude Code,
Codex, Cursor, Copilot, …) and new contributor. When you change how something works, update
this file in the same commit.

- **What this is:** a sourced civic field guide to Ibaan, Batangas: its 26 barangays,
  geography, heritage and public record. Independent; not the municipal website.
- **Stack:** Astro 5 (static output, no adapter, no backend), TypeScript, Vitest.
  Node ≥ 22.12. Hosted on Vercel, which builds from source.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at `http://localhost:4321` |
| `npm run check` | **The gate:** `astro check` + tests + production build. Must pass before every commit. |
| `npm run lint` | Design house-style lint (`scripts/lint.mjs`). Keep it at 0 FAIL. |
| `npm run data:map` | Rebuild `src/data/iba-an-map.json` from the boundary files |

## Rules

1. **Every figure has a source.** Never invent or estimate a number, name or date. If a source
   cannot be reached, record it as "Could not verify" in `src/data/ibaan-record.ts`; do not guess.
2. **Say what a figure is not.** The boundary file's barangay areas (70.35 km² in all) are not
   the official land area (68.99 km²). Wherever they are shown, say so.
3. **Colours come from tokens** (`src/styles/tokens.css`), defined for light and dark.
4. **Generated data** (`src/data/iba-an-map.json`) comes from `scripts/build-map-data.mjs`.
   Change the script and re-run it; never hand-edit the output.
5. **Build output is not source.** Never edit or commit changes to `dist/`, `.astro/` or
   `node_modules/`; Vercel builds from source.

## The barangay map

One component, used on `/`, `/geography`, `/barangays` and `/infrastructure`:

| File | Role |
| --- | --- |
| `src/components/BarangayMap.astro` | Markup: SVG fallback map, live-map overlays, barangay index |
| `src/scripts/barangay-map.ts` | Browser behaviour, imported only by the component |
| `src/lib/map-config.ts` | Measures, camera, tile URLs and credits: change the map here |
| `src/pages/data/barangays.geojson.ts` | The outlines the live map fetches |
| `scripts/build-map-data.mjs` | Builds the outlines, SVG paths and labels |

**How it loads.** The server renders an SVG map in which every barangay is a link, plus a
filterable index, so the map works without JavaScript or WebGL. When the map comes within
400 px of the viewport, the script loads MapLibre, its stylesheet and the outlines, then
fades the live map in. Pages without the component load none of this. Keep it that way:
`ui.ts` (loaded on every page) must never import MapLibre or `data/town.ts`.

**Outside requests.** OpenFreeMap (basemap, label fonts) and AWS Terrain Tiles (elevation),
only on map pages and only once the map nears the viewport. `/sources` names them.

**Behaviour.**
- In 3D, barangays rise and shade by the current measure over real terrain. 2D is flat.
- Hovering shows a tooltip. Clicking a barangay or an index name selects it: clay highlight,
  camera framing and a card. Enter in the filter selects the first match.
- The filter flattens and greys barangays that do not match.
- A theme switch re-reads the tokens and repaints in place; tiles are not reloaded.
- Reduced motion turns camera animation off.

**Adding a measure** (for example population, once PSA barangay counts are reachable):

1. Add the number to every feature in `/data/barangays.geojson` via `scripts/build-map-data.mjs`.
2. Add an entry to `MAP_MEASURES` in `src/lib/map-config.ts`. It needs a `note` stating the
   source and its limits. No source, no measure.
3. Run `npm run check`. The tests require every measure to exist on every outline.

With two or more measures, a "Raise barangays by" switch appears on the map by itself.

**Component props.** `id` (an element-id prefix; give each map on one page its own), `measure`
(the starting measure), `focus` (a barangay slug to open framed and selected), `mapTitle`,
`mapDescription`.

**Gotchas.**
- MapLibre 5 uses the worker at `maplibre-gl/dist/maplibre-gl-csp-worker.js?url`. A v6 upgrade
  changes that path.
- `astro.config.mjs` pre-bundles `maplibre-gl` (`optimizeDeps.include`). Without that, the dev
  server re-optimises mid-session and the lazy import fails.
- Browsers report `color-mix()` as `color(srgb …)`, which MapLibre cannot parse. Go through
  `token()` in the script.
- `fill-extrusion-opacity` cannot vary per feature. To fade a barangay, change its colour or
  height through feature state.

## Verifying a change

1. `npm run check` and `npm run lint`.
2. For UI changes, open the dev server and check light and dark, desktop and 390 px, and the
   keyboard (filter, Enter, map controls). A map change also needs a check that `/about`
   requests no MapLibre or GeoJSON file.

/**
 * Settings for the interactive barangay map (components/BarangayMap.astro and
 * scripts/barangay-map.ts), kept in one place so the map can change without
 * touching its code.
 *
 * This file is imported by both the server (Astro) and the browser script, so
 * it must stay small: no data files, no MapLibre import.
 */

/** A per-barangay figure the map can raise and shade barangays by. */
export interface MapMeasure {
  /** Stable id, used in `data-measure` and the component's `measure` prop. */
  id: string;
  /** Short label for the measure switch. */
  label: string;
  /** Legend heading. */
  legend: string;
  /** The GeoJSON feature property that holds the number. */
  property: string;
  /** Unit shown after the number in the tooltip, card and legend. */
  unit: string;
  /** Decimal places when the number is shown. */
  digits: number;
  /** What the card's share is a share of, e.g. "file total". Never imply the official town total. */
  shareOf: string;
  /**
   * Where the number comes from and what it is not. Shown under the legend.
   * A measure without a source must not be added.
   */
  note: string;
}

/**
 * Every measure the map offers. To add one (for example barangay population
 * once a PSA table is reachable): add the number to each feature in
 * `/data/barangays.geojson`, then add an entry here. The switch, legend,
 * tooltip and card pick it up; the switch only appears with two or more.
 */
export const MAP_MEASURES: readonly MapMeasure[] = [
  {
    id: 'area',
    label: 'Area',
    legend: 'Boundary-file area',
    property: 'areaKm2',
    unit: 'km²',
    digits: 2,
    shareOf: 'file total',
    note: 'Areas come from the 2023 OCHA COD-AB boundary file (70.35 km² in all), not the official 68.99 km² land area.',
  },
];

export const DEFAULT_MEASURE = MAP_MEASURES[0].id;

export const measureById = (id: string | undefined): MapMeasure =>
  MAP_MEASURES.find((m) => m.id === id) ?? MAP_MEASURES[0];

export const MAP_VIEW = {
  /** Height, in metres, of the barangay with the largest value: readable, not a skyline. */
  peak: 600,
  /** Terrain exaggeration in 3D. Ibaan is gently rolling, so a little more than true. */
  terrain: 1.5,
  pitch: 55,
  bearing: -18,
  /** How far beyond the town's outline the camera may pan, in degrees. */
  slack: 0.05,
  minZoom: 10,
  maxZoom: 16.5,
  /** The closest the camera gets when it frames one barangay. */
  focusZoom: 14,
} as const;

/** Basemap, labels and elevation. These are the map's only outside requests. */
export const MAP_TILES = {
  vector: 'https://tiles.openfreemap.org/planet',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  font: 'Noto Sans Bold',
  dem: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
  attribution:
    '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · Terrain: Mapzen/AWS · <a href="/sources">Boundary sources</a>',
} as const;

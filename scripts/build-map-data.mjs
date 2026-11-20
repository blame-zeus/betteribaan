#!/usr/bin/env node
/**
 * Build the map data used by the site:
 *
 *   - 26 barangay outlines for Ibaan, projected to a local SVG viewBox for
 *     the no-script fallback;
 *   - the same outlines as GeoJSON for the OpenStreetMap-based interactive map;
 *   - Ibaan inside the municipalities and component cities of Batangas.
 *
 * Source: PSA/NAMRIA 2023 administrative boundaries, as published in the
 * barangay-boundaries-repository. The published polygons are simplified
 * (roughly 500 m), so the outputs are orientation maps, not survey data.
 *
 * Run: npm run data:map
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const CACHE = resolve(ROOT, '.data-cache');
const OUT = resolve(ROOT, 'src/data/iba-an-map.json');
const BASE =
  'https://raw.githubusercontent.com/bendlikeabamboo/barangay-boundaries-repository/main/2023-10-24/hierarchical_t0p005';

const SOURCES = {
  barangays: `${BASE}/barangays.geojson`,
  municipalities: `${BASE}/municipalities.geojson`,
  cities: `${BASE}/component_cities.geojson`,
  provinces: `${BASE}/provinces.geojson`,
};

async function load(name, url) {
  mkdirSync(CACHE, { recursive: true });
  const cache = resolve(CACHE, `${name}.geojson`);
  if (existsSync(cache)) return JSON.parse(readFileSync(cache, 'utf8'));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  const text = await response.text();
  writeFileSync(cache, text);
  return JSON.parse(text);
}

const ringsOf = (geometry) => {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return geometry.coordinates;
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat();
  return [];
};

const largestRing = (geometry) => {
  const rings = ringsOf(geometry);
  return rings.reduce((best, ring) => (ring.length > best.length ? ring : best), rings[0] ?? []);
};

function makeProjection(features, { size = 1000, pad = 28, width, height } = {}) {
  const points = features.flatMap((feature) =>
    ringsOf(feature.geometry).flatMap((ring) => ring));
  const lons = points.map((point) => point[0]);
  const lats = points.map((point) => point[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const midLat = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const aspect = ((maxLon - minLon) * Math.cos(midLat)) / (maxLat - minLat);

  let vbWidth;
  let vbHeight;
  if (width && height) {
    vbWidth = width;
    vbHeight = height;
  } else if (aspect >= 1) {
    vbWidth = size;
    vbHeight = Math.round(size / aspect);
  } else {
    vbHeight = size;
    vbWidth = Math.round(size * aspect);
  }

  const scale = Math.min((vbWidth - pad * 2) / ((maxLon - minLon) * Math.cos(midLat)),
    (vbHeight - pad * 2) / (maxLat - minLat));
  const offsetX = (vbWidth - (maxLon - minLon) * Math.cos(midLat) * scale) / 2;
  const offsetY = (vbHeight - (maxLat - minLat) * scale) / 2;

  const project = ([lon, lat]) => [
    +(offsetX + (lon - minLon) * Math.cos(midLat) * scale).toFixed(1),
    +(offsetY + (maxLat - lat) * scale).toFixed(1),
  ];

  return { project, vbWidth, vbHeight, minLon, maxLon, minLat, maxLat };
}

const pathFor = (geometry, project) =>
  ringsOf(geometry)
    .filter((ring) => ring.length >= 3)
    .map((ring) => {
      const [first, ...rest] = ring.map(project);
      return `M${first[0]} ${first[1]}${rest.map(([x, y]) => `L${x} ${y}`).join('')}Z`;
    })
    .join('');

function centroidOf(geometry, project) {
  const ring = largestRing(geometry);
  if (!ring.length) return [0, 0];
  const points = ring.map(project);
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[index + 1];
    const factor = x1 * y2 - x2 * y1;
    twiceArea += factor;
    cx += (x1 + x2) * factor;
    cy += (y1 + y2) * factor;
  }
  if (Math.abs(twiceArea) < 0.001) {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  }
  return [cx / (3 * twiceArea), cy / (3 * twiceArea)];
}

/** Longitude/latitude centroid, used only for interactive map labels. */
function geoCentroid(geometry) {
  const ring = largestRing(geometry);
  if (!ring.length) return [0, 0];
  let twiceArea = 0;
  let x = 0;
  let y = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    const factor = x1 * y2 - x2 * y1;
    twiceArea += factor;
    x += (x1 + x2) * factor;
    y += (y1 + y2) * factor;
  }
  if (Math.abs(twiceArea) < 1e-12) {
    const lons = ring.map(([lon]) => lon);
    const lats = ring.map(([, lat]) => lat);
    return [(Math.min(...lons) + Math.max(...lons)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
  }
  return [x / (3 * twiceArea), y / (3 * twiceArea)];
}

const slugify = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const [barangays, municipalities, cities] = await Promise.all([
  load('barangays', SOURCES.barangays),
  load('municipalities', SOURCES.municipalities),
  load('component_cities', SOURCES.cities),
]);

const ibaanFeatures = barangays.features
  .filter((feature) => feature.properties.ADM3_EN === 'Ibaan')
  .map((feature) => ({
    ...feature,
    name: feature.properties.ADM4_EN,
    code: feature.properties.psgc_code,
    area: feature.properties.AREA_SQKM,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

if (ibaanFeatures.length !== 26) {
  throw new Error(`Expected 26 Ibaan barangays, found ${ibaanFeatures.length}`);
}

const ibaanProjection = makeProjection(ibaanFeatures);
const labelsShown = new Set([
  'Bago', 'Bungahan', 'Calamias', 'Catandala', 'Lucsuhin', 'Mabalor',
  'Malainin', 'Pangao', 'Panghayaan', 'Poblacion', 'Quilo', 'Sabang',
  'Salaban II', 'San Agustin', 'Santo Niño',
]);

const allPoints = ibaanFeatures.flatMap((feature) => ringsOf(feature.geometry).flat());
const bounds = [
  Math.min(...allPoints.map(([lon]) => lon)),
  Math.min(...allPoints.map(([, lat]) => lat)),
  Math.max(...allPoints.map(([lon]) => lon)),
  Math.max(...allPoints.map(([, lat]) => lat)),
].map((value) => +value.toFixed(6));

const geojson = {
  type: 'FeatureCollection',
  bbox: bounds,
  features: ibaanFeatures.map((feature) => {
    const [lon, lat] = geoCentroid(feature.geometry);
    return {
      type: 'Feature',
      id: feature.code,
      properties: {
        name: feature.name,
        slug: slugify(feature.name),
        code: feature.code,
        areaKm2: +Number(feature.area).toFixed(2),
        center: [+lon.toFixed(6), +lat.toFixed(6)],
      },
      geometry: feature.geometry,
    };
  }),
};

const ibaan = {
  viewBox: `0 0 ${ibaanProjection.vbWidth} ${ibaanProjection.vbHeight}`,
  bounds,
  center: [
    +((bounds[0] + bounds[2]) / 2).toFixed(6),
    +((bounds[1] + bounds[3]) / 2).toFixed(6),
  ],
  geojson,
  barangays: ibaanFeatures.map((feature) => {
    const [x, y] = centroidOf(feature.geometry, ibaanProjection.project);
    return {
      name: feature.name,
      slug: slugify(feature.name),
      code: feature.code,
      areaKm2: +Number(feature.area).toFixed(2),
      path: pathFor(feature.geometry, ibaanProjection.project),
      label: { x: +x.toFixed(1), y: +y.toFixed(1) },
      showLabel: labelsShown.has(feature.name),
    };
  }),
};

const batangasFeatures = [
  ...municipalities.features,
  ...cities.features,
]
  .filter((feature) => feature.properties.ADM2_EN === 'Batangas')
  .map((feature) => ({
    ...feature,
    name: feature.properties.ADM3_EN
      .replace(' (Capital)', '')
      .replace(/^City of /, '')
      .replace(/^Sto\. /, 'Santo '),
    officialName: feature.properties.ADM3_EN,
  }));

const batangasProjection = makeProjection(batangasFeatures, { size: 1000, pad: 24 });
const NEIGHBOURS = ['San Jose', 'Lipa City', 'Rosario', 'Taysan', 'Batangas City'];

const ibaanMunicipality = batangasFeatures.find((feature) => feature.name === 'Ibaan');
if (!ibaanMunicipality) throw new Error('Ibaan is missing from the Batangas context map');
const [ibaanX, ibaanY] = centroidOf(ibaanMunicipality.geometry, batangasProjection.project);

const batangas = {
  viewBox: `0 0 ${batangasProjection.vbWidth} ${batangasProjection.vbHeight}`,
  ibaanLabel: { x: +ibaanX.toFixed(1), y: +ibaanY.toFixed(1) },
  municipalities: batangasFeatures.map((feature) => ({
    name: feature.name,
    slug: slugify(feature.name),
    isIbaan: feature.name === 'Ibaan',
    path: pathFor(feature.geometry, batangasProjection.project),
  })),
  neighbourLabels: batangasFeatures
    .filter((feature) => NEIGHBOURS.includes(feature.name))
    .map((feature) => {
      const [x, y] = centroidOf(feature.geometry, batangasProjection.project);
      return { name: feature.name, x: +x.toFixed(1), y: +y.toFixed(1) };
    }),
};

const output = {
  generated: '2026-11-20',
  source: {
    label: 'PSA / NAMRIA 2023 administrative boundaries',
    note: 'Simplified polygons for orientation; not survey data.',
    barangays: SOURCES.barangays,
    municipalities: SOURCES.municipalities,
    cities: SOURCES.cities,
  },
  ibaan,
  batangas,
};

writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Ibaan: ${ibaan.barangays.length} barangays, viewBox ${ibaan.viewBox}`);
console.log(`Batangas: ${batangas.municipalities.length} municipalities and cities, viewBox ${batangas.viewBox}`);
console.log(batangas.neighbourLabels.map((label) => `${label.name} (${label.x}, ${label.y})`).join('\n'));

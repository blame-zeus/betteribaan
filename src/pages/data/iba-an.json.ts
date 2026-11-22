import type { APIRoute } from 'astro';
import { BARANGAYS, MAP, NEIGHBOURS, TOWN } from '../../data/town';
import { OFFICIAL } from '../../lib/site';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    generated: MAP.generated,
    about:
      'Ibaan, Batangas: a sourced town profile, barangay list, and source-detailed map geometry for orientation.',
    town: {
      name: TOWN.name,
      province: TOWN.province,
      region: TOWN.region,
      country: TOWN.country,
      className: TOWN.className,
      landAreaKm2: TOWN.landAreaKm2,
      landAreaShareOfBatangasPercent: TOWN.landAreaShare,
      population: TOWN.population,
      households: TOWN.households,
      censusYear: TOWN.censusYear,
      barangayCount: TOWN.barangayCount,
      coordinates: TOWN.coordinates,
      distanceToBatangasCityKm: TOWN.distanceToBatangasCityKm,
    },
    neighbours: NEIGHBOURS,
    barangays: BARANGAYS.map((barangay) => ({
      name: barangay.name,
      slug: barangay.slug,
      boundaryCode: barangay.code,
      mapAreaKm2: barangay.areaKm2,
      mapPath: barangay.path,
      mapLabel: barangay.label,
    })),
    mapNote:
      'Barangay geometry is from OCHA COD-AB / NAMRIA / PSA administrative boundaries, 2023-11-06, with source vertex detail retained. It is for orientation only. Boundary codes come from the boundary file and are not presented as verified PSGC codes. The 26 mapped polygons sum to about 70.35 km2; the official municipal land area is 68.99 km2.',
    sources: {
      municipalProfile: OFFICIAL.profile,
      municipalHome: OFFICIAL.home,
      ibaTree: OFFICIAL.ibaTree,
      naturalHeritage: OFFICIAL.naturalHeritage,
      boundaries: MAP.source.barangaysUrl,
    },
  });

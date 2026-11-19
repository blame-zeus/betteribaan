import type { APIRoute } from 'astro';
import { BARANGAYS, MAP, NEIGHBOURS, TOWN } from '../../data/town';
import { OFFICIAL } from '../../lib/site';

export const GET: APIRoute = () => {
  const payload = {
    generated: MAP.generated,
    about:
      'Ibaan, Batangas: a sourced town profile, barangay list, and simplified map geometry for orientation.',
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
      psgc: barangay.code,
      mapAreaKm2: barangay.areaKm2,
      mapPath: barangay.path,
      mapLabel: barangay.label,
    })),
    mapNote:
      'Map geometry is from PSA/NAMRIA 2023 administrative boundaries, simplified at roughly 500 m. It is for orientation only. The mapped area of the 26 simplified polygons sums to about 70.32 km2; the official municipal land area is 68.99 km2.',
    sources: {
      municipalProfile: OFFICIAL.profile,
      municipalHome: OFFICIAL.home,
      ibaTree: OFFICIAL.ibaTree,
      naturalHeritage: OFFICIAL.naturalHeritage,
      boundaries: MAP.source.barangays,
    },
  };

  return new Response(`${JSON.stringify(payload, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

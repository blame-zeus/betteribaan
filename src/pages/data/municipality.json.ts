import type { APIRoute } from 'astro';
import { SOURCE, VERIFIED_ON } from '../../data/ibaan-record';
import { NEIGHBOURS, TOWN } from '../../data/town';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    verifiedOn: VERIFIED_ON,
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
    neighbours: NEIGHBOURS,
    withheld: [
      { field: 'elevation', reason: 'Conflicting values in the same municipal profile' },
      { field: 'distanceToManila', reason: 'Conflicting values in the same municipal profile' },
      { field: 'psgcCodes', reason: 'Not verified from a reachable primary table' },
    ],
    sources: [SOURCE.profile.url],
  });

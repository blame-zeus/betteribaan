import type { APIRoute } from 'astro';
import { RESORTS, SOURCE, VERIFIED_ON } from '../../data/ibaan-record';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    verifiedOn: VERIFIED_ON,
    note: 'Listings from the municipal tourism page. Restaurants and products pages showed no records when checked.',
    resorts: RESORTS,
    sources: [SOURCE.resorts.url, SOURCE.restaurants.url, SOURCE.products.url],
  });

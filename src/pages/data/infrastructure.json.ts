import type { APIRoute } from 'astro';
import { BID_RESULTS, SOURCE, VERIFIED_ON } from '../../data/ibaan-record';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    verifiedOn: VERIFIED_ON,
    note: 'Infrastructure-related project titles from the municipal bid results. These are not project locations, budgets, or completion records.',
    projects: BID_RESULTS,
    sources: [SOURCE.bids.url],
  });

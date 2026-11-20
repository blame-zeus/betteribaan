import type { APIRoute } from 'astro';
import { OFFICES, SERVICE_COUNT, SOURCE, VERIFIED_ON } from '../../data/ibaan-record';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    verifiedOn: VERIFIED_ON,
    officeCount: OFFICES.length,
    serviceCount: SERVICE_COUNT,
    note: 'Titles and links from the municipal Services menu. Fees and requirements are not transcribed where the official pages publish images only.',
    offices: OFFICES,
    source: SOURCE.departments.url,
  });

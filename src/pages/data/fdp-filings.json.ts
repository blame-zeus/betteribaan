import type { APIRoute } from 'astro';
import { SOURCE, VERIFIED_ON } from '../../data/ibaan-record';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    verifiedOn: VERIFIED_ON,
    status: 'Could not verify',
    records: [],
    note: 'The DILG Full Disclosure portal did not resolve from this build, and no local mirror was found on the municipal site.',
    portal: SOURCE.fdpp.url,
  });

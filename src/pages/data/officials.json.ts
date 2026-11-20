import type { APIRoute } from 'astro';
import { OFFICIALS, SOURCE, VERIFIED_ON } from '../../data/ibaan-record';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    verifiedOn: VERIFIED_ON,
    note: 'Roles and committees follow the municipal Elected Officials page. The CMCI mayor field conflicts and is not used here.',
    officials: OFFICIALS,
    sources: [SOURCE.officials.url, SOURCE.cmci.url],
  });

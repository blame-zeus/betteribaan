import type { APIRoute } from 'astro';
import { CMCI_PILLARS_2024, CMCI_RANKS, SOURCE, VERIFIED_ON } from '../../data/ibaan-record';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    verifiedOn: VERIFIED_ON,
    note: 'CMCI-specific values. The CMCI population and mayor fields conflict with the municipal site and are not included.',
    ranks: CMCI_RANKS,
    pillars2024: CMCI_PILLARS_2024,
    source: SOURCE.cmci.url,
  });

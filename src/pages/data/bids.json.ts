import type { APIRoute } from 'astro';
import { BID_RESULTS, SOURCE, VERIFIED_ON } from '../../data/ibaan-record';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    verifiedOn: VERIFIED_ON,
    invitationStatus: 'No projects available for bidding on the checked page',
    note: 'Bid results shown under the 2026 filter when checked. No ABC, contract price, or supplier was visible in the extracted text.',
    bids: BID_RESULTS,
    sources: [SOURCE.invitations.url, SOURCE.bids.url],
  });

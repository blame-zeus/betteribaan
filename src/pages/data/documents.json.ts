import type { APIRoute } from 'astro';
import { SOURCE, VERIFIED_ON } from '../../data/ibaan-record';
import { OFFICIAL } from '../../lib/site';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    verifiedOn: VERIFIED_ON,
    status: 'Archive index only',
    note: 'No consolidated Ibaan document repository was verified. These are official archive pages, not local copies.',
    pages: [
      { label: 'Announcements archive', url: OFFICIAL.announcements },
      { label: 'Events archive', url: OFFICIAL.events },
      { label: 'Achievements and awards', url: OFFICIAL.awards },
      { label: 'Bid results', url: OFFICIAL.results },
    ],
    notPublished: ['Local ordinances', 'Resolutions', 'Executive orders', 'Budgets', 'Audit reports'],
    sources: [SOURCE.announcements.url, SOURCE.events.url, SOURCE.awards.url, SOURCE.bids.url],
  });

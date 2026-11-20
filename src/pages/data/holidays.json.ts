import type { APIRoute } from 'astro';
import { SOURCE, VERIFIED_ON } from '../../data/ibaan-record';
import { OFFICIAL } from '../../lib/site';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    verifiedOn: VERIFIED_ON,
    status: 'Not published',
    records: [],
    note: 'No dedicated Ibaan holiday calendar was found on the checked municipal pages. National proclamations are not substituted for a local list.',
    channels: [
      { label: 'Announcements archive', url: OFFICIAL.announcements },
      { label: 'Events archive', url: OFFICIAL.events },
      { label: 'Municipal home', url: OFFICIAL.home },
    ],
    sources: [SOURCE.announcements.url, SOURCE.events.url],
  });

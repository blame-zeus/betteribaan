import type { APIRoute } from 'astro';
import { SOURCE, VERIFIED_ON } from '../../data/ibaan-record';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    verifiedOn: VERIFIED_ON,
    status: 'Not published',
    records: [],
    note: 'No Ibaan budget, financial statement, or audit report was found on the checked municipal pages. The second-class income band is a definition, not a reported Ibaan figure.',
    definition: {
      className: 'Second-class municipality',
      averageAnnualIncomeRangePHP: [45_000_000, 54_999_999],
      appliesToBand: true,
      reportedForIbaan: false,
    },
    sources: [SOURCE.cmciAbout.url, SOURCE.profile.url],
  });

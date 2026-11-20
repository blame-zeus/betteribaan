import type { APIRoute } from 'astro';
import {
  BID_RESULTS,
  CMCI_PILLARS_2024,
  CMCI_RANKS,
  GAPS,
  OFFICES,
  OFFICIALS,
  RESORTS,
  SOURCE,
  VERIFIED_ON,
} from '../../data/ibaan-record';
import { BARANGAYS, TOWN } from '../../data/town';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    title: 'Better Ibaan datasets',
    note: 'Static datasets for Ibaan, Batangas. Values are included only when tied to a checked source. Gaps are listed with their status.',
    verifiedOn: VERIFIED_ON,
    datasets: [
      { id: 'municipality', path: '/data/municipality.json', records: 1, status: 'Verified' },
      { id: 'services', path: '/data/services.json', offices: OFFICES.length, services: OFFICES.reduce((sum, office) => sum + office.services.length, 0), status: 'Verified' },
      { id: 'officials', path: '/data/officials.json', records: OFFICIALS.length, status: 'Verified' },
      { id: 'resorts', path: '/data/resorts.json', records: RESORTS.length, status: 'Verified' },
      { id: 'bids', path: '/data/bids.json', records: BID_RESULTS.length, status: 'Verified' },
      { id: 'infrastructure', path: '/data/infrastructure.json', records: BID_RESULTS.length, status: 'Verified' },
      { id: 'competitiveness', path: '/data/competitiveness.json', years: CMCI_RANKS.length, pillars: CMCI_PILLARS_2024.length, status: 'Verified' },
      { id: 'barangays-geojson', path: '/data/barangays.geojson', features: BARANGAYS.length, status: 'Approximate geometry' },
      { id: 'iba-an', path: '/data/iba-an.json', status: 'Combined profile' },
      { id: 'financials', path: '/data/financials.json', status: 'Not published' },
      { id: 'fdp-filings', path: '/data/fdp-filings.json', status: 'Could not verify' },
      { id: 'documents', path: '/data/documents.json', status: 'Index only' },
      { id: 'holidays', path: '/data/holidays.json', status: 'Not published' },
    ],
    provenance: {
      population: TOWN.censusYear,
      sources: Object.fromEntries(
        Object.entries(SOURCE).map(([key, source]) => [key, source.url]),
      ),
    },
    withheld: GAPS.map(({ fact, status, note }) => ({ fact, status, note })),
  });

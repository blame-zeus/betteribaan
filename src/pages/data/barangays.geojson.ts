import type { APIRoute } from 'astro';
import { IBAAN_GEOJSON, MAP } from '../../data/town';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    ...IBAAN_GEOJSON,
    metadata: {
      note: 'Approximate PSA/NAMRIA 2023 administrative boundaries, simplified at roughly 500 m. For orientation only.',
      source: MAP.source.barangays,
      codeNote: 'Feature codes come from the boundary file and are not presented as verified PSGC codes.',
    },
  });

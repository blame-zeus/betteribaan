import type { APIRoute } from 'astro';
import { IBAAN_GEOJSON, MAP } from '../../data/town';
import { jsonResponse } from '../../lib/json';

export const GET: APIRoute = () =>
  jsonResponse({
    ...IBAAN_GEOJSON,
    metadata: {
      note: 'OCHA COD-AB / NAMRIA / PSA administrative boundaries, 2023-11-06, with source vertex detail retained. For orientation only.',
      source: MAP.source.barangaysUrl,
      codeNote: 'Feature codes come from the boundary file and are not presented as verified PSGC codes.',
    },
  });

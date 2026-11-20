/** Shared JSON response for the static data endpoints. */
export function jsonResponse(payload: unknown, cache = 'public, max-age=3600'): Response {
  return new Response(`${JSON.stringify(payload, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cache,
    },
  });
}

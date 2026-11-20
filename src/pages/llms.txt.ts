import type { APIRoute } from 'astro';
import { NAV_GROUPS } from '../lib/site';

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('http://localhost:4321');
  const pageLinks = NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => `- [${item.label}](${new URL(item.href, origin).toString()}): ${item.blurb}`),
  ).join('\n');

  const body = `# Better Ibaan

A sourced civic field guide to Ibaan, Batangas. Independent of the Municipality of Ibaan.

## Sections

${pageLinks}
- [Geography](${new URL('/geography/', origin).toString()}): boundaries, neighbours, and the barangay map
- [Heritage](${new URL('/heritage/', origin).toString()}): the Iba tree and municipal heritage categories

## Machine data

- [Dataset index](${new URL('/data/index.json', origin).toString()})
- [Search index](${new URL('/search.json', origin).toString()})
- [XML sitemap](${new URL('/sitemap.xml', origin).toString()})

Use only municipal or government-hosted pages as sources. Gaps are marked as gaps; no Calatagan data is reused.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};

import type { APIRoute } from 'astro';

const paths = ['/', '/geography/', '/heritage/', '/about/', '/sources/'];

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('http://localhost:4321');
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = paths
    .map((path) => {
      const loc = new URL(path, origin).toString();
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    },
  );
};

import type { APIRoute } from 'astro';
import { BARANGAYS, PAGES } from '../data/town';

interface SearchEntry {
  title: string;
  description: string;
  href: string;
  section: string;
}

export const GET: APIRoute = () => {
  const entries: SearchEntry[] = [
    ...PAGES.map((page) => ({
      title: page.title,
      description: page.description,
      href: page.href,
      section: page.section,
    })),
    ...BARANGAYS.map((barangay) => ({
      title: barangay.name,
      description: `Barangay in Ibaan, Batangas · PSGC ${barangay.code}`,
      href: `/geography#barangay-${barangay.slug}`,
      section: 'Barangay',
    })),
  ];

  return new Response(`${JSON.stringify(entries, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

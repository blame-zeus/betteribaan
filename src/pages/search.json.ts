import type { APIRoute } from 'astro';
import {
  BID_RESULTS,
  OFFICES,
  OFFICIALS,
  RESORTS,
} from '../data/ibaan-record';
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
      description: 'Barangay in Ibaan, Batangas · see the boundary map',
      href: `/geography#barangay-${barangay.slug}`,
      section: 'Barangay',
    })),
    ...OFFICES.map((office) => ({
      title: office.name,
      description: `${office.services.length} service entries listed by the municipality`,
      href: '/services#office-directory',
      section: 'Services',
    })),
    ...OFFICES.flatMap((office) =>
      office.services.map((service) => ({
        title: service.title,
        description: `Service listed by ${office.name}`,
        href: '/services#office-directory',
        section: 'Services',
      })),
    ),
    ...OFFICIALS.map((official) => ({
      title: official.name,
      description: `${official.role} · Municipality of Ibaan`,
      href: '/government#officials',
      section: 'Government',
    })),
    ...RESORTS.map((resort) => ({
      title: resort.name,
      description: `Published tourism listing · ${resort.location}`,
      href: '/resorts#directory',
      section: 'Resorts',
    })),
    ...BID_RESULTS.map((bid) => ({
      title: bid.title,
      description: `${bid.status} · ${bid.award}`,
      href: '/procurement#results',
      section: 'Procurement',
    })),
  ];

  return new Response(`${JSON.stringify(entries, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

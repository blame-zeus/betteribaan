/** Site identity, navigation, and official links. No domain or contact is invented. */

export const SITE = {
  name: 'Better Ibaan',
  shortName: 'Better Ibaan',
  tagline: 'A civic field guide to Ibaan, Batangas.',
  description:
    'A sourced field guide to Ibaan, Batangas: its 26 barangays, geography, the Iba tree, and the public record.',
} as const;

export interface NavItem {
  label: string;
  href: string;
  blurb: string;
}

export interface NavGroup extends NavItem {
  items: readonly NavItem[];
}

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: 'Overview',
    href: '/',
    blurb: 'Ibaan at a glance: population, barangays, and the public record.',
    items: [{ label: 'Overview', href: '/', blurb: 'The town in a few official figures.' }],
  },
  {
    label: 'Services',
    href: '/services',
    blurb: 'What the town publishes about offices, permits, and contact channels.',
    items: [
      { label: 'Municipal services', href: '/services', blurb: 'What each published office provides.' },
      { label: 'Emergency hotlines', href: '/hotlines', blurb: 'National lines and any verified local numbers.' },
      { label: 'Holidays', href: '/holidays', blurb: 'Declared national and local dates.' },
      { label: 'Resort directory', href: '/resorts', blurb: 'Published visitor channels, where they exist.' },
    ],
  },
  {
    label: 'Government',
    href: '/government',
    blurb: 'Offices, barangays, local legislation, and the town’s history.',
    items: [
      { label: 'Officials and offices', href: '/government', blurb: 'Seats, offices, and what can be verified.' },
      { label: 'Barangays', href: '/barangays', blurb: 'The 26 barangays, with figures and boundaries.' },
      { label: 'Legislation', href: '/legislation', blurb: 'Ordinances, resolutions, and orders on record.' },
      { label: 'History', href: '/history', blurb: 'The Iba tree, the town, and the written record.' },
    ],
  },
  {
    label: 'Statistics',
    href: '/statistics',
    blurb: 'Census figures, income class, and the records behind them.',
    items: [
      { label: 'Statistics', href: '/statistics', blurb: 'Population, households, and classification.' },
      { label: 'Finances', href: '/finances', blurb: 'Income and spending, only where traceable.' },
    ],
  },
  {
    label: 'Transparency',
    href: '/transparency',
    blurb: 'Procurement, disclosures, documents, and where public money is reported.',
    items: [
      { label: 'Infrastructure', href: '/infrastructure', blurb: 'Projects found in public project records.' },
      { label: 'Procurement', href: '/procurement', blurb: 'Bids, awards, and notices on record.' },
      { label: 'Disclosures', href: '/transparency', blurb: 'DILG filing index, where available.' },
      { label: 'Archive', href: '/documents', blurb: 'Documents recovered from public pages.' },
    ],
  },
  {
    label: 'About',
    href: '/about',
    blurb: 'How this guide works, and where its figures come from.',
    items: [
      { label: 'About', href: '/about', blurb: 'What this project is and how it works.' },
      { label: 'Sources', href: '/sources', blurb: 'Where every figure comes from.' },
      { label: 'Open data', href: '/data', blurb: 'Machine-readable datasets and provenance.' },
      { label: 'Accessibility', href: '/accessibility', blurb: 'How this site is built to be usable.' },
      { label: 'Sitemap', href: '/sitemap', blurb: 'Every page in the guide.' },
    ],
  },
] as const;

export const NAV = NAV_GROUPS.map(({ label, href }) => ({ label, href }));

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export const OFFICIAL = {
  home: 'https://www.ibaan.gov.ph/',
  profile: 'https://www.ibaan.gov.ph/general-information/',
  naturalHeritage: 'https://www.ibaan.gov.ph/heritage/natural/',
  ibaTree: 'https://www.ibaan.gov.ph/heritage/detail/iba-tree/',
  culturalMap: 'https://www.ibaan.gov.ph/cultural-map/',
  officials: 'https://www.ibaan.gov.ph/government-officials/',
  bids: 'https://www.ibaan.gov.ph/bids-awards/',
  invitations: 'https://www.ibaan.gov.ph/bids-awards/invitation/',
  results: 'https://www.ibaan.gov.ph/bids-awards/results/',
  hotlines: 'https://www.ibaan.gov.ph/info/group/hotlines/',
  resorts: 'https://www.ibaan.gov.ph/tourism/resorts/',
  restaurants: 'https://www.ibaan.gov.ph/tourism/restaurants/',
  products: 'https://www.ibaan.gov.ph/tourism/products/',
  announcements: 'https://www.ibaan.gov.ph/archive/announcements/',
  events: 'https://www.ibaan.gov.ph/archive/events/',
  vision: 'https://www.ibaan.gov.ph/vision-mission/',
  awards: 'https://www.ibaan.gov.ph/info/group/awards/',
  online: 'https://online.ibaan.gov.ph/Ibaan/OnlineServices/',
} as const;

export const MAP_REPOSITORY =
  'https://github.com/bendlikeabamboo/barangay-boundaries-repository';

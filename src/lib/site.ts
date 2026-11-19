/** Site identity, navigation, and official links. No domain or contact is invented. */

export const SITE = {
  name: 'Better Ibaan',
  shortName: 'Better Ibaan',
  tagline: 'A civic field guide to Ibaan, Batangas.',
  description:
    'A sourced field guide to Ibaan, Batangas: its 26 barangays, geography, the Iba tree, and the public record.',
} as const;

export const NAV = [
  { label: 'Geography', href: '/geography' },
  { label: 'Heritage', href: '/heritage' },
  { label: 'About', href: '/about' },
  { label: 'Sources', href: '/sources' },
] as const;

export const OFFICIAL = {
  home: 'https://www.ibaan.gov.ph/',
  profile: 'https://www.ibaan.gov.ph/general-information/',
  naturalHeritage: 'https://www.ibaan.gov.ph/heritage/natural/',
  ibaTree: 'https://www.ibaan.gov.ph/heritage/detail/iba-tree/',
  culturalMap: 'https://www.ibaan.gov.ph/cultural-map/',
  officials: 'https://www.ibaan.gov.ph/government-officials/',
  bids: 'https://www.ibaan.gov.ph/bids-awards/',
} as const;

export const MAP_REPOSITORY =
  'https://github.com/bendlikeabamboo/barangay-boundaries-repository';

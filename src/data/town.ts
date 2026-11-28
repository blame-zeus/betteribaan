import mapData from './iba-an-map.json';
import { NAV_GROUPS, OFFICIAL, MAP_REPOSITORY } from '../lib/site';

export interface Barangay {
  name: string;
  slug: string;
  code: string;
  areaKm2: number;
  /** Flat SVG outline for the no-script fallback. */
  path: string;
  label: { x: number; y: number };
  showLabel: boolean;
}

export interface BarangayFeature {
  type: 'Feature';
  id: string;
  properties: {
    name: string;
    slug: string;
    code: string;
    areaKm2: number;
    center: [number, number];
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface BarangayGeoJSON {
  type: 'FeatureCollection';
  bbox: [number, number, number, number];
  features: BarangayFeature[];
}

export const BARANGAYS = mapData.ibaan.barangays as Barangay[];
export const MAP = mapData;
export const IBAAN_GEOJSON = MAP.ibaan.geojson as BarangayGeoJSON;

export const TOWN = {
  name: 'Ibaan',
  province: 'Batangas',
  region: 'CALABARZON',
  country: 'Philippines',
  className: 'Second-class municipality',
  landAreaKm2: 68.99,
  landAreaShare: 2.21,
  population: 58_507,
  households: 14_837,
  censusYear: 2020,
  barangayCount: 26,
  coordinates: {
    dms: '13°49′03″N 121°07′59″E',
    latitude: 13.8175,
    longitude: 121.1331,
  },
  distanceToBatangasCityKm: 13,
} as const;

export const NEIGHBOURS = [
  { name: 'San Jose', direction: 'northwest' },
  { name: 'Lipa City', direction: 'northeast' },
  { name: 'Rosario', direction: 'east' },
  { name: 'Taysan', direction: 'southeast' },
  { name: 'Batangas City', direction: 'southwest' },
] as const;

export const HERO_FACTS = [
  { value: '26', label: 'barangays' },
  { value: '58,507', label: 'residents, 2020 census' },
  { value: '68.99', label: 'square kilometres' },
  { value: '2nd class', label: 'municipality' },
] as const;

export const HERITAGE = {
  name: 'Iba tree',
  localName: 'Iba',
  englishName: 'Malay Gooseberry',
  comparison: 'kalamyas (bilimbi)',
  summary:
    'The town takes its name from the Iba tree. The municipal heritage page records a tree that was once abundant here, gave the town its identity, and is now locally rare.',
  characteristics: [
    {
      label: 'Flower',
      copy: 'Small flowers grow in tight clusters directly on the branches. They are pale green to yellow and have no strong scent.',
    },
    {
      label: 'Leaves',
      copy: 'Long, triangular leaves sit opposite one another on slender, flexible branches. The veins are clearly visible, and the shape is compared to kalamyas.',
    },
    {
      label: 'Fruit',
      copy: 'Round fruit grows in dense clusters on the branches. It starts pale green and turns bright yellow-green as it ripens, with a sharply sour taste.',
    },
    {
      label: 'Fragrance',
      copy: 'The page records no strong smell in either the flowers or the fruit.',
    },
    {
      label: 'Uses',
      copy: 'The fruit is used to sour fish, and to make vinegar, wine, and sweets soaked in limewater.',
    },
  ],
  significance: [
    {
      label: 'History',
      copy: 'Local history connects the town name to the tree, which once grew abundantly in the area and became a symbol of the community.',
    },
    {
      label: 'Daily life',
      copy: 'The fruit is part of local cooking and food traditions, including fish dishes, vinegar, and wine.',
    },
    {
      label: 'Livelihood',
      copy: 'Products from the tree, including vinegar, wine, and seasoning, have provided income to some families. The fruit can also be made into sweets.',
    },
  ],
  conservation: {
    status:
      'The municipal page describes the Iba as locally endangered: few old trees remain, few residents plant or care for it, and the page notes that it is not found in neighbouring towns.',
    pressures: [
      'A lack of care in earlier years left few remaining trees.',
      'Changing food preferences reduced everyday use of the fruit.',
      'Land-use change removed places where the tree once grew.',
    ],
    actions: [
      'A municipal Iba planting programme has been carried out in every barangay, led by barangay officials.',
      'The Rotary Club of Metro Ibaan and Klub Iba are named as partner organisations.',
      'The Rotary legacy project “Iba-lik ang Kasaysayan” aims to rebuild the tree population and reintroduce it to Ibaan residents.',
    ],
  },
  source: OFFICIAL.ibaTree,
  sourceLabel: 'Municipality of Ibaan · Iba Tree heritage page',
} as const;

export const PUBLIC_RECORD = [
  {
    title: 'Municipal profile',
    copy: 'Population, households, land area, income class, and boundaries as published by the Municipality of Ibaan.',
    href: OFFICIAL.profile,
    meta: 'Municipality of Ibaan',
  },
  {
    title: 'Natural heritage register',
    copy: 'The municipality’s register of natural sites and species, including the Iba tree, rivers, springs, and falls.',
    href: OFFICIAL.naturalHeritage,
    meta: 'Municipality of Ibaan',
  },
  {
    title: 'Iba Tree',
    copy: 'The municipal heritage entry behind this guide’s feature on the town’s namesake tree.',
    href: OFFICIAL.ibaTree,
    meta: 'Municipality of Ibaan',
  },
  {
    title: 'Cultural map',
    copy: 'The municipality’s four heritage categories: natural, immovable, intangible, and movable.',
    href: OFFICIAL.culturalMap,
    meta: 'Municipality of Ibaan',
  },
  {
    title: 'Elected officials',
    copy: 'The current municipal officials as published by the Municipality of Ibaan.',
    href: OFFICIAL.officials,
    meta: 'Municipality of Ibaan',
  },
  {
    title: 'Bids and awards',
    copy: 'Procurement notices, bid documents, and awards published by the municipality.',
    href: OFFICIAL.bids,
    meta: 'Municipality of Ibaan',
  },
] as const;

export const PAGES = [
  ...NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      title: item.label,
      description: item.blurb,
      href: item.href,
      section: group.label,
    })),
  ),
  {
    title: 'Geography',
    description: 'The 26 barangays, the municipal boundary, the five neighbours, and map notes.',
    href: '/geography',
    section: 'Government',
  },
  {
    title: 'Heritage',
    description: 'The Iba tree: the town’s namesake, its uses, and the effort to bring it back.',
    href: '/heritage',
    section: 'Government',
  },
] as const;

export const SOURCE_GROUPS = [
  {
    title: 'Municipal profile and public record',
    note: 'All municipal facts on this site come from pages published by the Municipality of Ibaan. Population and household figures are the 2020 census values as stated in the municipal profile.',
    links: [
      { label: 'General information', href: OFFICIAL.profile },
      { label: 'Elected officials', href: OFFICIAL.officials },
      { label: 'Bids and awards', href: OFFICIAL.bids },
      { label: 'Cultural map', href: OFFICIAL.culturalMap },
    ],
  },
  {
    title: 'Heritage',
    note: 'The Iba tree summary is drawn from the municipality’s heritage entry, which is written in Filipino. The English here is a summary, not an official translation.',
    links: [
      { label: 'Iba Tree', href: OFFICIAL.ibaTree },
      { label: 'Natural heritage register', href: OFFICIAL.naturalHeritage },
      { label: 'Heritage of Ibaan', href: OFFICIAL.culturalMap },
    ],
  },
  {
    title: 'Map boundaries',
    note: 'The barangay map uses detailed OCHA COD-AB boundaries from NAMRIA and PSA, released 2023-11-06 and redistributed with PSGC codes by faeldon/philippines-psgc-shapefiles. The Batangas context map uses a simplified PSA/NAMRIA file from barangay-boundaries-repository. Both are orientation aids, not survey work.',
    links: [
      { label: 'Detailed barangay boundaries', href: MAP.source.barangaysUrl },
      { label: 'Simplified context boundaries', href: MAP_REPOSITORY },
    ],
  },
  {
    title: 'Interactive map tiles',
    note: 'The interactive map loads OpenStreetMap data through OpenFreeMap vector tiles. Its 3D view also requests elevation tiles from the Mapzen Terrain Tiles dataset on AWS. Those services receive ordinary tile requests when a reader opens the map; this site has no analytics or user accounts. In the 3D view, barangay height and shade show the area recorded in the 2023 boundary file, not population; the terrain is real.',
    links: [
      { label: 'OpenFreeMap', href: 'https://openfreemap.org/' },
      { label: 'OpenStreetMap copyright', href: 'https://www.openstreetmap.org/copyright' },
      { label: 'Mapzen Terrain Tiles on AWS', href: 'https://registry.opendata.aws/terrain-tiles/' },
    ],
  },
] as const;

export const CREDITS = [
  {
    file: 'iba-tree-ibaan.webp',
    title: 'Iba Tree, Ibaan',
    creator: 'Municipality of Ibaan',
    license: 'Official municipal photograph; no licence stated',
    href: OFFICIAL.ibaTree,
    via: 'Iba Tree heritage page',
  },
  {
    file: 'ben-r-medrano-plaza-ibaan-batangas-2026.jpg',
    title: 'Ben R. Medrano Plaza, Ibaan, Batangas, Sep 2026',
    creator: 'Ralff Nestor Nacor',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Ben_R._Medrano_Plaza,_Ibaan,_Batangas,_Sep_2026_(1).jpg',
    via: 'Wikimedia Commons',
  },
  {
    file: 'j-pastor-street-ibaan-batangas-2026.jpg',
    title: 'J. Pastor St., Ibaan, Batangas, Sep 2026',
    creator: 'Ralff Nestor Nacor',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:J._Pastor_St.,_Ibaan,_Batangas,_Sep_2026.jpg',
    via: 'Wikimedia Commons',
  },
  {
    file: 'st-james-the-greater-shrine-parish-ibaan.jpg',
    title: 'St. James the Greater Shrine-Parish (Ibaan, Batangas) 2023-04-30',
    creator: 'LMP 2001',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/w/index.php?curid=131949813',
    via: 'Wikimedia Commons',
  },
  {
    file: 'good-friday-procession-in-ibaan-batangas-2023.jpg',
    title: 'Good Friday Procession in Ibaan Batangas 2023-04-07',
    creator: 'LMP 2001',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/w/index.php?curid=130458631',
    via: 'Wikimedia Commons',
  },
  {
    file: 'panuluyan-sa-ibaan-batangas-2023-12-24.jpg',
    title: 'Panuluyan sa Ibaan Batangas 2023-12-24',
    creator: 'LMP 2001',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/w/index.php?curid=142860895',
    via: 'Wikimedia Commons',
  },
  {
    file: 'ibaan-church-grotto-2026.jpg',
    title: 'Ibaan Church Grotto, Batangas, Sep 2026',
    creator: 'Ralff Nestor Nacor',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Ibaan_Church_Grotto,_Batangas,_Sep_2026.jpg',
    via: 'Wikimedia Commons',
  },
] as const;

export const FIGURE_NOTES = [
  {
    title: 'Elevation',
    copy: 'The municipal profile gives 178 metres above sea level. The geography section of the same site gives 124 metres. This guide leaves both out until the municipality resolves the discrepancy.',
  },
  {
    title: 'Distance to Manila',
    copy: 'The municipal profile gives 96 kilometres. The geography section gives 118 kilometres. This guide leaves both out and keeps the shorter, consistent distance to Batangas City: 13 kilometres.',
  },
] as const;

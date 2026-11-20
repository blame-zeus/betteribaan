import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import mapData from '../src/data/iba-an-map.json';
import {
  BARANGAYS,
  CREDITS,
  HERITAGE,
  NEIGHBOURS,
  PUBLIC_RECORD,
  TOWN,
} from '../src/data/town';
import { formatArea, formatNumber, plural } from '../src/lib/format';
import { OFFICIAL } from '../src/lib/site';

describe('Ibaan town profile', () => {
  it('keeps the official 2020 census and land figures together', () => {
    expect(TOWN.population).toBe(58_507);
    expect(TOWN.households).toBe(14_837);
    expect(TOWN.censusYear).toBe(2020);
    expect(TOWN.landAreaKm2).toBe(68.99);
    expect(TOWN.landAreaShare).toBe(2.21);
    expect(TOWN.barangayCount).toBe(26);
    expect(TOWN.distanceToBatangasCityKm).toBe(13);
  });

  it('lists the five official neighbours in their stated directions', () => {
    expect(NEIGHBOURS).toEqual([
      { name: 'San Jose', direction: 'northwest' },
      { name: 'Lipa City', direction: 'northeast' },
      { name: 'Rosario', direction: 'east' },
      { name: 'Taysan', direction: 'southeast' },
      { name: 'Batangas City', direction: 'southwest' },
    ]);
  });
});

describe('barangay map data', () => {
  it('contains exactly 26 Ibaan barangays with unique slugs and boundary codes', () => {
    expect(BARANGAYS).toHaveLength(26);
    expect(mapData.ibaan.barangays).toHaveLength(26);

    const slugs = BARANGAYS.map((barangay) => barangay.slug);
    const codes = BARANGAYS.map((barangay) => barangay.code);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('uses alphabetic names and stable 10-digit boundary codes', () => {
    const names = BARANGAYS.map((barangay) => barangay.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(BARANGAYS.every((barangay) => /^\d{10}$/.test(barangay.code))).toBe(true);
  });

  it('includes Poblacion and a drawable fallback path for every barangay', () => {
    expect(BARANGAYS.some((barangay) => barangay.name === 'Poblacion')).toBe(true);
    expect(BARANGAYS.every((barangay) => barangay.path.startsWith('M'))).toBe(true);
    expect(BARANGAYS.every((barangay) => barangay.label.x > 0 && barangay.label.y > 0)).toBe(true);
  });

  it('supplies GeoJSON polygons and label centres for the interactive map', () => {
    expect(mapData.ibaan.geojson.features).toHaveLength(26);
    expect(mapData.ibaan.geojson.bbox).toEqual(expect.arrayContaining([expect.any(Number)]));
    for (const feature of mapData.ibaan.geojson.features) {
      expect(['Polygon', 'MultiPolygon']).toContain(feature.geometry.type);
      expect(feature.properties.center).toHaveLength(2);
      expect(feature.properties.center[0]).toBeGreaterThan(121);
      expect(feature.properties.center[1]).toBeGreaterThan(13);
      expect(feature.properties.center[0]).toBeLessThan(122);
      expect(feature.properties.center[1]).toBeLessThan(14);
    }
  });

  it('keeps the simplified mapped area close to the published geometry', () => {
    const mappedArea = BARANGAYS.reduce((sum, barangay) => sum + barangay.areaKm2, 0);
    expect(mappedArea).toBeCloseTo(70.32, 1);
  });

  it('builds a Batangas context map with Ibaan and five neighbours', () => {
    expect(mapData.batangas.municipalities).toHaveLength(34);
    expect(mapData.batangas.municipalities.filter((place) => place.isIbaan)).toHaveLength(1);
    expect(mapData.batangas.ibaanLabel.x).toBeGreaterThan(0);
    expect(mapData.batangas.ibaanLabel.y).toBeGreaterThan(0);
    expect(mapData.batangas.neighbourLabels.map((label) => label.name)).toEqual([
      'Rosario',
      'San Jose',
      'Taysan',
      'Batangas City',
      'Lipa City',
    ]);
  });

  it('uses the MIT-licensed PSA/NAMRIA repository as its map source', () => {
    expect(mapData.source.barangays).toContain('bendlikeabamboo/barangay-boundaries-repository');
  });
});

describe('heritage and sources', () => {
  it('keeps the Iba tree entry tied to the municipal heritage page', () => {
    expect(HERITAGE.name).toBe('Iba tree');
    expect(HERITAGE.localName).toBe('Iba');
    expect(HERITAGE.source).toBe('https://www.ibaan.gov.ph/heritage/detail/iba-tree/');
    expect(HERITAGE.characteristics).toHaveLength(5);
  });

  it('points every public-record entry at an official Ibaan page', () => {
    expect(PUBLIC_RECORD).toHaveLength(6);
    for (const entry of PUBLIC_RECORD) {
      expect(entry.href.startsWith('https://www.ibaan.gov.ph/')).toBe(true);
    }
    expect(OFFICIAL.profile).toBe('https://www.ibaan.gov.ph/general-information/');
  });

  it('credits only images that exist in the site source', () => {
    expect(CREDITS).toHaveLength(7);
    for (const credit of CREDITS) {
      expect(existsSync(`src/assets/images/${credit.file}`)).toBe(true);
      expect(credit.license.length).toBeGreaterThan(0);
    }
  });
});

describe('formatting helpers', () => {
  it('formats counts and areas for the page', () => {
    expect(formatNumber(58_507)).toBe('58,507');
    expect(formatArea(13)).toBe('13.00 km²');
    expect(plural(1, 'barangay')).toBe('barangay');
    expect(plural(26, 'barangay')).toBe('barangays');
  });
});

describe('national pages removed', () => {
  it('does not keep the old outside-Ibaan routes', () => {
    expect(existsSync('src/pages/directory.astro')).toBe(false);
    expect(existsSync('src/pages/regions')).toBe(false);
    expect(existsSync('src/pages/budget-portals.astro')).toBe(false);
    expect(existsSync('src/pages/guide.astro')).toBe(false);
    expect(existsSync('src/data/portals.json')).toBe(false);
  });
});

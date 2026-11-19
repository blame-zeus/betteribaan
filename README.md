# Better Ibaan

A community-maintained directory of Better LGU digital transparency portals across the Philippines.
It is an independent project named after Better Ibaan, Batangas — it is **not** an Ibaan municipal
portal or an official government website.

## What is here

- Astro 5 + TypeScript, static output, no backend.
- A shared shell with typed navigation, search dialog, theme toggle, responsive menu and one
  pair of equal outer margins.
- Pages: home, directory, regions index and 18 region pages, budget portals, guide, about,
  sources, 404, sitemap and JSON endpoints.
- Generated data from the public [better-lgu-directory](https://github.com/jmacj/better-lgu-directory)
  register: 174 LGUs, 74 active, 18 PSGC regions, 24 budget portals. Snapshot: 2026-11-19.
- The directory finder and filters run against the real local dataset with no-script links.

## Commands

```bash
npm install
npm run dev        # local site at http://localhost:4321
npm run check      # astro check + tests + production build
npm run data:sync  # refresh data from the upstream public register
npm run lint       # design house-style lint
```

Set `SITE_URL` (or `VERCEL_PROJECT_PRODUCTION_URL`) before a production build to generate
canonical URLs and the sitemap. Without it the build uses `http://localhost:4321`.

## Data provenance

`npm run data:sync` reads the upstream `README.md`, `BUDGET.md` and PSGC region list, writing
`src/data/portals.json`, `src/data/budget-portals.json` and `src/data/regions.json`. Statuses
are recorded as upstream reports them; they are not independently retested. See
[SOURCES.md](SOURCES.md) and the in-site `/sources` page for image credits and guide facts.

## Design

Direction: **The printed annual** (`editorial-report`, seed 792596731), keeping the reference
project's palette and type families. Idea: the LGU register becomes a national ledger of civic
builders, with "Open for Adoption" entries as its open calls. The one live thing is the instant
place/region finder over the real directory.

Photographs are credited on `/sources` and in `assets/credits.json`. They are not presented as
project-owned. No contact email or domain is invented; calls to action use the real BetterGov
guide and directory repository.

## Checks

`npm run check` passes: 0 type errors, 4 tests, 26 static pages built. The design gate is run
with `.agents/skills/design-taste-frontend/scripts/lint.mjs` and `inspect.mjs` at 1440, 768
and 390 pixels.

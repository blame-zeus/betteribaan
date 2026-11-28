# Better Ibaan

A sourced civic field guide to Ibaan, Batangas: its 26 barangays, geography, heritage and
public record. It is an independent project, **not** the municipal government's website.

Live site: https://betteribaan.vercel.app

## What is here

- Astro 5 + TypeScript, static output, no backend.
- Pages on the town and its barangays (`/`, `/geography`, `/barangays`), history and heritage,
  government, services, hotlines and holidays, finances, procurement, infrastructure,
  statistics, documents and legislation, resorts, and a `/sources` page for every credit.
- An interactive barangay map with a plain SVG fallback that works without JavaScript.
- Open data endpoints under `/data/` (JSON and GeoJSON), plus `/search.json`, `/llms.txt`
  and `/sitemap.xml`.
- A public-record ledger (`src/data/ibaan-record.ts`). Facts that could not be checked are
  marked "Could not verify" rather than filled in.

## Commands

```bash
npm install
npm run dev        # local site at http://localhost:4321
npm run check      # astro check + tests + production build
npm run lint       # design house-style lint
npm run data:map   # rebuild the barangay outlines and map data
```

Set `SITE_URL` (or `VERCEL_PROJECT_PRODUCTION_URL`) before a production build so canonical URLs
and the sitemap are correct. Without it, the build uses `http://localhost:4321`.

Build output (`dist/`, `.astro/`) and `node_modules/` are not committed. Vercel builds the site
from source.

## Sources

Boundary outlines come from the 2023 OCHA COD-AB / NAMRIA / PSA file. They are for orientation,
not survey use. Town figures come from the municipal profile and the 2020 census. Every source
and image credit is listed on `/sources`, in [SOURCES.md](SOURCES.md) and in
`assets/credits.json`.

## Licence

Code: MIT ([LICENSE](LICENSE)). Images keep their own licences, as credited.

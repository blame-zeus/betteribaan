# Final report — Better Ibaan

Date: 2026-11-19. Scope: complete Astro + TypeScript starter site, shared shell/design system, pages,
endpoints, sourced data, and design gate. Work was performed in
`C:\Users\jjzeu\Documents\Personal Projects\betteribaan\betteribaan`.

## Direction

- Direction: **The printed annual** (`editorial-report`), seed **792596731**, `redraws: 0`.
- Saved deal: `.taste-skill/direction.json`; constraints kept: **palette, type**.
- Idea sentence: **the register of LGUs becomes a national ledger of civic builders, with “Open for
  Adoption” entries as its open calls.**
- Visible compression: `The register of builders.` / `Open the directory`.
- One live thing: **instant place/region finder over the checked directory snapshot**. It filters the
  real generated register on input; ⌘K/Ctrl+K opens the same search as a dialog. It is a live interaction,
  not a live upstream fetch.

## What was built

- Shared shell: `src/layouts/Base.astro`, `SiteHeader.astro`, `SiteFooter.astro`, `PageHeader.astro`,
  `PortalList.astro`, `SearchDialog.astro`; behavior in `src/scripts/ui.ts`.
- Design system: `src/styles/tokens.css`, `src/styles/global.css`; reference palette and type family
  retained (Public Sans + Source Serif 4).
- Pages: `/`, `/directory`, `/regions`, `/regions/[slug]` (18 regions), `/budget-portals`, `/guide`,
  `/about`, `/sources`, `/404`.
- Endpoints: `/data/portals.json`, `/search.json`, `/sitemap.xml`.
- Data tooling: `scripts/sync-directory.mjs`; schema tests in `tests/data.test.ts`; source provenance in
  `SOURCES.md`.
- Snapshot: **174** registered LGUs, **74** recorded active, **76** work-in-progress, **24** planned,
  **9** tagged open for adoption, **18** PSGC regions, **24** budget portals. Checked **2026-11-19**.
- Status labels are quoted from the public register and are **not independently retested**.

## Sample and placeholder status

- No invented portal, status, figure, link, contact, email, testimonial, or sample content.
- No lorem ipsum, grey placeholder boxes, “image here”, fake screens, or placeholder cards.
- No contact email was invented; all outward CTAs use real BetterGov.ph or GitHub links.
- No bundled illustration stands in for photography. The nine desktop `<img>` tags use six unique real
  Wikimedia Commons files; three are repeated in the CTA strip/field.
- No video was added: no honest, suitable, licensed clip was found for the subject. Still photographs
  use slow drift instead.

## Image credits

Stored verbatim in `assets/credits.json` and rendered at `/sources`.

- “St. James the Greater Shrine-Parish (Ibaan, Batangas) 2023-04-30” by LMP 2001, CC BY-SA 4.0 —
  [source](https://commons.wikimedia.org/w/index.php?curid=131949813).
- “Good Friday Procession in Ibaan Batangas 2023-04-07” by LMP 2001, CC BY-SA 4.0 —
  [source](https://commons.wikimedia.org/w/index.php?curid=130458631).
- “STAR Tollway Ibaan Batangas 2024-04-14” by LMP 2001, CC BY-SA 4.0 —
  [source](https://commons.wikimedia.org/w/index.php?curid=147355588).
- “Panuluyan sa Ibaan Batangas 2023-12-24” by LMP 2001, CC BY-SA 4.0 —
  [source](https://commons.wikimedia.org/w/index.php?curid=142860895).
- “Lipa-Ibaan Road, Ibaan, Batangas, Sep 2026” by Ralff Nestor Nacor, CC BY-SA 4.0 —
  [source](https://commons.wikimedia.org/wiki/File:Lipa-Ibaan_Road,_Ibaan,_Batangas,_Sep_2026.jpg).
- “Philippines Map 1749 historiadelaprov00muri 0005” by Pedro Murillo Velarde, public domain —
  [source](https://commons.wikimedia.org/wiki/File:Philippines_Map_1749_historiadelaprov00muri_0005.jpg).

CC BY-SA 4.0 terms: https://creativecommons.org/licenses/by-sa/4.0/ .

## Checks run

- `npm run check`: `astro check` **0 errors, 0 warnings, 0 hints**; `vitest run` **4/4 tests passed**;
  `astro build` **26 static pages** built.
- `npm run lint`: **0 FAIL, 0 WARN** across 25 source files.
- `inspect.mjs` on `dist/index.html` at **1440×900, 768×1024, 390×844**: **0 FAIL, 1 WARN**.
  - WARN `no-footage`: “No video anywhere on the page.” No suitable honest clip was found.
  - No console errors, broken images, horizontal overflow, edge text, low contrast, side scrollers,
    centred/upper/mono/micro labels, or small text.
  - Hero: `The register of builders.` — 2 lines at all three viewports; 119.5px (8.3vw) at 1440.
  - 23 headings, longest 2 lines, 0 over 2 lines; two font families; reading measure 59ch desktop.
  - Real pictures: 9 desktop tags / 6 unique files; 6 tags at 768 and 390.
  - Motion elements: 42 desktop, 31 tablet, 30 mobile; no video.
  - Screens: 10.5 desktop, 10.1 tablet, 11.3 mobile; largest blank gap 272px desktop (0.30 screen).
  - Screenshots saved: `.taste-skill/inspect/{desktop,tablet,mobile}-fold.jpg` and
    `{desktop,tablet,mobile}-page-*.jpg`; report at `.taste-skill/inspect/report.json`.
- Critique: two rounds recorded in `.taste-skill/critique.md`; final measured score **8.1**
  (design 8 · usability 8 · creativity 8 · content 9). No formal cap applied.

## Remaining warnings and shortfalls

- Inspector: only `no-footage` remains. This is accepted, not hidden: no honest suitable clip was found.
- Build output: one Vite warning from Astro’s own `node_modules/astro/dist/assets/utils/remotePattern.js`
  about unused imports from `@astrojs/internal-helpers/remote`. It is upstream library output, not site
  source, and does not affect the build.
- Review limitation: the image reader in this session cannot open JPEGs, so literal visual screenshot
  review was blocked. The critique used inspector measurements and downsampled luminance proxies; a
  human pass over the saved screenshots is still advised before publication.
- Node compatibility: the environment runs Node `v22.17.1`, which Astro `7.4.13` does not support;
  Astro is therefore pinned to `5.16.6`.
- All work is **uncommitted** and **nothing has been pushed**. `git status --short` shows `M README.md`
  plus untracked `.agents/`, `.astro/`, `.data-cache/`, `.taste-skill/`, `SOURCES.md`, `assets/`,
  `astro.config.mjs`, `dist/`, `node_modules/`, `package-lock.json`, `package.json`, `public/`,
  `scripts/`, `skills-lock.json`, `src/`, `tests/`, `tsconfig.json`.

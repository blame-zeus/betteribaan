# Critique — Better Ibaan

**Review limitation.** The image reader in this session cannot open JPEGs: every screenshot read returned
`ERROR: Cannot read … (this model does not support image input)`. No screenshot was therefore reviewed
literally by eye. This record uses the final `inspect.mjs` measurements, saved screenshot filenames,
and downsampled luminance proxies only. A human visual pass on `.taste-skill/inspect/*.jpg` should be
run before publication. No visual claim below is presented as a literal sighting.

ROUND 1
Seen in one second: Measured proxy — a gutterless photographic masthead dominates, then a serif title
on paper; at 1440×900 the primary action had not entered the first screen.
Idea (one sentence): the register of LGUs becomes a national ledger of civic builders, with “Open for
Adoption” entries as its open calls.
Live thing: instant place/region finder over the checked Better LGU directory snapshot.
Layout words by section: hero=masthead+axis / stats=photo-with-figure-tiles / ways=pinned-spines /
process=stepped-statement / about=side-facts / cta=photo-strip+field / faq=alternating-bands /
footer=statement.
Scores: design 7 · usability 7 · creativity 8 · content 9 → overall 7.4
Caps applied: usability capped at 7 because the primary action was below the first screen at 1440×900.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. `desktop-fold.jpg` — the 52svh masthead pushed “Open the directory” out of the first screen; fixed
   by shortening the masthead to 48svh so the action enters the 1440×900 fold.
2. `tablet-fold.jpg` and `mobile-fold.jpg` — the supporting sentence was separated from the title by
   action/finder order; fixed with flex order `h1 → standfirst → actions → finder → note` below 48rem.
3. `tablet-fold.jpg` — too many rendered type steps after responsive clamps; fixed by consolidating the
   token scale, which returned source lint to 0 WARN.

ROUND 2
Seen in one second: Measured proxy — one dominant two-line serif title on paper under a quiet
photo/colour masthead; the directory action and the finder are the only next moves. At 1440×900 the
title measures 119.5px (8.3vw), 2 lines; at 768 and 390 it is also 2 lines. The inspector reports
`explains: true`, no edge text, no broken images, no console errors and no horizontal overflow.
Idea (one sentence): the register of LGUs becomes a national ledger of civic builders, with “Open for
Adoption” entries as its open calls.
Live thing: instant place/region finder over the checked Better LGU directory snapshot; ⌘K/Ctrl+K opens
the same search as a dialog.
Layout words by section: hero=masthead+axis / stats=photo-with-figure-tiles / ways=pinned-spines /
process=stepped-statement / about=side-facts / cta=photo-strip+field / faq=alternating-bands /
footer=statement.
Scores: design 8 · usability 8 · creativity 8 · content 9 → overall 8.1
Caps applied: none. Final inspector has 0 FAIL; the only WARN is `no-footage`, which is not a cap. No
3+ line headline (23 headings, max 2 lines), no eyebrow/mono/numbering/gradient/resting shadow/hairline,
≥4 real pictures (9 `<img>` at 1440, 6 unique sources), motion present (42/31/30 elements), live thing
present, primary action on first screen, all requested sections present, no placeholder, no off-centre
WARN, no blank-stretch over half a screen.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. `desktop-fold.jpg`, `desktop-page-01.jpg`, `tablet-page-01.jpg`, `mobile-page-01.jpg` — no honest
   suitable footage was found, so the masthead and CTA strip use credited stills with slow drift instead
   of a muted loop. Fix only if a real, licensable clip of Ibaan or the directory work is sourced; do not
   invent one.
2. `tablet-fold.jpg` — 9 rendered type sizes appear at 768 because clamp values interpolate between
   breakpoints, against 8 source tokens and 8 at 1440/390. Fix would be extra intermediate tokens;
   accepted because no inspector WARN remains and the steps are consecutive.
3. All nine saved screenshots — literal crop and collision review could not be performed in this
   session. Fix: human review of `.taste-skill/inspect/*.jpg` before publication; the measured proxies
   show no collisions, slivers, edge text or overflow.

Round 2 stops the critique loop: no stranger-visible layout defect remains in the measured record, and
the remaining item is an honest media shortfall plus a review-method limitation.

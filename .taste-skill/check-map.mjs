import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const browser = await Browser.launch();
const page = await browser.newPage({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:4322/', { settleMs: 1000 });
await page.eval(() => document.querySelector('[data-map-board]')?.scrollIntoView({ block: 'center' }));

let ready = false;
for (let attempt = 0; attempt < 40; attempt += 1) {
  ready = await page.eval(() => Boolean(document.querySelector('.map-board.is-ready')));
  if (ready) break;
  await sleep(500);
}

const before = await page.eval(() => ({
  ready: Boolean(document.querySelector('.map-board.is-ready')),
  canvas: Boolean(document.querySelector('.maplibregl-canvas')),
  status: document.querySelector('[data-map-status]')?.textContent ?? '',
  toggle: document.querySelector('[data-map-3d]')?.textContent ?? '',
  pressed: document.querySelector('[data-map-3d]')?.getAttribute('aria-pressed') ?? '',
  resources: performance.getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((name) => /openfreemap|openstreetmap|amazonaws/.test(name)),
}));

await page.eval(() => document.querySelector('[data-map-3d]')?.click());
await sleep(1200);
const flat = await page.eval(() => ({
  toggle: document.querySelector('[data-map-3d]')?.textContent ?? '',
  pressed: document.querySelector('[data-map-3d]')?.getAttribute('aria-pressed') ?? '',
}));

await page.eval(() => document.querySelector('[data-map-3d]')?.click());
await sleep(1200);
const threeD = await page.eval(() => ({
  toggle: document.querySelector('[data-map-3d]')?.textContent ?? '',
  pressed: document.querySelector('[data-map-3d]')?.getAttribute('aria-pressed') ?? '',
}));

console.log(JSON.stringify({ ready, before, flat, threeD, consoleErrors: page.consoleErrors }, null, 2));
await page.close();
await browser.close();

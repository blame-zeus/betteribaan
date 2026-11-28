// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Static output, no adapter and no backend. The directory is a prebuilt set of
 * pages; search and filtering run in the visitor's browser. The production
 * origin comes from the environment so no domain is baked in before one exists.
 */
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  compressHTML: false,
  vite: {
    // The barangay map imports MapLibre lazily. Pre-bundling it stops the dev
    // server from re-optimising mid-session, which breaks that import.
    optimizeDeps: { include: ['maplibre-gl'] },
  },
});

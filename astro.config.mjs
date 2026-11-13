// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { site } from './src/site.config.ts';

// https://astro.build/config
export default defineConfig({
  // Canonical URL comes from the single site config; undefined until a domain is chosen.
  site: site.domain ? `https://${site.domain}` : undefined,
  integrations: [mdx()],
  trailingSlash: 'ignore',
});

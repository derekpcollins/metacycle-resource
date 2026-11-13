// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { site } from './src/site.config.ts';

/**
 * Builds the Pagefind search index into dist/pagefind after every `astro build`, so it
 * runs no matter which build command a host uses (Vercel's Astro preset included).
 * Only elements marked `data-pagefind-body` (part, guide and troubleshooting pages) are
 * indexed. @returns {import('astro').AstroIntegration}
 */
function pagefind() {
  return {
    name: 'pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const { createIndex, close } = await import('pagefind');
        const outDir = decodeURIComponent(dir.pathname); // file:// URL → path (POSIX hosts)
        const { index, errors } = await createIndex({});
        if (!index) throw new Error(`Pagefind failed to start: ${errors.join(', ')}`);
        const added = await index.addDirectory({ path: outDir });
        if (added.errors.length) throw new Error(`Pagefind: ${added.errors.join(', ')}`);
        const written = await index.writeFiles({ outputPath: `${outDir}pagefind` });
        if (written.errors.length) throw new Error(`Pagefind: ${written.errors.join(', ')}`);
        logger.info(`indexed ${added.page_count} pages`);
        await close();
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  // Canonical URL comes from the single site config; undefined until a domain is chosen.
  site: site.domain ? `https://${site.domain}` : undefined,
  integrations: [mdx(), pagefind()],
  trailingSlash: 'ignore',
});

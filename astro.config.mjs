// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { site, siteUrl } from './src/site.config.ts';

/** Utility pages kept out of sitemap.xml (they also carry noindex). */
const SITEMAP_EXCLUDE = new Set(['/404', '/search', '/contribute/thanks', '/contribute/form']);

/**
 * Writes dist/sitemap.xml from the built HTML pages, so every route is listed without a
 * hand-kept list. URLs use the canonical form (site domain, no trailing slash).
 * @returns {import('astro').AstroIntegration}
 */
function sitemap() {
  return {
    name: 'sitemap',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const outDir = decodeURIComponent(dir.pathname);
        const files = await readdir(outDir, { recursive: true });
        const paths = files
          .filter((f) => f.endsWith('.html') && !f.startsWith(`pagefind${sep}`))
          .map((f) => {
            const p = `/${relative(outDir, join(outDir, f)).split(sep).join('/')}`;
            return p.replace(/\/?index\.html$/, '').replace(/\.html$/, '') || '/';
          })
          .filter((p) => !SITEMAP_EXCLUDE.has(p))
          .sort();
        const urls = paths.map((p) => `  <url><loc>${siteUrl}${p}</loc></url>`).join('\n');
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        await writeFile(join(outDir, 'sitemap.xml'), xml);
        logger.info(`sitemap.xml: ${paths.length} URLs`);
      },
    },
  };
}

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
  integrations: [mdx(), pagefind(), sitemap()],
  trailingSlash: 'ignore',
});

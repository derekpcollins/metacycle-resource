import type { APIRoute } from 'astro';
import { site, siteUrl } from '../site.config';

/**
 * robots.txt follows site.indexable. Before launch, crawling stays allowed on purpose:
 * every page carries `noindex`, and a crawler can only see that tag if it may fetch the
 * page (a Disallow would let externally linked URLs show up in results without a snippet).
 */
export const GET: APIRoute = () => {
  const body = [
    site.indexable
      ? `# ${site.name}: open to search engines.`
      : `# ${site.name}: private beta. Every page carries noindex until the public launch.`,
    'User-agent: *',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

/**
 * Changelog view model: src/data/changelog.json (generated from merged pull requests by
 * scripts/changelog.ts) plus the site pages each change touched, worked out from the
 * files it changed. Build time only.
 */
import { getCollection } from 'astro:content';
import data from '../data/changelog.json';

export interface ChangedPage {
  href: string;
  label: string;
}

/** Site route for a repo file, if the file is (or feeds) one page. */
function routeOf(file: string): { href: string; key?: string; label?: string } | undefined {
  const content = file.match(
    /^src\/content\/(parts|vendors|tools|guides|troubleshooting)\/(.+)\.(ya?ml|mdx)$/,
  );
  if (content) return { href: `/${content[1]}/${content[2]}`, key: `${content[1]}/${content[2]}` };
  if (file === 'src/data/specs.ts') return { href: '/specs', label: 'Specs' };
  if (file === 'src/data/community.ts') return { href: '/community', label: 'Community' };
  if (file === 'src/lib/help-wanted.ts')
    return { href: '/contribute/help-wanted', label: 'Help wanted' };
  const page = file.match(/^src\/pages\/(.+)\.astro$/);
  if (page && !page[1].includes('[')) {
    const href = `/${page[1].replace(/(^|\/)index$/, '')}`.replace(/\/$/, '') || '/';
    return { href, label: href === '/' ? 'Home' : href.slice(1).replace(/\//g, ' / ') };
  }
  return undefined;
}

export async function changelog() {
  const [parts, vendors, tools, guides, fixes] = await Promise.all([
    getCollection('parts'),
    getCollection('vendors'),
    getCollection('tools'),
    getCollection('guides'),
    getCollection('troubleshooting'),
  ]);
  // Key YAML entries by file name (a file's name may differ from its `id`).
  const titles = new Map<string, { label: string; href: string }>();
  const byFile = (dir: string, e: { id: string; filePath?: string }, label: string) => {
    const name = e.filePath
      ?.split('/')
      .pop()
      ?.replace(/\.(ya?ml|mdx)$/, '');
    if (name) titles.set(`${dir}/${name}`, { label, href: `/${dir}/${e.id}` });
  };
  for (const e of parts) byFile('parts', e, e.data.name);
  for (const e of vendors) byFile('vendors', e, e.data.name);
  for (const e of tools) byFile('tools', e, e.data.name);
  for (const e of guides) byFile('guides', e, e.data.title);
  for (const e of fixes) byFile('troubleshooting', e, e.data.symptom);
  return data.entries.map((e) => {
    const pages: ChangedPage[] = [];
    let other = 0;
    for (const f of e.files) {
      const r = routeOf(f);
      if (!r) {
        other++;
        continue;
      }
      if (r.key) {
        const t = titles.get(r.key);
        if (t) pages.push(t); // else removed or renamed since: no page to link
      } else pages.push({ href: r.href, label: r.label ?? r.href });
    }
    const seen = new Set<string>();
    return {
      ...e,
      pages: pages.filter((p) => !seen.has(p.href) && seen.add(p.href)),
      otherFiles: other,
    };
  });
}

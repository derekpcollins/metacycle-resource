/**
 * Help Wanted data (docs/SPEC.md → "Staleness badge", Contribute → Help Wanted), built at
 * build time from content. Nothing here is a hand-kept list: buy links come from part
 * files, unknowns from `TODO` values and notes, spec gaps from src/data/specs.ts, and
 * unverified guides from guide frontmatter. Staleness uses src/lib/staleness.ts, the same
 * rule as the "needs re-check" badge and the link checker.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { gaps } from '../data/specs';
import { repoPath } from './content';
import { needsHuman } from './link-rules';
import { checkReasons, summarize, type CheckReason } from './staleness';

export interface BuyLinkItem {
  part: CollectionEntry<'parts'>;
  vendorId: string;
  vendorName: string;
  url: string;
  index: number;
  reasons: CheckReason[];
  /** Store blocks automated checks, so only a person can verify it. */
  byHand: boolean;
  file?: string;
}

export interface OpenQuestion {
  /** The page it's on, e.g. /guides/seat-upgrades */
  page: string;
  pageTitle: string;
  kind: 'guide' | 'troubleshooting' | 'vendor';
  /** What's unknown, in the content's own words. */
  text: string;
  system?: string;
  file?: string;
}

/** Turns an MDX/markdown snippet into plain text: no tags, link text kept, one line. */
const plain = (s: string) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Every "TODO…" sentence in a block of MDX: from TODO to the end of that sentence. */
export function todoSentences(text: string): string[] {
  const out: string[] = [];
  for (const para of text.split(/\n\s*\n/)) {
    const flat = plain(para);
    for (const m of flat.matchAll(/TODO[:,]?\s*(.+?(?:[.?!](?=\s|$)|$))/g)) {
      const t = m[1].trim();
      // Skip notes about the site's own roadmap ("… downloads page (Phase 6)"): not a
      // question an owner can answer.
      if (/\bPhase \d\b/.test(t)) continue;
      if (t) out.push(t.charAt(0).toUpperCase() + t.slice(1));
    }
  }
  return out;
}

export async function helpWanted(now = Date.now()) {
  const [parts, vendors, guides, fixes] = await Promise.all([
    getCollection('parts'),
    getCollection('vendors'),
    getCollection('guides'),
    getCollection('troubleshooting'),
  ]);
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const byName = (a: { data: { name: string } }, b: { data: { name: string } }) =>
    a.data.name.localeCompare(b.data.name);

  // ---- buy links ----
  const allSources = parts.flatMap((p) => p.data.sources);
  const buyLinks: BuyLinkItem[] = parts.sort(byName).flatMap((part) =>
    part.data.sources.flatMap((s, index) => {
      const reasons = checkReasons(s, now);
      if (!reasons.length) return [];
      return [
        {
          part,
          vendorId: s.vendor.id,
          vendorName: vendorById.get(s.vendor.id)?.data.name ?? s.vendor.id,
          url: s.url,
          index,
          reasons,
          byHand: s.url !== 'TODO' && needsHuman(s.url),
          file: repoPath(part),
        },
      ];
    }),
  );
  const groups = new Map<string, BuyLinkItem[]>();
  for (const item of buyLinks)
    groups.set(item.vendorId, [...(groups.get(item.vendorId) ?? []), item]);
  const byVendor = [...groups.entries()]
    .map(([id, items]) => ({ id, name: items[0].vendorName, items }))
    .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name));

  // ---- unknown values (TODO) ----
  const questions: OpenQuestion[] = [];
  for (const v of vendors.sort(byName))
    if (v.data.url === 'TODO')
      questions.push({
        page: `/vendors/${v.id}`,
        pageTitle: v.data.name,
        kind: 'vendor',
        text: 'The store’s own URL isn’t known yet.',
        file: repoPath(v),
      });
  for (const g of guides.sort((a, b) => a.data.title.localeCompare(b.data.title))) {
    const page = `/guides/${g.id}`;
    const base = {
      page,
      pageTitle: g.data.title,
      kind: 'guide' as const,
      system: g.data.system,
      file: repoPath(g),
    };
    if (g.data.time_minutes === 'TODO')
      questions.push({ ...base, text: 'How long the job takes (time estimate).' });
    for (const text of todoSentences(g.body ?? '')) questions.push({ ...base, text });
  }
  for (const t of fixes.sort((a, b) => a.data.symptom.localeCompare(b.data.symptom))) {
    const base = {
      page: `/troubleshooting/${t.id}`,
      pageTitle: t.data.symptom,
      kind: 'troubleshooting' as const,
      system: t.data.system,
      file: repoPath(t),
    };
    const fromChecks = t.data.checks.flatMap((c) => [c.step, c.pass, c.fail]).join('\n\n');
    for (const text of todoSentences(`${fromChecks}\n\n${t.body ?? ''}`))
      questions.push({ ...base, text });
  }

  // ---- guides not yet verified (same test as the guide page's "verified: not yet") ----
  const unverifiedGuides = guides
    .filter((g) => !g.data.verified_by)
    .sort((a, b) => a.data.title.localeCompare(b.data.title));

  const stale = summarize(allSources, now);
  return {
    byVendor,
    buyLinks,
    questions,
    gaps,
    unverifiedGuides,
    counts: {
      ...stale,
      byHand: buyLinks.filter((b) => b.byHand).length,
      questions: questions.length,
      gaps: gaps.length,
      unverifiedGuides: unverifiedGuides.length,
      /** Everything a visitor could help with on the page. */
      allItems: buyLinks.length + questions.length + gaps.length + unverifiedGuides.length,
    },
  };
}

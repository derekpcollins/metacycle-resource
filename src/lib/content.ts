import { getCollection, type CollectionEntry } from 'astro:content';

export type Part = CollectionEntry<'parts'>;
export type Guide = CollectionEntry<'guides'>;

/** Repo-relative path of an entry's source file, for "Edit this page". */
export const repoPath = (entry: { filePath?: string }) =>
  entry.filePath ? entry.filePath.replace(/^\.?\//, '') : undefined;

export const formatDate = (d: Date | 'TODO' | undefined) =>
  d === undefined ? '—' : d === 'TODO' ? 'TODO' : d.toISOString().slice(0, 10);

/** The staleness rule lives in src/lib/staleness.ts (one helper for every consumer). */
export { isStale } from './staleness';

/** `used_in` for tools — derived from guides, never typed (spec). */
export async function guidesUsingTool(toolId: string) {
  const guides = await getCollection('guides');
  return guides.filter((g) => g.data.tools.some((t) => t.id === toolId));
}

/** Two-way part ↔ guide links: guides listed on the part plus guides that list the part. */
export async function guidesForPart(part: Part) {
  const guides = await getCollection('guides');
  const declared = new Set(part.data.related_guides.map((g) => g.id));
  return guides.filter((g) => declared.has(g.id) || g.data.parts.some((p) => p.id === part.id));
}

export async function partsFromVendor(vendorId: string) {
  const parts = await getCollection('parts');
  return parts.filter((p) => p.data.sources.some((s) => s.vendor.id === vendorId));
}

/**
 * Build-time integrity checks that Zod can't express on its own.
 *
 * Astro only *logs* broken `reference()` targets; this module throws, so a bad
 * contribution fails the build. It runs from src/pages/content-check.json.ts, which is
 * prerendered on every build.
 */
import { getCollection } from 'astro:content';

type Ref = { id: string; collection: string };

export async function validateContent() {
  const [parts, vendors, tools, guides, troubleshooting] = await Promise.all([
    getCollection('parts'),
    getCollection('vendors'),
    getCollection('tools'),
    getCollection('guides'),
    getCollection('troubleshooting'),
  ]);

  const ids = {
    parts: new Set(parts.map((e) => e.id)),
    vendors: new Set(vendors.map((e) => e.id)),
    tools: new Set(tools.map((e) => e.id)),
    guides: new Set(guides.map((e) => e.id)),
    troubleshooting: new Set(troubleshooting.map((e) => e.id)),
  } as Record<string, Set<string>>;

  const errors: string[] = [];
  const checkRef = (owner: string, field: string, ref: Ref | undefined) => {
    if (!ref) return;
    if (!ids[ref.collection]?.has(ref.id)) {
      errors.push(`${owner} → ${field}: "${ref.id}" does not exist in ${ref.collection}`);
    }
  };

  // YAML entries: the `id` field must match the file name so edit links resolve.
  for (const e of [...parts, ...vendors, ...tools]) {
    const file = e.filePath
      ?.split('/')
      .pop()
      ?.replace(/\.ya?ml$/, '');
    if (file && file !== e.id) {
      errors.push(`${e.collection}/${file}: id "${e.id}" must match the file name`);
    }
  }

  for (const p of parts) {
    const owner = `parts/${p.id}`;
    p.data.sources.forEach((s, i) => checkRef(owner, `sources[${i}].vendor`, s.vendor));
    p.data.related_guides.forEach((g, i) => checkRef(owner, `related_guides[${i}]`, g));
  }

  for (const g of guides) {
    const owner = `guides/${g.id}`;
    g.data.tools.forEach((t, i) => checkRef(owner, `tools[${i}]`, t));
    g.data.parts.forEach((p, i) => checkRef(owner, `parts[${i}]`, p));
  }

  for (const t of troubleshooting) {
    const owner = `troubleshooting/${t.id}`;
    t.data.fix.forEach((f, i) => {
      checkRef(owner, `fix[${i}].guide`, f.guide);
      checkRef(owner, `fix[${i}].part`, f.part);
    });
  }

  if (errors.length) {
    throw new Error(`Content validation failed (${errors.length}):\n  - ${errors.join('\n  - ')}`);
  }

  return {
    ok: true,
    counts: Object.fromEntries(Object.entries(ids).map(([k, v]) => [k, v.size])),
  };
}

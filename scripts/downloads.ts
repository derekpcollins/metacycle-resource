#!/usr/bin/env tsx
/**
 * Helpers for mirrored downloads (src/data/downloads.yaml → /downloads).
 *
 *   npm run downloads:hash -- <file>...   print size_bytes + sha256 for each file (YAML)
 *   npm run downloads:check               every entry's asset exists in its Release, same size
 *   npm run downloads:check -- --sha      ...and download each asset to confirm its SHA-256
 *
 * The check uses GitHub's public REST API (no token needed once the downloads repo is
 * public; set GITHUB_TOKEN to avoid the 60-requests/hour anonymous limit).
 */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { parse } from 'yaml';
import { downloadUrl, site } from '../src/site.config.ts';

type Entry = { id: string; release: string; asset: string; size_bytes: number; sha256: string };

const sha256 = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
const [cmd, ...args] = process.argv.slice(2);

if (cmd === 'hash') {
  if (!args.length) throw new Error('usage: npm run downloads:hash -- <file>...');
  for (const f of args) {
    const b = await readFile(f);
    console.log(`# ${basename(f)}\n  size_bytes: ${b.length}\n  sha256: ${sha256(b)}`);
  }
} else if (cmd === 'check') {
  const entries = parse(await readFile('src/data/downloads.yaml', 'utf8')) as Entry[];
  const repo = new URL(site.downloadsRepoUrl).pathname.replace(/^\/|\/$/g, '');
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const releases = new Map<string, Map<string, number>>();
  let bad = 0;
  for (const e of entries) {
    if (!releases.has(e.release)) {
      const r = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${e.release}`, {
        headers,
      });
      if (!r.ok) throw new Error(`release ${e.release} in ${repo}: HTTP ${r.status}`);
      const json = (await r.json()) as { assets: { name: string; size: number }[] };
      releases.set(e.release, new Map(json.assets.map((a) => [a.name, a.size])));
    }
    const size = releases.get(e.release)!.get(e.asset);
    let problem =
      size === undefined
        ? 'not in the release'
        : size !== e.size_bytes
          ? `size ${size} ≠ ${e.size_bytes}`
          : '';
    if (!problem && args.includes('--sha')) {
      const r = await fetch(downloadUrl(e.release, e.asset));
      const got = r.ok ? sha256(new Uint8Array(await r.arrayBuffer())) : `HTTP ${r.status}`;
      if (got !== e.sha256) problem = `sha256 ${got} ≠ listed`;
    }
    console.log(`${problem ? '✗' : '✓'} ${e.release}/${e.asset}${problem ? `: ${problem}` : ''}`);
    if (problem) bad++;
  }
  // Assets in a release that no entry lists are worth knowing about too.
  for (const [tag, assets] of releases)
    for (const name of assets.keys())
      if (!entries.some((e) => e.release === tag && e.asset === name))
        console.log(`? ${tag}/${name}: in the release but not in downloads.yaml`);
  process.exit(bad ? 1 : 0);
} else {
  console.error('usage: downloads.ts hash <file>... | check [--sha]');
  process.exit(2);
}

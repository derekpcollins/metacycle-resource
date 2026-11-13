/**
 * Link checker (docs/SPEC.md → "Weekly link checker", "On every PR"; decisions in
 * docs/PHASES.md → Phase 5).
 *
 *   npm run links:check                       dry run: check every buy-option and vendor URL,
 *                                             print the report, change nothing
 *   npm run links:check -- --apply            also set `status: dead` on buy options whose
 *                                             page is provably gone (HTTP 404/410 or the
 *                                             domain no longer exists), then regenerate
 *                                             docs/VERIFICATION.md
 *   npm run links:check -- --changed-since origin/main
 *                                             PR mode: only URLs added or changed in content
 *                                             files since that ref; exits 1 on a dead link
 *
 * Other flags: --report <file> (markdown report), --json <file> (machine-readable results),
 * --summary (append to $GITHUB_STEP_SUMMARY), --limit <n> (first n URLs, for testing),
 * --only <url> (repeatable).
 *
 * Rules it never breaks: it never sets `last_verified` or `status: live` (only a person
 * does that), and it never fetches hosts in src/lib/link-rules.ts NEEDS_HUMAN_HOSTS
 * (AliExpress and other bot-blocking stores), which are reported as "needs a human".
 * Politeness: two hosts at a time, one request at a time per host with a pause between,
 * a 20 s timeout, one retry, and a User-Agent that says what it is.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseDocument, type Scalar } from 'yaml';
import { editUrl, site, siteUrl } from '../src/site.config.js';
import {
  FAILURE_OUTCOMES,
  LINK_OUTCOMES,
  needsHuman,
  type LinkOutcome,
} from '../src/lib/link-rules.js';
import { summarize } from '../src/lib/staleness.js';
import { classify, type Classified, type FetchResult } from './lib/link-classify.js';
import { ROOT, loadParts, loadVendors } from './lib/content-files.js';

// ---------- options ----------

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const opts = {
  apply: flag('apply'),
  changedSince: opt('changed-since'),
  report: opt('report'),
  json: opt('json'),
  summary: flag('summary'),
  limit: opt('limit') ? Number(opt('limit')) : undefined,
  only: argv.flatMap((a, i) => (argv[i - 1] === '--only' ? [a] : [])),
};

const USER_AGENT = `${site.shortName.replace(/\s+/g, '')}-LinkChecker/1.0 (+${siteUrl}/contribute#checker)`;
const TIMEOUT_MS = 20_000;
const HOST_CONCURRENCY = 2;
const PER_HOST_GAP_MS = 1_500;
const RETRY_GAP_MS = 5_000;
// Shopify pages put >1 MB of inline script before <title>, so read up to 3 MB.
const MAX_BODY = 3_000_000;
const MARKER = '<!-- metacycle-link-checker -->';

// ---------- targets ----------

interface Usage {
  kind: 'buy-option' | 'vendor' | 'other';
  file: string;
  label: string;
  vendor?: string;
  partId?: string;
  /** Index into the part's `sources`, for --apply. */
  index?: number;
  status?: string;
}
interface Target {
  url: string;
  usages: Usage[];
}

const parts = loadParts();
const vendors = loadVendors();
const vendorName = (id: string) => vendors.find((v) => v.data.id === id)?.data.name ?? id;

function allTargets(): Map<string, Target> {
  const map = new Map<string, Target>();
  const add = (url: string, u: Usage) => {
    if (!/^https?:\/\//.test(url)) return; // TODO and anything odd
    const t = map.get(url) ?? { url, usages: [] };
    t.usages.push(u);
    map.set(url, t);
  };
  for (const p of parts)
    (p.data.sources ?? []).forEach((s, index) =>
      add(s.url, {
        kind: 'buy-option',
        file: p.file,
        label: p.data.name,
        vendor: vendorName(s.vendor),
        partId: p.data.id,
        index,
        status: s.status,
      }),
    );
  for (const v of vendors)
    add(v.data.url, { kind: 'vendor', file: v.file, label: `${v.data.name} (vendor page)` });
  return map;
}

// ---------- PR mode: URLs added or changed since a ref ----------

const URL_RE = /https?:\/\/[^\s"'<>)\]`|]+/g;
const urlsIn = (text: string) =>
  new Set([...text.matchAll(URL_RE)].map((m) => m[0].replace(/[.,;:!?*_]+$/, '')));
const git = (...args: string[]) =>
  execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

/** Content files changed since `ref`, and the URLs that appear in them now but didn't before. */
function changedUrls(ref: string) {
  const base = git('merge-base', ref, 'HEAD').trim();
  const files = git(
    'diff',
    '--name-only',
    '--diff-filter=AM',
    base,
    'HEAD',
    '--',
    'src/content',
    'src/data/specs.ts',
    'src/data/community.ts',
  )
    .split('\n')
    .filter((f) => /\.(ya?ml|mdx?|ts)$/.test(f));
  const added = new Map<string, string>(); // url → file
  for (const file of files) {
    let before = new Set<string>();
    try {
      before = urlsIn(git('show', `${base}:${file}`));
    } catch {
      // new file: nothing before
    }
    for (const u of urlsIn(readFileSync(join(ROOT, file), 'utf8')))
      if (!before.has(u) && !added.has(u)) added.set(u, file);
  }
  return { files, added };
}

// ---------- fetching ----------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchOnce(url: string): Promise<FetchResult> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
        'accept-language': 'en-US,en;q=0.8',
      },
    });
    let body = '';
    const type = res.headers.get('content-type') ?? '';
    if (res.body && /html|xml|text/i.test(type)) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (body.length < MAX_BODY) {
        const { done, value } = await reader.read();
        if (done) break;
        body += decoder.decode(value, { stream: true });
      }
      await reader.cancel().catch(() => {});
    } else {
      await res.body?.cancel().catch(() => {});
    }
    return { status: res.status, finalUrl: res.url, body };
  } catch (e) {
    const err = e as { name?: string; cause?: { code?: string } };
    if (err.name === 'TimeoutError' || err.name === 'AbortError') return { error: 'TIMEOUT' };
    return { error: err.cause?.code ?? err.name ?? 'ERROR' };
  }
}

/** Fetch with one retry for anything that isn't a clear live/blocked answer. */
async function check(url: string): Promise<Classified> {
  if (needsHuman(url))
    return {
      outcome: 'needs-human',
      detail: 'store blocks automated checks; not fetched',
      provablyDead: false,
    };
  let c = classify(url, await fetchOnce(url));
  if (c.outcome === 'dead' || c.outcome === 'unreachable') {
    await sleep(RETRY_GAP_MS);
    const again = classify(url, await fetchOnce(url));
    // Dead only if both attempts agree; otherwise keep the second answer.
    c = c.outcome === 'dead' && again.outcome === 'dead' ? c : again;
  }
  return c;
}

/** Checks URLs politely: HOST_CONCURRENCY hosts at once, one request at a time per host. */
async function checkAll(urls: string[]) {
  const byHost = new Map<string, string[]>();
  for (const u of urls) {
    const h = new URL(u).hostname;
    byHost.set(h, [...(byHost.get(h) ?? []), u]);
  }
  const queue = [...byHost.values()];
  const results = new Map<string, Classified>();
  let done = 0;
  async function worker() {
    for (let list = queue.shift(); list; list = queue.shift()) {
      for (const [i, u] of list.entries()) {
        const fetched = !needsHuman(u);
        results.set(u, await check(u));
        done++;
        process.stderr.write(
          `  [${done}/${urls.length}] ${results.get(u)!.outcome.padEnd(12)} ${u}\n`,
        );
        if (fetched && i < list.length - 1) await sleep(PER_HOST_GAP_MS);
      }
    }
  }
  await Promise.all(Array.from({ length: HOST_CONCURRENCY }, worker));
  return results;
}

// ---------- applying provable deaths ----------

async function applyDead(rows: Row[]) {
  const changes: {
    file: string;
    index: number;
    url: string;
    label: string;
    vendor?: string;
    detail: string;
  }[] = [];
  const byFile = new Map<string, Row[]>();
  for (const r of rows)
    for (const u of r.target.usages)
      if (r.result.provablyDead && u.kind === 'buy-option' && u.status !== 'dead')
        byFile.set(u.file, [...(byFile.get(u.file) ?? []), r]);
  for (const [file, list] of byFile) {
    // Replace just the status value, found by its source range, so the rest of the file
    // (comments, folded text, key order) stays byte-for-byte the same.
    const path = join(ROOT, file);
    let text = readFileSync(path, 'utf8');
    const doc = parseDocument(text);
    const edits: { start: number; end: number; usage: Usage; row: Row }[] = [];
    for (const r of list)
      for (const u of r.target.usages.filter((x) => x.file === file && x.kind === 'buy-option')) {
        if (u.index === undefined || u.status === 'dead') continue;
        const node = doc.getIn(['sources', u.index, 'status'], true) as Scalar | undefined;
        const range = node?.range;
        if (!range || edits.some((e) => e.start === range[0])) continue;
        edits.push({ start: range[0], end: range[1], usage: u, row: r });
      }
    for (const e of edits.sort((a, b) => b.start - a.start)) {
      text = text.slice(0, e.start) + 'dead' + text.slice(e.end);
      changes.push({
        file,
        index: e.usage.index!,
        url: e.row.target.url,
        label: e.usage.label,
        vendor: e.usage.vendor,
        detail: e.row.result.detail,
      });
    }
    writeFileSync(path, text);
  }
  if (changes.length)
    execFileSync('npx', ['tsx', 'scripts/verify-list.ts'], { cwd: ROOT, stdio: 'inherit' });
  return changes;
}

// ---------- report ----------

interface Row {
  target: Target;
  result: Classified;
}

const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
const usageCell = (t: Target) =>
  t.usages.length
    ? t.usages
        .map((u) =>
          u.kind === 'buy-option'
            ? `**${esc(u.label)}** · ${esc(u.vendor ?? '')} · [edit](${editUrl(u.file)}) \`sources[${u.index}]\``
            : u.kind === 'vendor'
              ? `**${esc(u.label)}** · [edit](${editUrl(u.file)})`
              : `\`${u.file}\``,
        )
        .join('<br>')
    : '—';

function table(rows: Row[], withTitle = false) {
  const head = withTitle
    ? '| Where | URL | Result | Page title |\n| --- | --- | --- | --- |'
    : '| Where | URL | Result |\n| --- | --- | --- |';
  return [
    head,
    ...rows.map(
      (r) =>
        `| ${usageCell(r.target)} | <${r.target.url}> | ${esc(r.result.detail)} |${withTitle ? ` ${esc(r.result.title ?? '—')} |` : ''}`,
    ),
  ].join('\n');
}

const count = (rows: Row[], o: LinkOutcome) => rows.filter((r) => r.result.outcome === o).length;

function issueReport(rows: Row[], applied: Awaited<ReturnType<typeof applyDead>>, runUrl?: string) {
  const failures = rows.filter((r) => FAILURE_OUTCOMES.includes(r.result.outcome));
  const sources = parts.flatMap((p) => p.data.sources ?? []);
  const stale = summarize(sources);
  const today = new Date().toISOString().slice(0, 10);
  const out: string[] = [MARKER];
  out.push(
    `Weekly link check, **${today}**: ${rows.length} URLs (buy options and vendor pages).${runUrl ? ` [Run log](${runUrl}).` : ''}`,
  );
  out.push(
    Object.entries(LINK_OUTCOMES)
      .map(([k, label]) => `- ${label}: **${count(rows, k as LinkOutcome)}**`)
      .join('\n'),
  );
  if (!failures.length)
    out.push('✅ No failures. This issue closes itself when a run has no failures.');
  if (applied.length)
    out.push(
      `**Pull request:** ${applied.length} buy option${applied.length === 1 ? '' : 's'} set to \`status: dead\` on branch \`link-checker/dead-links\`; the workflow opens or updates one pull request from it. The checker never sets \`last_verified\`.`,
    );
  const section = (o: LinkOutcome, intro: string, withTitle = false) => {
    const list = rows.filter((r) => r.result.outcome === o);
    if (list.length)
      out.push(`## ${LINK_OUTCOMES[o]} (${list.length})`, intro, table(list, withTitle));
  };
  section(
    'dead',
    'HTTP 404/410 or the domain is gone, on two tries. Find a replacement listing or remove the buy option.',
  );
  section(
    'out-of-stock',
    'The page’s structured data says out of stock. Check by hand, then set `status: out-of-stock` if it’s true.',
    true,
  );
  section(
    'moved',
    'The link now lands on the store’s home page, which usually means the product was removed. Check by hand.',
    true,
  );
  section(
    'unreachable',
    'Timeouts, server errors or connection failures on two tries. Often temporary; check again if it repeats next week.',
  );
  const human = rows.filter((r) => r.result.outcome === 'needs-human');
  if (human.length)
    out.push(
      `## ${LINK_OUTCOMES['needs-human']} (${human.length})`,
      `These stores block automated checks (or answered with a bot wall), so the checker never marks them dead. They stay \`unverified\` until a person checks them; they’re listed on [Help Wanted](${siteUrl}/contribute/help-wanted).`,
      `<details><summary>Show the ${human.length} links</summary>\n\n${table(human)}\n\n</details>`,
    );
  out.push(
    `## Staleness`,
    `${stale.needsCheck} of ${stale.total} buy options need a person to check them (never verified or older than ${site.staleAfterDays} days: ${stale.stale}; no price: ${stale.noPrice}). See [Help Wanted](${siteUrl}/contribute/help-wanted) or \`docs/VERIFICATION.md\`.`,
  );
  out.push(
    `_Generated by \`npm run links:check\`. Edit links open the file on \`${site.editBranch}\`._`,
  );
  return { body: out.join('\n\n'), failures: failures.length };
}

function prReport(rows: Row[], files: string[]) {
  const out: string[] = ['## Link check (changed content)'];
  if (!files.length) {
    out.push('No content files changed in this pull request, so the link check was skipped.');
    return out.join('\n\n');
  }
  if (!rows.length) {
    out.push(
      `${files.length} content file${files.length === 1 ? '' : 's'} changed, but no new or changed URLs.`,
    );
    return out.join('\n\n');
  }
  const dead = rows.filter((r) => r.result.outcome === 'dead');
  out.push(
    dead.length
      ? `❌ **${dead.length} dead link${dead.length === 1 ? '' : 's'}** (HTTP 404/410 or the domain is gone). Fix or remove ${dead.length === 1 ? 'it' : 'them'} before merging.`
      : '✅ No dead links. Blocked stores and temporary errors don’t fail the check.',
  );
  out.push(
    '| URL | Result | Detail | Page title |\n| --- | --- | --- | --- |\n' +
      rows
        .map(
          (r) =>
            `| <${r.target.url}> | ${LINK_OUTCOMES[r.result.outcome]} | ${esc(r.result.detail)} | ${esc(r.result.title ?? '—')} |`,
        )
        .join('\n'),
  );
  return out.join('\n\n');
}

// ---------- main ----------

async function main() {
  const all = allTargets();
  let targets: Target[];
  let changedFiles: string[] = [];
  if (opts.changedSince) {
    const { files, added } = changedUrls(opts.changedSince);
    changedFiles = files;
    targets = [...added].map(
      ([url, file]) => all.get(url) ?? { url, usages: [{ kind: 'other', file, label: file }] },
    );
  } else if (opts.only.length) {
    targets = opts.only.map((u) => all.get(u) ?? { url: u, usages: [] });
  } else {
    targets = [...all.values()];
  }
  if (opts.limit) targets = targets.slice(0, opts.limit);

  process.stderr.write(`Checking ${targets.length} URLs as "${USER_AGENT}"\n`);
  const results = targets.length ? await checkAll(targets.map((t) => t.url)) : new Map();
  const rows: Row[] = targets.map((t) => ({ target: t, result: results.get(t.url)! }));

  const applied = opts.apply ? await applyDead(rows) : [];
  const runUrl = process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : undefined;

  const report = opts.changedSince
    ? { body: prReport(rows, changedFiles), failures: count(rows, 'dead') }
    : issueReport(rows, applied, runUrl);

  if (opts.report) writeFileSync(opts.report, report.body + '\n');
  if (opts.summary && process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, report.body + '\n');
  if (opts.json)
    writeFileSync(
      opts.json,
      JSON.stringify(
        {
          checked: rows.length,
          failures: report.failures,
          counts: Object.fromEntries(
            Object.keys(LINK_OUTCOMES).map((o) => [o, count(rows, o as LinkOutcome)]),
          ),
          applied,
          results: rows.map((r) => ({ url: r.target.url, ...r.result, usages: r.target.usages })),
        },
        null,
        2,
      ) + '\n',
    );
  if (!opts.report && !opts.summary) console.log(report.body);
  else
    console.log(
      `${rows.length} URLs checked; ${report.failures} failure(s); ${applied.length} buy option(s) set to dead.`,
    );

  if (opts.changedSince && count(rows, 'dead') > 0) process.exit(1);
}

await main();

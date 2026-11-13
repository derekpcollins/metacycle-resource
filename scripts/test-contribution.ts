#!/usr/bin/env tsx
/**
 * Tests the web-form path without the network: validation, labels and issue formatting
 * (src/lib/contribution.ts), and the serverless function (api/contribute.ts) with
 * Turnstile and GitHub stubbed out. Run with `npm run test:contribution`.
 */
import assert from 'node:assert/strict';
import { generateKeyPairSync, createVerify } from 'node:crypto';
import {
  validate,
  labelsFor,
  issueBody,
  issueTitle,
  partOptions,
  partIdOf,
  SUGGEST_KINDS,
} from '../src/lib/contribution.ts';
import { appJwt, _reset } from '../api/_lib/server.ts';

let passed = 0;
const test = async (name: string, fn: () => void | Promise<void>) => {
  await fn();
  passed++;
  console.log(`✓ ${name}`);
};

const part = partOptions()[2]; // first real part
const good = {
  type: 'fix',
  part,
  summary: 'Reset fixed the dead horn',
  details: 'Did the 9-step reset, @someone said so in #12.',
  license: 'on',
};

// ---------- validation & formatting ----------

await test('valid fix passes', () => assert.equal(validate(good).ok, true));
await test('unknown type is rejected', () => {
  const r = validate({ ...good, type: 'hack' });
  assert.equal(r.ok, false);
});
await test('missing required fields are reported', () => {
  const r = validate({ type: 'broken-link' });
  assert.equal(r.ok, false);
  if (!r.ok)
    for (const f of ['part', 'url', 'problem', 'summary', 'license']) assert.ok(r.errors[f], f);
});
await test('dropdown values must be real options', () => {
  const r = validate({ ...good, part: 'Flux capacitor · flux' });
  assert.equal(r.ok, false);
});
await test('broken-link URL must be http(s)', () => {
  const r = validate({
    type: 'broken-link',
    part,
    url: 'javascript:alert(1)',
    problem: 'Out of stock',
    summary: 'Gone',
    license: 'on',
  });
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(r.errors.url);
});
await test('over-long text is rejected', () => {
  assert.equal(validate({ ...good, details: 'x'.repeat(5001) }).ok, false);
});
await test('control characters are stripped', () => {
  const r = validate({ ...good, summary: 'Reset\u0000 fixed it' });
  assert.ok(r.ok && r.submission.values.summary === 'Reset fixed it');
});
await test('labels: fix without source → needs-source', () => {
  const r = validate(good);
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(labelsFor(r.submission), ['fix', 'needs-source']);
});
await test('labels: vendor suggestion with a source', () => {
  const r = validate({
    type: 'suggest',
    kind: SUGGEST_KINDS.vendor,
    summary: 'A store with parts',
    details: 'Sells controllers',
    source: 'https://example.com',
    license: 'on',
  });
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(labelsFor(r.submission), ['new-vendor']);
});
await test('issue body defangs mentions and refs, uses issue-form headings', () => {
  const r = validate({ ...good, credit: '@derek' });
  assert.ok(r.ok);
  if (!r.ok) return;
  const body = issueBody(r.submission, { origin: 'https://x.test' });
  assert.ok(!/@someone/.test(body) && !/#12/.test(body));
  assert.ok(body.includes('### The fix') && body.includes('### Source or photo\n\n_No response_'));
  assert.ok(body.includes('Credit: **@​derek**'));
  assert.ok(issueTitle(r.submission).startsWith('[Fix · '));
});
await test('part id round-trips from the dropdown text', () => {
  assert.match(partIdOf(part) ?? '', /^[a-z0-9-]+$/);
  assert.equal(partIdOf(partOptions()[0]), undefined);
});
await test('GitHub App JWT is a valid RS256 signature', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();
  const [h, p, s] = appJwt('123', pem, 1_000_000).split('.');
  const v = createVerify('RSA-SHA256');
  v.update(`${h}.${p}`);
  assert.ok(v.verify(publicKey, Buffer.from(s, 'base64url')));
  assert.deepEqual(JSON.parse(Buffer.from(p, 'base64url').toString()), {
    iat: 999_940,
    exp: 1_000_540,
    iss: '123',
  });
});

// ---------- the function, with fetch stubbed ----------

const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.GITHUB_APP_ID = '1';
process.env.GITHUB_APP_INSTALLATION_ID = '2';
process.env.GITHUB_APP_PRIVATE_KEY = privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();
process.env.TURNSTILE_TEST_MODE = 'pass';

type Call = { url: string; method: string; body?: string };
let calls: Call[] = [];
let turnstileOk = true;
let recentIssues = 0;
globalThis.fetch = (async (input: string | URL, init: RequestInit = {}) => {
  const url = String(input);
  calls.push({ url, method: init.method ?? 'GET', body: init.body?.toString() });
  if (url.includes('siteverify')) return Response.json({ success: turnstileOk });
  if (url.includes('/access_tokens'))
    return Response.json({ token: 't', expires_at: new Date(Date.now() + 3.6e6).toISOString() });
  if (url.includes('/issues?'))
    return Response.json(
      Array.from({ length: recentIssues }, () => ({ created_at: new Date().toISOString() })),
    );
  if (url.endsWith('/issues') && init.method === 'POST')
    return Response.json({ number: 7, html_url: 'https://github.com/x/y/issues/7' });
  return new Response('nope', { status: 404 });
}) as typeof fetch;

const { POST, GET } = await import('../api/contribute.ts');
let ipSeq = 0;
const post = (fields: Record<string, string>, { json = true, origin = 'https://site.test' } = {}) =>
  POST(
    new Request('https://site.test/api/contribute', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        accept: json ? 'application/json' : 'text/html',
        origin,
        'x-real-ip': `10.0.0.${++ipSeq}`,
      },
      body: new URLSearchParams(fields),
    }),
  );
const token = { 'cf-turnstile-response': 'XXXX.DUMMY.TOKEN.XXXX' };
const reset = () => {
  calls = [];
  turnstileOk = true;
  recentIssues = 0;
  _reset();
};

await test('function files a labeled issue (JSON mode)', async () => {
  reset();
  const res = await post({ ...good, ...token });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {
    ok: true,
    issue: { number: 7, url: 'https://github.com/x/y/issues/7' },
  });
  const create = calls.find((c) => c.url.endsWith('/issues') && c.method === 'POST');
  assert.ok(create);
  assert.deepEqual(JSON.parse(create?.body ?? '{}').labels, ['fix', 'needs-source', 'web-form']);
});
await test('plain form POST redirects to the thanks page', async () => {
  reset();
  const res = await post({ ...good, ...token }, { json: false });
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/contribute/thanks?n=7');
});
await test('failed Turnstile is rejected and files nothing', async () => {
  reset();
  turnstileOk = false;
  const res = await post({ ...good, ...token });
  assert.equal(res.status, 403);
  assert.equal((await res.json()).reason, 'turnstile');
  assert.ok(!calls.some((c) => c.method === 'POST' && c.url.endsWith('/issues')));
});
await test('missing Turnstile token is rejected', async () => {
  reset();
  assert.equal((await post(good)).status, 403);
});
await test('bad input is rejected before Turnstile or GitHub', async () => {
  reset();
  const res = await post({ ...good, summary: '', ...token }, { json: false });
  assert.equal(res.status, 303);
  assert.match(res.headers.get('location') ?? '', /^\/contribute\/form\?error=invalid&type=fix/);
  assert.equal(calls.length, 0);
});
await test('honeypot pretends success and files nothing', async () => {
  reset();
  const res = await post({ ...good, ...token, website: 'http://spam' });
  assert.equal(res.status, 200);
  assert.equal(calls.length, 0);
});
await test('cross-origin POST is refused', async () => {
  reset();
  assert.equal((await post({ ...good, ...token }, { origin: 'https://evil.test' })).status, 403);
});
await test('hourly cap returns 429', async () => {
  reset();
  recentIssues = 20;
  assert.equal((await post({ ...good, ...token })).status, 429);
});
await test('missing credentials fail gracefully with 503', async () => {
  reset();
  const saved = process.env.GITHUB_APP_ID;
  delete process.env.GITHUB_APP_ID;
  const res = await post({ ...good, ...token });
  process.env.GITHUB_APP_ID = saved;
  assert.equal(res.status, 503);
  assert.equal((await res.json()).reason, 'unavailable');
});
await test('per-IP limit kicks in after 5 tries', async () => {
  reset();
  const statuses: number[] = [];
  for (let i = 0; i < 6; i++) {
    const res = await POST(
      new Request('https://site.test/api/contribute', {
        method: 'POST',
        headers: { accept: 'application/json', 'x-real-ip': '10.9.9.9' },
        body: new URLSearchParams({ ...good, ...token }),
      }),
    );
    statuses.push(res.status);
  }
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
});
await test('GET redirects to the form', () => {
  assert.equal(GET().headers.get('location'), '/contribute/form');
});

console.log(`\n${passed} contribution tests passed.`);

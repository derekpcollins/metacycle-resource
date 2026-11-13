/**
 * Tests for the link checker's rules (no network): how fetch results are classified,
 * which hosts are never fetched, and the shared staleness rule. Run: npm run test:links
 */
import assert from 'node:assert/strict';
import { botWall, classify, pageTitle, redirectedHome, stockSignal } from './lib/link-classify.ts';
import { FAILURE_OUTCOMES, needsHuman } from '../src/lib/link-rules.ts';
import { checkReasons, isStale, STALE_AFTER_MS, summarize } from '../src/lib/staleness.ts';

let passed = 0;
const test = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`✓ ${name}`);
};

const U = 'https://shop.example/product/rear-shock';
const html = (head: string, body = '') =>
  `<html><head><title>Rear shock | Shop</title>${head}</head><body>${body}</body></html>`;

// ---------- bot-blocking hosts ----------

test('AliExpress (every TLD and short link), Alibaba and Amazon need a human', () => {
  for (const u of [
    'https://a.aliexpress.com/_msLygzw',
    'https://www.aliexpress.us/item/1.html',
    'https://vi.aliexpress.com/item/32861205900.html',
    'https://x.alibaba.com/abc',
    'https://www.amazon.com/dp/B000',
  ])
    assert.equal(needsHuman(u), true, u);
});
test('other hosts are fetched, and look-alike hosts are not matched', () => {
  for (const u of ['https://www.cnqsmotor.com/x', 'https://notaliexpress.com/x', 'not a url'])
    assert.equal(needsHuman(u), false, u);
});

// ---------- classification ----------

test('404 and 410 are provably dead', () => {
  for (const status of [404, 410]) {
    const c = classify(U, { status, finalUrl: U, body: '' });
    assert.equal(c.outcome, 'dead');
    assert.equal(c.provablyDead, true);
  }
});
test('a domain that no longer exists is provably dead', () => {
  const c = classify(U, { error: 'ENOTFOUND' });
  assert.deepEqual([c.outcome, c.provablyDead], ['dead', true]);
});
test('403/429/401 mean a bot wall, never dead', () => {
  for (const status of [401, 403, 429]) {
    const c = classify(U, { status, finalUrl: U, body: '' });
    assert.deepEqual([c.outcome, c.provablyDead], ['needs-human', false]);
  }
});
test('5xx, timeouts and refused connections are "couldn’t reach", not dead', () => {
  assert.equal(classify(U, { status: 503, body: '' }).outcome, 'unreachable');
  assert.equal(classify(U, { error: 'TIMEOUT' }).outcome, 'unreachable');
  assert.equal(classify(U, { error: 'ECONNREFUSED' }).outcome, 'unreachable');
  assert.equal(classify(U, { error: 'ECONNREFUSED' }).provablyDead, false);
});
test('captcha pages served with 200 or 202 need a human', () => {
  const sg =
    '<html><head><meta http-equiv="refresh" content="0;/.well-known/sgcaptcha/?r=%2Fx"></meta></head></html>';
  assert.equal(botWall(202, sg), true);
  assert.equal(classify(U, { status: 202, finalUrl: U, body: sg }).outcome, 'needs-human');
  assert.equal(
    classify(U, { status: 200, finalUrl: U, body: '<title>Robot Check</title>' }).outcome,
    'needs-human',
  );
  assert.equal(classify(U, { status: 202, finalUrl: U, body: '' }).outcome, 'needs-human');
});
test('a deep link that lands on the home page is "moved", not dead', () => {
  assert.equal(redirectedHome(U, 'https://shop.example/'), true);
  assert.equal(redirectedHome('https://shop.example/', 'https://shop.example/'), false);
  const c = classify(U, { status: 200, finalUrl: 'https://shop.example/', body: html('') });
  assert.deepEqual([c.outcome, c.provablyDead], ['moved', false]);
});
test('a normal 200 page is live, with its title', () => {
  const c = classify(U, { status: 200, finalUrl: U, body: html('') });
  assert.equal(c.outcome, 'live');
  assert.equal(c.title, 'Rear shock | Shop');
});

// ---------- stock signal ----------

test('JSON-LD OutOfStock with no in-stock offer → likely out of stock', () => {
  const ld =
    '<script type="application/ld+json">{"offers":{"availability":"https://schema.org/OutOfStock"}}</script>';
  assert.equal(stockSignal(ld), 'out-of-stock');
  const c = classify(U, { status: 200, finalUrl: U, body: html(ld) });
  assert.deepEqual([c.outcome, c.provablyDead], ['out-of-stock', false]);
});
test('mixed variants (one in stock) are not out of stock', () => {
  const ld =
    '{"availability":"http://schema.org/OutOfStock"},{"availability":"http://schema.org/InStock"}';
  assert.equal(stockSignal(ld), 'in-stock');
});
test('og/product:availability meta and microdata are read; page text is ignored', () => {
  assert.equal(
    stockSignal('<meta property="product:availability" content="out of stock">'),
    'out-of-stock',
  );
  assert.equal(
    stockSignal('<link itemprop="availability" href="https://schema.org/SoldOut">'),
    'out-of-stock',
  );
  assert.equal(stockSignal('<p>Sold out! See related items</p>'), undefined);
});
test('page titles are decoded and trimmed', () => {
  assert.equal(pageTitle('<title>\n Seats &amp; Accessories </title>'), 'Seats & Accessories');
  assert.equal(pageTitle('<p>no title</p>'), undefined);
});
test('"needs a human" never keeps the rolling issue open', () => {
  assert.equal(FAILURE_OUTCOMES.includes('needs-human'), false);
  assert.equal(FAILURE_OUTCOMES.includes('live'), false);
});

// ---------- staleness (one rule for badge, Help Wanted, checklist and checker) ----------

const now = Date.parse('2026-11-13T00:00:00Z');
test('TODO and missing dates are stale; recent dates are not', () => {
  assert.equal(isStale('TODO', now), true);
  assert.equal(isStale(undefined, now), true);
  assert.equal(isStale(new Date(now - 86_400_000), now), false);
  assert.equal(isStale('2026-11-01', now), false);
  assert.equal(isStale(new Date(now - STALE_AFTER_MS - 1), now), true);
});
test('checkReasons explains why a buy option needs a person', () => {
  const fresh = {
    url: 'https://x.test',
    status: 'live',
    last_verified: '2026-11-10',
    price: { amount: 10, currency: 'USD' },
  };
  assert.deepEqual(checkReasons(fresh, now), []);
  assert.deepEqual(
    checkReasons(
      {
        url: 'TODO',
        status: 'unverified',
        last_verified: 'TODO',
        price: { amount: 'TODO', currency: 'USD' },
      },
      now,
    ),
    ['never-verified', 'unverified', 'no-url', 'no-price'],
  );
  assert.deepEqual(checkReasons({ ...fresh, status: 'dead' }, now), ['dead']);
  assert.deepEqual(checkReasons({ ...fresh, last_verified: '2026-01-01' }, now), ['stale']);
  const s = summarize(
    [fresh, { ...fresh, status: 'dead' }, { ...fresh, last_verified: 'TODO' }],
    now,
  );
  assert.deepEqual([s.total, s.needsCheck, s.stale, s.dead, s.neverVerified], [3, 2, 1, 1, 1]);
});

console.log(`\n${passed} link-check tests passed.`);

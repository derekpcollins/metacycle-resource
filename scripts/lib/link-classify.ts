/**
 * Turns one HTTP fetch into a link outcome. Pure functions, so scripts/test-link-check.ts
 * can cover every branch without the network.
 */
import { BLOCKED_HTTP, DEAD_HTTP, type LinkOutcome } from '../../src/lib/link-rules.js';

export interface FetchResult {
  /** HTTP status, or undefined when the request failed before a response. */
  status?: number;
  /** URL after redirects. */
  finalUrl?: string;
  /** First part of the HTML body (enough for <title> and structured data). */
  body?: string;
  /** Network error code (ENOTFOUND, ECONNREFUSED, TIMEOUT, …) when there was no response. */
  error?: string;
}

export interface Classified {
  outcome: LinkOutcome;
  /** One line for the report, e.g. "HTTP 404" or "sold out (schema.org availability)". */
  detail: string;
  /** True only when the evidence proves the page is gone (404/410 or the domain is gone). */
  provablyDead: boolean;
  title?: string;
}

const AVAILABILITY =
  /(?:schema\.org\/)?(InStock|OutOfStock|SoldOut|Discontinued|PreOrder|BackOrder|LimitedAvailability|InStoreOnly|OnlineOnly)\b/g;
const OOS = new Set(['OutOfStock', 'SoldOut', 'Discontinued']);
const CAPTCHA_TITLE =
  /robot check|captcha|are you a (human|robot)|access denied|attention required|just a moment|verify you are human|security check/i;

/**
 * A bot wall served with a 2xx status: SiteGround's sgcaptcha (cnqsmotor.com answers Node
 * this way), Cloudflare and Imperva challenges, or a near-empty page that only
 * meta-refreshes to a challenge URL.
 */
export function botWall(status: number, body = ''): boolean {
  if (
    /sgcaptcha|challenge-platform|cf-chl-|_Incapsula_Resource|px-captcha|captcha-delivery/i.test(
      body,
    )
  )
    return true;
  const refresh =
    /<meta[^>]+http-equiv=["']?refresh["']?[^>]*content=["'][^"']*(captcha|challenge|verify)/i;
  if (refresh.test(body)) return true;
  // 202 Accepted with no real page is a deferred challenge, not a product page.
  return status === 202 && body.length < 5_000 && !pageTitle(body);
}

/** The page's <title>, whitespace-collapsed, with common entities decoded. */
export function pageTitle(body = ''): string | undefined {
  const m = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return undefined;
  const t = m[1]
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
  return t ? t.slice(0, 140) : undefined;
}

/**
 * Stock signal from structured data only (schema.org `availability` in JSON-LD or
 * microdata, or og/product:availability meta). Page text like "sold out" is ignored: it
 * shows up in related-product carousels. A page is "out of stock" only when it has an
 * out-of-stock value and no in-stock value (variant lists often mix both).
 */
export function stockSignal(body = ''): 'in-stock' | 'out-of-stock' | undefined {
  const values = new Set<string>();
  for (const m of body.matchAll(/"availability"\s*:\s*"([^"]+)"/gi))
    for (const v of m[1].matchAll(AVAILABILITY)) values.add(v[1]);
  for (const m of body.matchAll(/itemprop=["']availability["'][^>]*>/gi))
    for (const v of m[0].matchAll(AVAILABILITY)) values.add(v[1]);
  for (const m of body.matchAll(/<meta[^>]+property=["'](?:og|product):availability["'][^>]*>/gi)) {
    const c = m[0]
      .match(/content=["']([^"']+)["']/i)?.[1]
      ?.toLowerCase()
      .replace(/[\s_-]/g, '');
    if (c === 'outofstock' || c === 'oos' || c === 'soldout') values.add('OutOfStock');
    else if (c === 'instock' || c === 'available') values.add('InStock');
  }
  if (!values.size) return undefined;
  const anyOos = [...values].some((v) => OOS.has(v));
  const anyIn = [...values].some((v) => !OOS.has(v));
  if (anyOos && !anyIn) return 'out-of-stock';
  return anyIn ? 'in-stock' : undefined;
}

/** A deep link that lands on the site's root (a common "product removed" behaviour). */
export function redirectedHome(url: string, finalUrl?: string): boolean {
  if (!finalUrl) return false;
  try {
    const a = new URL(url);
    const b = new URL(finalUrl);
    const deep = a.pathname.replace(/\/+$/, '') !== '';
    const home = b.pathname.replace(/\/+$/, '') === '' && !b.search;
    return deep && home;
  } catch {
    return false;
  }
}

export function classify(url: string, r: FetchResult): Classified {
  const title = pageTitle(r.body);
  if (r.status === undefined) {
    if (r.error === 'ENOTFOUND')
      return { outcome: 'dead', detail: 'domain not found (DNS)', provablyDead: true };
    return {
      outcome: 'unreachable',
      detail: r.error === 'TIMEOUT' ? 'timed out' : `network error (${r.error ?? 'unknown'})`,
      provablyDead: false,
    };
  }
  const s = r.status;
  if ((DEAD_HTTP as readonly number[]).includes(s))
    return { outcome: 'dead', detail: `HTTP ${s}`, provablyDead: true, title };
  if ((BLOCKED_HTTP as readonly number[]).includes(s))
    return {
      outcome: 'needs-human',
      detail: `HTTP ${s} (blocked the checker)`,
      provablyDead: false,
      title,
    };
  if (s >= 500) return { outcome: 'unreachable', detail: `HTTP ${s}`, provablyDead: false, title };
  if (s >= 400) return { outcome: 'unreachable', detail: `HTTP ${s}`, provablyDead: false, title };
  if ((title && CAPTCHA_TITLE.test(title)) || botWall(s, r.body))
    return { outcome: 'needs-human', detail: 'bot check page', provablyDead: false, title };
  if (redirectedHome(url, r.finalUrl))
    return {
      outcome: 'moved',
      detail: `redirects to ${r.finalUrl}`,
      provablyDead: false,
      title,
    };
  if (stockSignal(r.body) === 'out-of-stock')
    return {
      outcome: 'out-of-stock',
      detail: 'page says out of stock (structured data)',
      provablyDead: false,
      title,
    };
  return { outcome: 'live', detail: `HTTP ${s}`, provablyDead: false, title };
}

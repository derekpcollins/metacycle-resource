/**
 * The one staleness rule (docs/SPEC.md → "Staleness badge"): a buy option needs a re-check
 * when it was never verified (`last_verified: TODO`) or was verified more than
 * site.staleAfterDays ago. Everything that shows or counts stale links uses this module:
 * the "needs re-check" badge (src/lib/format.ts), the Help Wanted page, the verification
 * checklist (scripts/verify-list.ts) and the link checker's report (scripts/link-check.ts).
 *
 * Plain TypeScript with no Astro imports, so it also runs under tsx in scripts and CI.
 * Dates may arrive as Date objects (Astro, the yaml package) or ISO strings.
 */
import { site } from '../site.config.js';

export const STALE_AFTER_MS = site.staleAfterDays * 86_400_000;

type DateLike = Date | string | null | undefined;

const toTime = (d: DateLike) => {
  if (d === null || d === undefined || d === 'TODO') return undefined;
  const t = (d instanceof Date ? d : new Date(d)).getTime();
  return Number.isNaN(t) ? undefined : t;
};

/** True when never verified, unparseable, or older than site.staleAfterDays. */
export const isStale = (d: DateLike, now = Date.now()) => {
  const t = toTime(d);
  return t === undefined || now - t > STALE_AFTER_MS;
};

export const neverVerified = (d: DateLike) => toTime(d) === undefined;

/** The fields of a buy option this module reads (Astro and raw-YAML shapes both fit). */
export interface SourceLike {
  url: string;
  status: string;
  last_verified: DateLike;
  price?: { amount: number | string; currency: string } | null;
}

/** Why a buy option needs a person to look at it, in display order. */
export const CHECK_REASONS = {
  dead: 'marked dead',
  'out-of-stock': 'out of stock',
  'never-verified': 'never verified',
  stale: `not verified in ${site.staleAfterDays} days`,
  unverified: 'status unverified',
  'no-url': 'no link yet',
  'no-price': 'no price yet',
} as const;
export type CheckReason = keyof typeof CHECK_REASONS;

export function checkReasons(s: SourceLike, now = Date.now()): CheckReason[] {
  const r: CheckReason[] = [];
  if (s.status === 'dead') r.push('dead');
  if (s.status === 'out-of-stock') r.push('out-of-stock');
  if (neverVerified(s.last_verified)) r.push('never-verified');
  else if (isStale(s.last_verified, now)) r.push('stale');
  if (s.status === 'unverified') r.push('unverified');
  if (s.url === 'TODO') r.push('no-url');
  if (!s.price || s.price.amount === 'TODO') r.push('no-price');
  return r;
}

export const needsCheck = (s: SourceLike, now = Date.now()) => checkReasons(s, now).length > 0;

/** Counts across many buy options, for summary lines (Help Wanted, checker report). */
export function summarize(sources: SourceLike[], now = Date.now()) {
  const count = (reason: CheckReason) =>
    sources.filter((s) => checkReasons(s, now).includes(reason)).length;
  return {
    total: sources.length,
    needsCheck: sources.filter((s) => needsCheck(s, now)).length,
    stale: sources.filter((s) => isStale(s.last_verified, now)).length,
    neverVerified: count('never-verified'),
    unverified: count('unverified'),
    noUrl: count('no-url'),
    noPrice: count('no-price'),
    dead: count('dead'),
    outOfStock: count('out-of-stock'),
  };
}

/**
 * Link-checking rules shared by the link checker (scripts/link-check.ts) and the site
 * (Help Wanted marks these links "check by hand"). Plain TypeScript, no Astro imports.
 *
 * Some stores answer automated requests with a bot wall, a login page or a captcha, so a
 * script can't tell a live listing from a dead one. The spec's caveat (docs/SPEC.md →
 * "Automation") says those links need a person and must never be marked dead by the
 * checker, so the checker doesn't fetch them at all and reports them as "needs a human".
 * Add a host here when the checker keeps reporting it as blocked.
 */
export const NEEDS_HUMAN_HOSTS = [
  // AliExpress serves bot pages (200/302) on every TLD and short link (a.aliexpress.com).
  'aliexpress.com',
  'aliexpress.us',
  'aliexpress.ru',
  // Alibaba and Amazon return captchas or 503 "robot check" pages to scripts.
  'alibaba.com',
  'amazon.com',
] as const;

/** True for a URL on a bot-blocking host or any of its subdomains. */
export function needsHuman(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return NEEDS_HUMAN_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

/** What the checker concluded about one URL. */
export const LINK_OUTCOMES = {
  live: 'Live',
  dead: 'Dead',
  'out-of-stock': 'Likely out of stock',
  moved: 'Redirects to the home page',
  unreachable: 'Couldn’t reach',
  'needs-human': 'Needs a human',
} as const;
export type LinkOutcome = keyof typeof LINK_OUTCOMES;

/**
 * Outcomes that keep the rolling issue open. "Needs a human" isn't one: those links are
 * listed on Help Wanted instead, or the issue could never close.
 */
export const FAILURE_OUTCOMES: readonly LinkOutcome[] = [
  'dead',
  'out-of-stock',
  'moved',
  'unreachable',
];

/** HTTP statuses that prove a page is gone (only these let the checker mark a link dead). */
export const DEAD_HTTP = [404, 410] as const;
/** HTTP statuses that mean "a bot wall answered", not "the page is gone". */
export const BLOCKED_HTTP = [401, 403, 429, 451, 999] as const;

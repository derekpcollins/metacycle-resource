/**
 * Single source for site identity. The name and domain are still TBD (see docs/SPEC.md,
 * "Still open"), so change them here and nowhere else.
 */
export const site = {
  /** Placeholder until a name is chosen. */
  name: 'Metacycle Owner Resource',
  shortName: 'Metacycle Resource',
  tagline: 'Parts, fixes and specs to keep every Sondors Metacycle on the road.',
  description:
    'An independent, community-maintained reference for Sondors Metacycle owners: what each part is, where to buy it, and how to fix common failures.',
  /** GitHub repo (no trailing slash). */
  repoUrl: 'https://github.com/derekpcollins/metacycle-resource',
  /** Branch used for "Edit this page" links. */
  editBranch: 'main',
  /** Bare domain without protocol, e.g. "example.org". null until chosen. */
  domain: 'metacycle.guide' as string | null,
  /** Where the site is served until a domain is chosen (Vercel production URL). */
  productionUrl: 'https://metacycle-resource.vercel.app',
  /**
   * GitHub-side contribution paths ("edit this page", issue forms). The repo is private
   * until Phase 6, so these show "opens at launch" until this is true. Preview builds can
   * turn them on with GITHUB_CONTRIBUTIONS=true (see src/lib/github-open.ts).
   * The no-account web form works either way.
   */
  githubContributionsOpen: false,
  /** Editor/maintainer credited on the About page. */
  editor: 'Derek',
  /**
   * GitHub logins of maintainers. Their own pull requests aren't auto-credited in the
   * changelog (they credit contributors with a `Credit:` line instead).
   */
  maintainers: ['derekpcollins'],
  license: {
    content: { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
    code: { name: 'MIT', url: 'https://opensource.org/license/mit' },
  },
  /** Days after which a source's last_verified date counts as stale (spec: 90). */
  staleAfterDays: 90,
} as const;

/** Absolute site URL (no trailing slash): the chosen domain, else the Vercel URL. */
export const siteUrl = site.domain ? `https://${site.domain}` : site.productionUrl;

/** `owner/repo`, derived from repoUrl. */
export const repoSlug = new URL(site.repoUrl).pathname.replace(/^\/|\/$/g, '');

/** Opens a repo file in GitHub's web editor; saving it opens a pull request. */
export const editUrl = (repoPath: string) => `${site.repoUrl}/edit/${site.editBranch}/${repoPath}`;

/**
 * "Report a problem" → the site's no-account web form, prefilled. Works for everyone,
 * with or without a GitHub account; the form also offers the matching GitHub issue form.
 * `type` is a contribution type from src/lib/contribution.ts.
 */
export const reportProblemUrl = (
  prefill: {
    type?: string;
    part?: string;
    system?: string;
    page?: string;
    vendor?: string;
    url?: string;
    /** A "What did you find?" option, e.g. LINK_CHECKED. */
    problem?: string;
    summary?: string;
  } = {},
) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(prefill)) if (v) q.set(k, v);
  const qs = q.toString();
  return `/contribute/form${qs ? `?${qs}` : ''}`;
};

/** Link to a GitHub issue form, optionally prefilled (field id → value). */
export const issueFormUrl = (template: string, fields: Record<string, string | undefined> = {}) => {
  const url = new URL(`${site.repoUrl}/issues/new`);
  url.searchParams.set('template', template);
  for (const [k, v] of Object.entries(fields)) if (v) url.searchParams.set(k, v);
  return url.toString();
};

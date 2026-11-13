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
  domain: null as string | null,
  /** Editor/maintainer credited on the About page. */
  editor: 'Derek',
  license: {
    content: { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
    code: { name: 'MIT', url: 'https://opensource.org/license/mit' },
  },
  /** Days after which a source's last_verified date counts as stale (spec: 90). */
  staleAfterDays: 90,
} as const;

export const editUrl = (repoPath: string) =>
  `${site.repoUrl}/edit/${site.editBranch}/${repoPath}`;

export const reportProblemUrl = (pageTitle?: string) => {
  const url = new URL(`${site.repoUrl}/issues/new`);
  if (pageTitle) url.searchParams.set('title', `Problem on: ${pageTitle}`);
  return url.toString();
};

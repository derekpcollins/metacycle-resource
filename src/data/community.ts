/**
 * Community places owners gather. Names and URLs are copied from Metacyclopedia's
 * community page (fetched Nov 12, 2026), which docs/RESEARCH.md §5 cites. That page also
 * lists a near-identical "Sondors MetaCycle Owners Group" (facebook.com/groups/4050911351682882);
 * it's left out here as a duplicate.
 *
 * Re-checked Nov 12, 2026 (Phase 3): every URL returned HTTP 200. Both Discord invites are
 * valid (Discord API names the servers MetaHack and Verified Metacycle Owners). Facebook
 * groups resolve but sit behind Facebook's login, so their contents weren't checked.
 * Endless Sphere answers with a bot check page.
 */
export interface CommunityLink {
  name: string;
  kind: 'reddit' | 'discord' | 'facebook' | 'forum' | 'wiki';
  url?: string;
}

export const community: CommunityLink[] = [
  { name: 'r/metacycle', kind: 'reddit', url: 'https://www.reddit.com/r/metacycle/' },
  { name: 'MetaHack', kind: 'discord', url: 'https://discord.gg/QmVYG2QsZB' },
  { name: 'Verified Metacycle Owners', kind: 'discord', url: 'https://discord.gg/96UpcjeBWf' },
  {
    name: 'Sondors Metacycle Mods Club',
    kind: 'facebook',
    url: 'https://www.facebook.com/groups/905762400660923',
  },
  {
    name: 'Sondors Metacycle fan club of America',
    kind: 'facebook',
    url: 'https://www.facebook.com/groups/770913380195452/',
  },
  {
    name: 'Sondors Metacycle Owners Group',
    kind: 'facebook',
    url: 'https://www.facebook.com/groups/sondorsmetacycle/',
  },
  { name: 'Endless Sphere', kind: 'forum', url: 'https://endless-sphere.com/sphere/' },
  { name: 'Metacyclopedia', kind: 'wiki', url: 'https://metacyclopedia.github.io/' },
];

/** Source for the list above. */
export const communitySource = 'https://metacyclopedia.github.io/community/';

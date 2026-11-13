/**
 * Community places owners gather (docs/RESEARCH.md §5). Only links that appear in the
 * research brief are filled in; the rest are TODO until verified in Phase 3.
 */
export interface CommunityLink {
  name: string;
  kind: 'reddit' | 'discord' | 'facebook' | 'forum' | 'wiki';
  url?: string;
}

export const community: CommunityLink[] = [
  { name: 'r/metacycle', kind: 'reddit' },
  { name: 'MetaHack Discord', kind: 'discord' },
  { name: 'Verified Metacycle Owners Discord', kind: 'discord' },
  { name: 'Sondors Metacycle Mods Club (Facebook)', kind: 'facebook' },
  { name: 'Endless Sphere forums', kind: 'forum' },
  { name: 'Metacyclopedia', kind: 'wiki', url: 'https://metacyclopedia.github.io/' },
];

/** Metacyclopedia's community page lists the groups above with links. */
export const communitySource = 'https://metacyclopedia.github.io/community/';

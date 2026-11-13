/** Site navigation (docs/SPEC.md → Information architecture). */
export const primaryNav = [
  { href: '/parts', label: 'parts', icon: 'parts' },
  { href: '/troubleshooting', label: 'troubleshoot', icon: 'troubleshoot' },
  { href: '/guides', label: 'guides', icon: 'guides' },
  { href: '/specs', label: 'specs', icon: 'specs' },
] as const;

export const menuNav = [
  { href: '/tools', label: 'tools' },
  { href: '/community', label: 'community' },
  { href: '/contribute', label: 'contribute' },
] as const;

export const isCurrent = (pathname: string, href: string) => {
  const path = pathname.replace(/\/$/, '') || '/';
  return path === href || path.startsWith(`${href}/`);
};

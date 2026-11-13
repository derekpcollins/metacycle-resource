/**
 * Whether the GitHub-side contribution paths ("edit this page", issue forms) are live.
 * On since the repo went public (Phase 6), via site.githubContributionsOpen. Preview
 * builds can also turn them on with the GITHUB_CONTRIBUTIONS=true env var so the editor can
 * test them. Build-time only (Astro pages and components).
 */
import { site } from '../site.config';

const flag = import.meta.env.GITHUB_CONTRIBUTIONS ?? process.env.GITHUB_CONTRIBUTIONS;
export const githubOpen = site.githubContributionsOpen || flag === 'true';

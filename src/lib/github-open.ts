/**
 * Whether the GitHub-side contribution paths ("edit this page", issue forms) are live.
 * Off until the repo goes public (Phase 6): flip site.githubContributionsOpen. Preview
 * builds turn them on with the GITHUB_CONTRIBUTIONS=true env var so the editor can
 * test them. Build-time only (Astro pages and components).
 */
import { site } from '../site.config';

const flag = import.meta.env.GITHUB_CONTRIBUTIONS ?? process.env.GITHUB_CONTRIBUTIONS;
export const githubOpen = site.githubContributionsOpen || flag === 'true';

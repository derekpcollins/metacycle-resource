#!/usr/bin/env tsx
/**
 * Creates or updates the repo labels the issue forms, the label workflow and the web-form
 * function use (defined in src/lib/contribution.ts). Needs the GitHub CLI (`gh`) signed in
 * with access to the repo. Safe to re-run. Usage: `npm run labels:sync`
 */
import { execFileSync } from 'node:child_process';
import { LABELS } from '../src/lib/contribution.ts';
import { repoSlug } from '../src/site.config.ts';

const gh = (...args: string[]) => execFileSync('gh', args, { stdio: 'pipe' }).toString();

for (const [name, { color, description }] of Object.entries(LABELS)) {
  const fields = ['-f', `color=${color}`, '-f', `description=${description}`];
  try {
    gh('api', '-X', 'PATCH', `repos/${repoSlug}/labels/${encodeURIComponent(name)}`, ...fields);
    console.log(`updated ${name}`);
  } catch {
    gh('api', '-X', 'POST', `repos/${repoSlug}/labels`, '-f', `name=${name}`, ...fields);
    console.log(`created ${name}`);
  }
}

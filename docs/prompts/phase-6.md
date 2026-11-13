You are starting Phase 6 (Downloads, polish & beta prep) of an open-source, community-maintained owner resource site for the Sondors Metacycle electric motorcycle. Sondors went out of business, so owners need maintenance and service info and links to buy parts (many from China). I'm the editor/maintainer and a product designer.

## Context

- Repo: `derekpcollins/metacycle-resource` (private GitHub repo, `main` branch; this phase makes it public). Clone it, or attach it to the session if your tools work that way. If `gh` isn't authenticated, ask me rather than working around it. (In Claude's cloud workspace, attaching the repo may need my approval. After that, repo-scoped `gh api repos/…` REST calls have worked through the session proxy, but GraphQL and `gh pr create` haven't. Open PRs with `gh api repos/{owner}/{repo}/pulls`, and dispatch workflows with `gh api -X POST repos/{owner}/{repo}/actions/workflows/{file}/dispatches`.)
- Hosting: Vercel project `metacycle-resource` (team _Derek's Projects_), linked to the repo. Pushes to `main` deploy to production at https://metacycle.guide (`site.domain` in `src/site.config.ts`; https://metacycle-resource.vercel.app also serves it). Every PR gets a preview. If your workspace's `vercel` CLI isn't logged in, use `vercel login` (device flow; I'll approve it). The Vercel MCP can read deployments and build/runtime logs and create share links for protected previews, but it got 403 on environment variables, so ask me to set those.
- Read these before writing any code, in this order:
  1. `docs/SPEC.md`: the site spec and **source of truth**. Read it fully, especially "Legal & disclaimer" (Downloads & copyright: mirrored copies, separate downloads repo via GitHub Releases, origin/date/checksum/original link, takedown contact, affiliate disclosure), "Tech stack, repo & automation" (Actions minutes are free on public repos), "Page templates" (Downloads is a supporting page), "Governance" and "Launch plan" (private beta comes after this phase).
  2. `docs/PHASES.md`: phase status, decisions log, and what Phases 1–5 built, deferred or learned. Its "Deferred" and "Waiting on the repo going public" lines are part of this phase's checklist.
  3. `docs/RESEARCH.md`: sourced research brief. §8 lists the Metacyclopedia Files page (manuals, Votol software) that the downloads list comes from.
  4. `CONTRIBUTING.md`: content rules, buy-link verification, the link checker, credit and the review flow.
- If anything in this prompt conflicts with the spec, the spec wins. Flag the conflict to me.
- What exists:
  - **Phase 1:** Astro (TypeScript strict, MDX), five content collections with strict Zod schemas (`src/content.config.ts`, enums in `src/lib/enums.ts`), build-time cross-reference validation (`src/lib/validate.ts`, `npm run test:validation`), CI (`.github/workflows/ci.yml`) and the Vercel deploy. Unknown values are the literal `TODO`. Every page carries `noindex` until launch.
  - **Phase 2:** the approved "minimal mono" design system (`src/styles/tokens.css`, `base.css`), components in `src/components/`, every page template, Pagefind search and the footer theme switcher. Earlier phases ran axe and Lighthouse ad hoc with Playwright; nothing is in the repo.
  - **Phase 3:** 42 parts, 14 vendors, 13 tools, 6 guides, 6 troubleshooting entries, a data-driven Specs page (`src/data/specs.ts`, whose downloads list says "coming in Phase 6" with an interim link to Metacyclopedia's Files page), and `npm run verify:list` → `docs/VERIFICATION.md`.
  - **Phase 4:** contribution flows. `src/lib/contribution.ts` defines the four contribution types, fields and labels; `scripts/sync-issue-forms.ts` generates the issue forms (`npm run forms:check` in CI). `/contribute/form` → `api/contribute.ts` (Vercel function: Turnstile, GitHub App bot, honeypot, limits). GitHub-side links (edit this page, issue forms) are gated by `site.githubContributionsOpen` (still `false`; previews turn them on with `GITHUB_CONTRIBUTIONS=true`).
  - **Phase 5:** automation and trust.
    - `scripts/link-check.ts` plus `.github/workflows/link-check.yml` (manual dispatch only; the weekly cron is commented out). The workflow keeps one rolling `link-check` issue, and one PR that sets `status: dead` on provably dead links. It never sets `last_verified` and never fetches AliExpress, Alibaba or Amazon.
    - The PR link check in CI covers only changed content.
    - One staleness helper, `src/lib/staleness.ts`.
    - `/contribute/help-wanted` is generated from content.
    - `/contribute/changelog` renders `src/data/changelog.json`, which `.github/workflows/changelog.yml` updates after each merged PR.
    - An optional `contributors` field on every content type shows as "improved by".
    - `npm run ci` = format, forms check, astro check, build, validation, contribution and link-check tests.
  - Labels: `broken-link`, `new-part`, `new-vendor`, `fix`, `spec-correction`, `needs-source`, `community-reported`, `web-form`, `link-check` (`npm run labels:sync`).
  - All site identity lives in `src/site.config.ts` (`name`, `repoUrl`, `editBranch`, `domain`, `siteUrl`, `editUrl()`, `issueFormUrl()`, `reportProblemUrl()`, `staleAfterDays`, `maintainers`, `githubContributionsOpen`). Reference it everywhere. Never hard-code the site name, repo URL or site URL.

## Step 0: confirm decisions before you start

Ask me these, and wait for answers, before building:

1. **Downloads repo.** Its name (e.g. `metacycle-resource-downloads`), whether it's public from day one, and which files to mirror first. Metacyclopedia's Files page lists manuals and Votol software, and Sondors-authored manuals carry the most risk (spec). Do I have the files, or should you fetch them from the original links? Each Release asset needs its origin, date and SHA-256, plus a link to the original where one still exists.
2. **Analytics.** Which privacy-friendly option: Vercel Web Analytics, Plausible, Cloudflare Web Analytics, or none? It must be cookieless with no personal data, and the Disclaimer/About page must say what's collected.
3. **Going public and indexing.** When should the repo flip to public, and should `noindex` come off at the same time or only at the public launch after the private beta? Should Vercel deployment protection be on for previews only?
4. **Still waiting from earlier phases.** Is mail set up on metacycle.guide (takedown and maintainer addresses for the Disclaimer and About pages)? Are real Turnstile keys ready? Has a site name been chosen (`site.name` is a placeholder)? Should the Disclaimer get a lawyer review before launch (spec), and is that done?

## Phase 6 scope

1. **Downloads repo and page.** Create the separate downloads repo (I may need to create it by hand and attach it), with files attached to GitHub Releases, never committed to git. Add a data file listing each download (name, what it is, origin, original URL if any, date retrieved, SHA-256, size, license/rights note, Release asset URL). Build the Downloads page (spec "supporting pages") from that data with the existing table styles. Point the Specs page's downloads list and the Votol guide's TODO at it. Add a takedown section to the Disclaimer page that uses the contact from Step 0, or stays `TODO`.
2. **Make the repo public.** Do this only when I confirm in Step 0. Before flipping, scan the full git history for secrets and personal data, and check LICENSE files, README, CODE_OF_CONDUCT and issue templates. After flipping:
   - set `site.githubContributionsOpen: true`
   - turn on the weekly cron in `link-check.yml` (and consider having the scheduled run trigger a Vercel deploy hook, so "needs re-check" flags age without a content change: Phase 5 deferred this)
   - re-run `npm run labels:sync`
   - check that edit links, issue forms (with dropdown prefill caveats), the label workflow for outside contributors, and the changelog's PR/issue links all work
   - delete leftover branches (`derekpcollins-patch-1`, `phase-4-contributions`, `test/pr-link-check`, any merged phase branches)
3. **Accessibility pass.** WCAG 2.1 AA on every route at 375px and 1280px, in light and dark. Add an automated axe check to CI (Playwright + `@axe-core/playwright` against the built site) for a representative set of routes. Fix anything it finds without restyling.
4. **Performance pass.** Lighthouse mobile on Home, Parts index, a part, a guide, a troubleshooting page, Help wanted and the changelog. Target ≥ 95 performance and 100 accessibility/best practices. Keep the no-web-fonts rule. Check page weight and caching headers on Vercel.
5. **SEO and launch metadata.** Use site-wide titles and descriptions from `site.config.ts`, plus canonical URLs, Open Graph/Twitter tags (no copyrighted imagery), `sitemap.xml`, `robots.txt` that follows the Step 0 indexing decision, structured data where it's honest (e.g. `HowTo` for guides only if the steps are complete; never invent prices or availability), and a 404 that suggests search. Keep `noindex` until I say otherwise.
6. **Analytics** per Step 0, cookieless, disclosed on the Disclaimer/About page.
7. **Beta prep (development side only).** A short `docs/BETA.md` for the private beta covering what to test, how to report (web form, issues) and known gaps (from Help wanted). Check that every route returns 200 on production.
8. **Docs.** Record decisions and anything learned in `docs/PHASES.md`, and update `CONTRIBUTING.md` for public-repo contributors (forks, PRs from forks, which checks run on fork PRs).

Out of scope: launch announcements and outreach (non-development, after this phase), new content beyond fixing sourced errors, restyling the design system (small template tweaks are fine; note them in `docs/PHASES.md`), and affiliate links (still off; if they're ever enabled, the Disclaimer needs the affiliate disclosure the same day).

## Acceptance criteria

- I confirmed the Step 0 decisions, and they're recorded in `docs/PHASES.md`.
- The downloads repo exists with at least one Release. Every listed file has origin, date and SHA-256, and the Downloads page renders them from data with no hand-kept HTML. Nothing binary is committed to either repo.
- If I approved going public: the repo is public with no secrets in its history, "edit this page" and the issue-form links are live, the weekly link check is scheduled and has run once from the schedule or a dispatch, and the leftover branches are gone.
- The axe check runs in CI and passes. A manual pass at 375px and desktop in light and dark finds no AA violations. Lighthouse targets are met on the listed pages (scores recorded in `docs/PHASES.md`).
- `sitemap.xml` and `robots.txt` exist and match the indexing decision. Every page has a correct title, description and canonical URL.
- Analytics (if chosen) is cookieless and disclosed.
- `npm run ci` passes locally and in GitHub Actions. The Vercel deploy of `main` is live and every route returns 200.
- A short summary for me: what changed for contributors now that the repo is public, how to add a download, any secrets or settings I need to set, and what's left before the private beta.

## Working rules

- Don't guess. If a fact about the Metacycle isn't in the spec, the research brief or a source you fetched and cite, leave it out or mark it `TODO`. Never invent part numbers, prices, specs, URLs, checksums or file origins.
- Never commit secrets or tokens; ask me to set them in Vercel or GitHub.
- Every button, including third-party UI (Pagefind, Turnstile wrappers, form controls, analytics consent if any), uses the shared `.btn` spec from `src/styles/base.css`. List rows use the shared row inset, and use the hover only when the whole row is one link. Check right-edge alignment against the content edge at 375px and desktop.
- Generated files (issue forms, part options, verification list, changelog data) are regenerated by their scripts, never edited by hand. Run `npm run forms:sync` / `npm run verify:list` after content changes.
- The link checker must never set `last_verified` or `status: live`, and bot-blocking hosts stay "needs a human".
- Commit in logical steps with clear messages.
- Before finishing, run the build and CI locally and fix all errors.

## Finish the phase

When Phase 6 is complete and verified:

1. Update `docs/PHASES.md` (mark Phase 6 done, note anything deferred or learned).
2. Write the next prompt to `docs/prompts/phase-7.md` (or, if no development phase remains, `docs/prompts/post-launch.md` for ongoing maintenance: verification sweeps, filling Help wanted gaps, co-maintainers). It must be self-contained: point to `docs/SPEC.md`, `docs/RESEARCH.md` and `docs/PHASES.md`, list its scope and acceptance criteria, carry forward these working rules, and itself end with this same "Finish the phase" instruction so the chain continues.
3. Commit, push, and print the full next prompt in a single code block so I can paste it into a new chat.

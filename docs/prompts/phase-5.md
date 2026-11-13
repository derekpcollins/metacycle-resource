You are starting Phase 5 (Automation & trust) of an open-source, community-maintained owner resource site for the Sondors Metacycle electric motorcycle. Sondors went out of business; owners need maintenance/service info and links to buy parts (many from China). I am the editor/maintainer and a product designer.

## Context

- Repo: `derekpcollins/metacycle-resource` (private GitHub repo, `main` branch). Clone it, or attach it to the session if your tools work that way. If `gh` isn't authenticated, ask me rather than working around it. (In Claude's cloud workspace, repo-scoped `gh api repos/…` REST calls have worked through the session proxy while GraphQL and `gh pr create` haven't; open PRs with `gh api repos/{owner}/{repo}/pulls`.)
- Hosting: Vercel project `metacycle-resource` (team _Derek's Projects_), linked to the repo; pushes to `main` deploy to production at https://metacycle.guide (`site.domain` in `src/site.config.ts`; the old https://metacycle-resource.vercel.app also serves it). Every PR gets a preview. If your workspace's `vercel` CLI isn't logged in, use `vercel login` (device flow; I'll approve it). The Vercel MCP has read deployments, build/runtime logs and created share links for protected previews, but got 403 on environment variables, so ask me to set those.
- Read these before writing any code, in this order:
  1. `docs/SPEC.md`: the site spec and **source of truth**. Read it fully, especially "Tech stack, repo & automation" (weekly link checker, staleness badge, AliExpress caveat, "On every PR"), "Contribution flows" (link checker as the fourth entry point), "Governance" (credit, trust levels) and the Contribute item in the sitemap (Help Wanted, changelog).
  2. `docs/PHASES.md`: phase status, decisions log, and what Phases 1–4 built, deferred or learned.
  3. `docs/RESEARCH.md`: sourced research brief (only needed if you touch content).
  4. `CONTRIBUTING.md`: how content, buy-link verification (`status`, `last_verified`, `price`), labels and the review flow work today.
- If anything in this prompt conflicts with the spec, the spec wins. Flag the conflict to me.
- What exists:
  - **Phase 1:** Astro (TypeScript strict, MDX), five content collections with strict Zod schemas (`src/content.config.ts`, enums in `src/lib/enums.ts`), build-time cross-reference validation (`src/lib/validate.ts`, `npm run test:validation`), CI (`.github/workflows/ci.yml`) and the Vercel deploy. Unknown values are the literal `TODO`.
  - **Phase 2:** the approved "minimal mono" design system (`src/styles/tokens.css`, `base.css`), components in `src/components/`, every page template, Pagefind search, footer theme switcher. Stale buy rows (never verified, or `last_verified` older than `site.staleAfterDays` = 90) already render greyed with a yellow "needs re-check" flag (`StaleBadge`, `sourceIsStale()` in `src/lib/format.ts`).
  - **Phase 3:** 42 parts, 14 vendors, 13 tools, 6 guides, 6 troubleshooting entries, a data-driven Specs page, and `npm run verify:list` → `docs/VERIFICATION.md`. All 59 buy options are `status: unverified`, `last_verified: TODO` until I check them by hand.
  - **Phase 4:** contribution flows. `src/lib/contribution.ts` is the single definition of the four contribution types, fields and labels; `scripts/sync-issue-forms.ts` generates the GitHub issue forms and `src/data/part-options.ts` (`npm run forms:check` in CI). `/contribute/form` is the no-account web form → `api/contribute.ts` (Vercel function: Turnstile, GitHub App bot, honeypot, limits) files labeled issues. `.github/workflows/issue-labels.yml` adds labels forms can't. "Report a problem" / "report broken link" open the form prefilled. GitHub-side links (edit, issue forms) are gated by `site.githubContributionsOpen` (false until Phase 6; previews turn them on with `GITHUB_CONTRIBUTIONS=true`). `/contribute` describes the four entry points, review rules and trust levels; its "link checker" section says what Phase 5 will do. `npm run serve:local -- --stub-github` runs the built site with the function locally.
  - Labels on the repo: `broken-link`, `new-part`, `new-vendor`, `fix`, `spec-correction`, `needs-source`, `community-reported`, `web-form` (defined in `src/lib/contribution.ts`; `npm run labels:sync`).
  - All site identity lives in `src/site.config.ts` (`repoUrl`, `editBranch`, `siteUrl`, `editUrl()`, `issueFormUrl()`, `reportProblemUrl()`, `staleAfterDays`). Reference it everywhere and never hard-code the site name, repo URL or site URL.

## Step 0: confirm decisions before you start

Ask me these, and wait for answers, before building:

1. **What the link checker may change.** Should the weekly checker only report (one rolling issue listing failures), or also open a pull request that sets `status: dead` / `out-of-stock` on links it can prove are broken? It must never set `last_verified` on links it couldn't really check, and AliExpress (which blocks bots) stays `unverified`.
2. **Actions minutes.** The repo is private until Phase 6, so scheduled runs use paid minutes. Run the weekly checker on a schedule now, or only by manual dispatch until the repo is public?
3. **Changelog source.** Generate the changelog from merged pull requests (title, labels, linked issue, credited contributor) or from commits? Where should a contributor's credit live so it can appear "on the page they improved" (spec): a new optional `contributors` field on each content type, or derived from PR metadata?
4. **Contacts and Turnstile.** The domain is metacycle.guide. Is mail set up for it yet? If so, ask for the takedown and maintainer addresses for the Disclaimer and About pages. Are real Turnstile keys set yet? Production still uses Cloudflare's test keys.

## Phase 5 scope

1. **Weekly link checker** (GitHub Actions, scheduled + manual dispatch): visit every buy-option URL (and vendor URLs), classify each result (live, dead, likely out of stock where detectable, blocked/unknown), treat AliExpress and other bot-blocking hosts as "needs a human" rather than dead, and open or update **one** rolling issue listing failures with part, vendor, URL and the edit link. Close the issue when everything passes. Apply the Step 0 answer on whether it may also open a PR. Be polite: low concurrency, timeouts, a clear User-Agent.
2. **PR link check on changed files only** (spec "On every PR"): when a PR changes content files, check only the URLs it adds or changes and report the result in the CI job summary (failing only on clear dead links, not on blocked hosts).
3. **Staleness automation:** the "needs re-check" flag already exists. Make sure the same rule (`site.staleAfterDays`) drives everything (badge, Help Wanted, checker report) from one helper, and add whatever summary counts the Help Wanted page needs.
4. **Help Wanted page** (`/contribute/help-wanted`, linked from Contribute, the nav "more" menu if it fits, and the home page if appropriate): buy links that are stale or unverified (grouped by vendor, each with "I checked this" → the web form prefilled as a broken-link/price update), `TODO` values (prices, URLs, guide times, torque values), the Specs page's "not yet known" gaps, and guides not yet verified. Generated at build time from content; no hand-kept lists.
5. **Auto changelog** (`/contribute/changelog` or `/changelog`, per the spec's Contribute section): built from the Step 0 source, newest first, crediting contributors, linking the page that changed. Show contributor credit on the improved page per the Step 0 decision.
6. **Contribute page and CONTRIBUTING.md:** update the "link checker" section from "coming next" to how it works, link Help Wanted and the changelog, and document the checker's statuses, how to run it locally, and how credit works.
7. **Docs:** record decisions and anything learned in `docs/PHASES.md`.

Out of scope: downloads repo, analytics, SEO, the a11y/perf pass and making the repo public (Phase 6). Don't restyle the design system; small template tweaks are fine (note them in `docs/PHASES.md`). Don't change content facts except to fix errors you can source. Don't mark any buy link `live` or set `last_verified` unless a person verified it or the checker truly fetched the real product page.

## Acceptance criteria

- The Step 0 decisions were confirmed by me and are recorded in `docs/PHASES.md`.
- The link checker runs from a manual dispatch in GitHub Actions, produces or updates exactly one rolling issue (re-running doesn't duplicate it), marks AliExpress-style blocks as needing a human rather than dead, and has a local dry-run mode. If a PR mode is enabled, a run that finds a provably dead link opens a PR that passes CI.
- A PR that adds a dead URL to a content file shows it in the CI summary; a PR with no content changes skips the check.
- Help Wanted and the changelog render from content/automation data with no hand-maintained lists, show correct counts, and link each item to the right edit target or prefilled form.
- Every page still renders correctly at 375px and on desktop in light and dark. No axe violations at AA on Home, Contribute, Help Wanted, the changelog, a part and a guide.
- `npm run ci` passes locally and in GitHub Actions; the Vercel deploy of `main` is live and every route returns 200.
- A short summary for me: what to click to run and review the checker, how to read Help Wanted and the changelog, any secrets/settings I need to set, and anything waiting on the repo going public.

## Working rules

- Don't guess: if a fact about the Metacycle isn't in the spec, the research brief or a source you fetched and cite, leave it out or mark it TODO. Never invent part numbers, prices, specs or URLs.
- Never commit secrets or tokens; ask me to set them in Vercel or GitHub.
- Every button, including third-party UI (Pagefind, Turnstile wrappers, form controls), uses the shared `.btn` spec from `src/styles/base.css`; list rows use the shared row inset and hover. Check right-edge alignment against the content edge at 375px and desktop.
- Generated files (issue forms, part options, verification list) are regenerated by their scripts, never edited by hand; run `npm run forms:sync` / `npm run verify:list` after content changes.
- Commit in logical steps with clear messages.
- Before finishing, run the build and CI locally and fix all errors.

## Finish the phase

When Phase 5 is complete and verified:

1. Update `docs/PHASES.md` (mark Phase 5 done, note anything deferred or learned).
2. Write the Phase 6 prompt to `docs/prompts/phase-6.md`. It must be self-contained (point to `docs/SPEC.md`, `docs/RESEARCH.md` and `docs/PHASES.md`, list Phase 6 scope and acceptance criteria, carry forward these working rules, and itself end with this same "Finish the phase" instruction so the chain continues).
3. Commit, push, and print the full Phase 6 prompt in a single code block so I can paste it into a new chat.

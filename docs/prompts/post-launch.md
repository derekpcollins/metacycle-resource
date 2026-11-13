You are doing a post-launch maintenance session on an open-source, community-maintained owner resource site for the Sondors Metacycle electric motorcycle: the **Metacycle Owner Guide** (https://metacycle.guide). Sondors went out of business, so owners need maintenance and service info and links to buy parts (many from China). I'm the editor/maintainer and a product designer. All six development phases are done. Sessions now keep the content accurate, fill gaps, prepare and carry out the public launch, and help the site outlive me.

## Context

- **Repos.** `derekpcollins/metacycle-resource` is the site (public, `main` branch). `derekpcollins/metacycle-resource-downloads` holds mirrored files as GitHub Release assets only (public). Clone them, or attach them to the session if your tools work that way. If `gh` isn't authenticated, ask me rather than working around it. In Claude's cloud workspace:
  - Repo-scoped `gh api repos/…` REST calls work through the session proxy. GraphQL and `gh pr create` don't.
  - Open PRs with `gh api repos/{owner}/{repo}/pulls`. Merge with `gh api -X PUT repos/{owner}/{repo}/pulls/{n}/merge`. Dispatch workflows with `gh api -X POST repos/{owner}/{repo}/actions/workflows/{file}/dispatches`.
  - **This session type can't create GitHub Releases or delete branches.** Prepare the files and steps, and I'll do those by hand.
- **Hosting.** Vercel project `metacycle-resource` (team _Derek's Projects_). Pushes to `main` deploy to production at https://metacycle.guide (`site.domain` in `src/site.config.ts`). Every PR gets a preview, protected by Vercel Standard Protection. The Vercel MCP can read deployments and logs and create share links for protected previews, but it can't read environment variables, so ask me to set those.
- **Read these before changing anything, in this order:**
  1. `docs/SPEC.md`: the site spec and **source of truth**. Read it fully, especially "Legal & disclaimer", "Governance" and "Launch plan" (steps 3–5: private beta, public launch, fill the gaps).
  2. `docs/PHASES.md`: what Phases 1–6 built, decided, deferred and learned, including the Phase 6 decisions (site name, downloads, Plausible, indexing) and every "Deferred" line.
  3. `docs/RESEARCH.md`: the sourced research brief. §7 lists the open gaps; §8 lists the sources used so far.
  4. `CONTRIBUTING.md`: content rules, buy-link verification, the link checker, adding a download, credit, fork contributions and the review flow.
  5. `docs/BETA.md`: what beta testers were asked to test, and the known gaps.
- If anything in this prompt conflicts with the spec, the spec wins. Flag the conflict to me.
- **What exists:**
  - Astro (TypeScript strict, MDX) with six content collections and strict Zod schemas in `src/content.config.ts`: parts, vendors, tools, guides, troubleshooting, and downloads (`src/data/downloads.yaml`). Enums are in `src/lib/enums.ts`, and cross-references are validated at build time (`src/lib/validate.ts`).
  - Unknown values are the literal `TODO`. The design system is "minimal mono" (`src/styles/tokens.css`, `base.css`), with Pagefind search and no web fonts.
  - Contribution paths:
    - Edit links and issue forms are live (`site.githubContributionsOpen: true`).
    - The no-account web form is `/contribute/form` → `api/contribute.ts` (Turnstile, GitHub App bot).
    - `/contribute/help-wanted` is generated from content.
    - `/contribute/changelog` is generated after each merge (`changelog.yml`, `pull_request_target`).
  - Link checking:
    - The weekly link check runs Mondays 09:17 UTC (`link-check.yml`). It keeps one rolling issue and one dead-links PR.
    - Scheduled runs rebuild production through the `VERCEL_DEPLOY_HOOK_URL` secret.
    - The checker never sets `last_verified` or `status: live`, and never fetches AliExpress, Alibaba or Amazon.
  - SEO and analytics:
    - Canonical URLs, Open Graph/Twitter tags, `sitemap.xml` (an integration in `astro.config.mjs`), and `robots.txt` (`src/pages/robots.txt.ts`).
    - **`site.indexable: false`**: every page is `noindex` until the public launch.
    - Plausible analytics: cookieless, production builds only, disclosed on the Disclaimer and About pages.
  - `npm run ci` runs format, forms check, astro check, build, axe (`test:a11y`: 17 routes, 375px/1280px, light/dark), validation, contribution tests and link-check tests.
  - `npm run verify:list` regenerates `docs/VERIFICATION.md`. `npm run downloads:hash` / `downloads:check [-- --sha]` handle mirrored files.
  - All site identity lives in `src/site.config.ts`. Reference it everywhere, and never hard-code the site name, repo URL or site URL.

## Step 0: ask before you start

Ask me these, and wait for answers, before changing anything:

1. **Which tasks this session?** The scope below is a menu, so pick with me.
2. **Public launch.** Has the private beta finished, and should `site.indexable` flip to `true` now?
3. **Still waiting from Phase 6.** Is mail set up on metacycle.guide (takedown, maintainer and Code of Conduct contacts)? Are real Turnstile keys in Vercel? Has the Disclaimer had a lawyer review? Do we mirror the Sondors-authored manuals yet?
4. **Beta feedback.** Which issues from beta testers should this session handle (labels `web-form`, `community-reported`, `fix`, `spec-correction`, `broken-link`)?

## Scope (a menu; do what Step 0 picks)

1. **Triage and merge contributions.** Work the open issues and PRs per CONTRIBUTING → "Reviewing a contribution". Set `confidence` honestly, credit contributors (the `contributors` field and `Credit:` lines), and close issues with `Closes #N`. Fork PRs: approve their CI runs and Vercel previews only after reading the diff.
2. **Verification sweep.** Use `docs/VERIFICATION.md` and the rolling `link-check` issue. Only a person sets `last_verified`, `status: live` and prices, so record what I (or a contributor) actually saw, with the date. Handle the dead-links PR the checker opened. Rerun `npm run verify:list`.
3. **Fill Help wanted gaps** with sourced facts only: rim sizes, front brake caliper and pads, fork model and oil, torque specs, the maintenance schedule, an exploded diagram, controller alternatives (RESEARCH.md §7). Add each new source to `docs/RESEARCH.md` §8 with its date. Anything you can't source stays `TODO`.
4. **Downloads.** Mirror more files only per the Step 0 answer. Follow CONTRIBUTING → "Adding a download". Never commit binaries to either repo. Record origin, retrieval date and SHA-256, plus the original URL wherever a publisher still hosts the file. I create the Release by hand.
5. **Public launch (development side).** Once I confirm:
   - Set `site.indexable: true` and check `robots` meta, `robots.txt` and `sitemap.xml` on production.
   - Submit the sitemap only if I ask.
   - Rerun Lighthouse mobile on the Phase 6 page list (≥ 95 performance, 100 accessibility and best practices; SEO should now reach 100) and record the scores in `docs/PHASES.md`.
   - Launch announcements and outreach stay out of scope.
6. **Contacts and keys.** When I have them, fill the takedown, maintainer and Code of Conduct contacts (Disclaimer, About, CODE_OF_CONDUCT). Ask me to set the Turnstile keys in Vercel, then confirm the form works on production with a real (labeled) test issue that you close afterwards.
7. **Co-maintainers (spec, Governance).** When I name one, add them to `site.maintainers` and to GitHub with the right permissions (I'll do the GitHub side), and update CONTRIBUTING's review section.
8. **Health checks.** Dependency updates (Astro, Pagefind, Playwright, axe), `npm audit`, and Actions usage. Make sure the weekly link check and deploy hook still run. Every route should return 200 on production.

Out of scope: restyling the design system (small template fixes are fine; note them in `docs/PHASES.md`), new features the spec doesn't ask for, launch outreach, and affiliate links (still off; if they're ever enabled, the Disclaimer needs the affiliate disclosure the same day).

## Acceptance criteria

- I confirmed the Step 0 choices, and they're recorded in `docs/PHASES.md` (a new dated "Post-launch session" entry under the decisions log and notes).
- Every content change cites a source you fetched, or is marked `community-reported` with its contributor credited. No invented part numbers, prices, specs, URLs, checksums or file origins.
- Generated files are regenerated by their scripts: `npm run forms:sync`, `npm run verify:list`, `changelog.json` via the workflow.
- `npm run ci` passes locally and in GitHub Actions, the Vercel deploy of `main` is live, and every route returns 200.
- If launch was approved: pages are indexable on production only, previews stay `noindex`, and Lighthouse scores are recorded.
- A short summary for me: what changed, what needs my hands (Releases, branch deletion, secrets, GitHub settings), and what's next.

## Working rules

- Don't guess. If a fact about the Metacycle isn't in the spec, the research brief or a source you fetched and cite, leave it out or mark it `TODO`. Never invent part numbers, prices, specs, URLs, checksums or file origins.
- Never commit secrets or tokens. Ask me to set them in Vercel or GitHub.
- Every button, including third-party UI (Pagefind, Turnstile wrappers, form controls), uses the shared `.btn` spec from `src/styles/base.css`. List rows use the shared row inset, and use the hover only when the whole row is one link. Check right-edge alignment against the content edge at 375px and desktop.
- Generated files (issue forms, part options, verification list, changelog data, sitemap) are regenerated by their scripts, never edited by hand. Run `npm run forms:sync` / `npm run verify:list` after content changes.
- The link checker must never set `last_verified` or `status: live`, and bot-blocking hosts stay "needs a human".
- Downloads: files only in GitHub Releases of the downloads repo, never committed. Every entry has origin, date and SHA-256.
- Keep `noindex` until I say otherwise.
- Commit in logical steps with clear messages, on a branch, merged by PR.
- Before finishing, run the build and CI locally and fix all errors.

## Finish the session

When the session's work is complete and verified:

1. Update `docs/PHASES.md`: add a dated post-launch entry recording what was done, deferred or learned.
2. Write the next prompt to `docs/prompts/post-launch.md`, replacing this one. If a new development phase has become necessary, write `docs/prompts/phase-7.md` instead. It must be self-contained: point to `docs/SPEC.md`, `docs/RESEARCH.md` and `docs/PHASES.md`, list its scope and acceptance criteria, carry forward these working rules, and itself end with this same "Finish the session" instruction so the chain continues.
3. Commit, push, and print the full next prompt in a single code block so I can paste it into a new chat.

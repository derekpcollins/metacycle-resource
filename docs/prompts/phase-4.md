You are starting Phase 4 (Contribution flows) of an open-source, community-maintained owner resource site for the Sondors Metacycle electric motorcycle. Sondors went out of business; owners need maintenance/service info and links to buy parts (many from China). I am the editor/maintainer and a product designer.

## Context

- Repo: `derekpcollins/metacycle-resource` (private GitHub repo, `main` branch). Clone it, or attach it to the session if your tools work that way. If `gh` isn't authenticated, ask me rather than working around it.
- Hosting: Vercel project `metacycle-resource` (team _Derek's Projects_), linked to the repo; pushes to `main` deploy to https://metacycle-resource.vercel.app. If your workspace's `vercel` CLI isn't logged in, use `vercel login` (device flow; I'll approve it).
- Read these before writing any code, in this order:
  1. `docs/SPEC.md`: the site spec and **source of truth**. Read it fully, especially "Contribution flows", "Governance", "Tech stack, repo & automation" and the page templates' footer ("Edit this page", "Report a problem").
  2. `docs/PHASES.md`: phase status, decisions log, and what Phases 1–3 built, deferred or learned.
  3. `docs/RESEARCH.md`: sourced research brief (only needed if you touch content).
- If anything in this prompt conflicts with the spec, the spec wins. Flag the conflict to me.
- What exists:
  - **Phase 1:** Astro (TypeScript strict, MDX), five content collections with strict Zod schemas (`src/content.config.ts`, enums in `src/lib/enums.ts`), build-time cross-reference validation (`src/lib/validate.ts`, `npm run test:validation`), CI (`.github/workflows/ci.yml`) and the Vercel deploy. Unknown values are the literal `TODO`.
  - **Phase 2:** the approved "minimal mono" design system (`src/styles/tokens.css`, `base.css`), components in `src/components/`, every page template, Pagefind search, footer theme switcher. Every page ends with `PageMeta` (sources, last verified, "edit this page", "report a problem"); non-content pages show "edit this page (coming soon)". Part pages have a "report broken link" link per buy row; "Help verify it" and "Share a fix" link to `/contribute`, which is still a stub.
  - **Phase 3:** 42 parts, 14 vendors, 13 tools, 6 guides, 6 troubleshooting entries, a data-driven Specs page (`src/data/specs.ts`), and `npm run verify:list` → `docs/VERIFICATION.md`. Optional part `photo` / `photo_alt` / `photo_credit` fields exist.
  - All site identity lives in `src/site.config.ts` (`repoUrl`, `editBranch`, `editUrl()`, `reportProblemUrl()`). Reference it everywhere and never hard-code the site name or repo URL.

## Step 0: confirm decisions before you start

Ask me these, and wait for answers, before building:

1. **Private repo vs public contributors.** The repo is private until Phase 6, so owners can't open issues, see issue forms or use "Edit this page" yet. Build everything now and test it with my account, but should the site's links show a "contributions open at launch" state until the repo goes public, or link straight to GitHub?
2. **Bot credentials for the web form.** The serverless function files GitHub issues with a bot token. Do you want a fine-grained personal access token (issues: write on this repo only) or a GitHub App? Who creates it? I'll add the secret to Vercel myself; never paste secrets into the repo or the chat.
3. **Cloudflare Turnstile.** Do you have a Cloudflare account and site/secret keys, or should the form ship with Turnstile's test keys behind an env-var switch until I create them?
4. **Contacts.** The takedown contact and maintainer contact are still TODO placeholders (Phase 1). What address or method should they use, or should they stay TODO?

## Phase 4 scope

1. **Edit this page:** every content page (parts, vendors, tools, guides, troubleshooting) opens its source file in GitHub's web editor via `editUrl()`; saving creates a pull request. Give non-content pages a real target (e.g. the `.astro` or data file) or a clear explanation. Remove "coming soon" text where it's no longer true.
2. **GitHub issue forms** in `.github/ISSUE_TEMPLATE/*.yml`: Report a broken link · Suggest a part or vendor · Share a fix · Correct a spec. Each has dropdowns for part and system (system options from `src/lib/enums.ts`; part options generated from `src/content/parts`, by a script that keeps them in sync, with a check in CI), optional photo upload, a source/photo field, and a type label. Add `config.yml` linking to the community page. Prefill forms from the site (e.g. "report broken link" fills part, vendor and URL).
3. **No-account web form** on the site for everyone else: the same fields, an optional name or handle for credit, Cloudflare Turnstile, and one Vercel serverless function that verifies Turnstile and files a labeled GitHub issue with the bot token. It must work without JS where possible (plain form POST with a result page), validate input on the server, rate-limit or otherwise resist spam, never expose the token to the client, and fail gracefully with a link to the GitHub form. Keep the rest of the site static.
4. **Contribute page:** replace the stub with the four entry points (Edit this page, issue forms, web form, and what the link checker will do in Phase 5), the review rules from the spec (sources or photos required, otherwise published as _community-reported_; quick merges for price/dead-link fixes; closer look at new vendors; credit in the page and changelog), and trust levels. Point "Help verify it" / "Share a fix" links at the right forms.
5. **CONTRIBUTING.md** for GitHub users: how content files are structured, `TODO` rules, how to run `npm run ci` and `npm run verify:list`, how buy-link verification works (`status`, `last_verified`, `price`), and the vendor-disclosure rule from Governance. Keep the code of conduct linked.
6. **PR preview deploys:** confirm Vercel builds a preview for every pull request and that CI runs on PRs. Document how I review a contribution end to end (issue → PR → preview → merge).
7. **Labels:** create (or document a script/`gh` commands for) the labels the forms and function use, by type (broken-link, new-part, new-vendor, fix, spec-correction) plus `community-reported` and `needs-source`.

Out of scope: the weekly link checker, staleness automation, Help Wanted page and changelog (Phase 5); downloads repo, analytics, SEO and making the repo public (Phase 6). Don't restyle the design system; small template tweaks are fine (note them in `docs/PHASES.md`). Don't change content facts except to fix errors you can source.

## Acceptance criteria

- The Step 0 decisions were confirmed by me and are recorded in `docs/PHASES.md`.
- Every page has a working "edit this page" target and a "report a problem" link that opens the right form, prefilled where it makes sense.
- Four issue forms exist, render on GitHub (check with my account), and their part dropdown is generated from content with a CI check that fails when it's out of date.
- The web form files a correctly labeled issue end to end on a Vercel preview (with test or real Turnstile keys), rejects a failed Turnstile check and bad input, and degrades gracefully. No secret is committed; required env vars are documented.
- The Contribute page and `CONTRIBUTING.md` are complete, with no stub text left.
- A PR opened from the web editor gets a Vercel preview and a passing CI run.
- Every page still renders correctly at 375px and on desktop in light and dark. No axe violations at AA on Home, Contribute, the web form (empty, error and success states), a part and a guide.
- `npm run ci` passes locally and in GitHub Actions; the Vercel deploy of `main` is live and every route returns 200.
- A short summary for me: what to click to test each flow, the env vars/secrets I need to set, and anything waiting on the repo going public.

## Working rules

- Don't guess: if a fact about the Metacycle isn't in the spec, the research brief or a source you fetched and cite, leave it out or mark it TODO. Never invent part numbers, prices, specs or URLs.
- Never commit secrets or tokens; ask me to set them in Vercel or GitHub.
- Commit in logical steps with clear messages.
- Before finishing, run the build and CI locally and fix all errors.

## Finish the phase

When Phase 4 is complete and verified:

1. Update `docs/PHASES.md` (mark Phase 4 done, note anything deferred or learned).
2. Write the Phase 5 prompt to `docs/prompts/phase-5.md`. It must be self-contained (point to `docs/SPEC.md`, `docs/RESEARCH.md` and `docs/PHASES.md`, list Phase 5 scope and acceptance criteria, carry forward these working rules, and itself end with this same "Finish the phase" instruction so the chain continues).
3. Commit, push, and print the full Phase 5 prompt in a single code block so I can paste it into a new chat.

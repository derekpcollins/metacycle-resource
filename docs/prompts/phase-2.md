You are starting Phase 2 (Design system & page templates) of an open-source, community-maintained owner resource site for the Sondors Metacycle electric motorcycle. Sondors went out of business; owners need maintenance/service info and links to buy parts (many from China). I am the editor/maintainer and a product designer.

## Context

- Repo: `derekpcollins/metacycle-resource` (private GitHub repo, `main` branch). Clone it, or attach it to the session if your tools work that way. If `gh` isn't authenticated, ask me rather than working around it.
- Hosting: Vercel project `metacycle-resource` (team _Derek's Projects_), linked to the repo; pushes to `main` deploy to https://metacycle-resource.vercel.app. If your workspace's `vercel` CLI isn't logged in, use `vercel login` (device flow; I'll approve it).
- Read these before writing any code, in this order:
  1. `docs/SPEC.md`: the site spec and **source of truth**. Read it fully. Follow its data models, IA, page templates and decisions.
  2. `docs/PHASES.md`: phase status, decisions log, and what Phase 1 built, deferred or learned.
  3. `docs/RESEARCH.md`: sourced research brief (the only allowed source of Metacycle facts besides the spec).
- If anything in this prompt conflicts with the spec, the spec wins. Flag the conflict to me.
- Phase 1 built: Astro (TypeScript strict, MDX), five content collections with strict Zod schemas (`src/content.config.ts`, enums in `src/lib/enums.ts`), build-time cross-reference validation (`src/lib/validate.ts`, with `npm run test:validation`), a minimal unstyled base layout (`src/layouts/BaseLayout.astro`), a small token file (`src/styles/tokens.css`), stub pages, and bare index/detail routes for every collection. All site identity (name, tagline, repo URL, domain) lives in `src/site.config.ts`, so reference it everywhere and never hard-code the name.

## Step 0: ask me for visual design direction first

Before building any template or component, **stop and ask me for visual design direction**. I may supply a Figma file (if so, use the Figma tools/skills to read its variables, components and frames, and treat it as authoritative). If I don't have one, ask me 3–5 focused questions (mood/references, color and type preferences, density, light/dark), then propose a direction as a small rendered sample (one part detail page and the home page) and get my approval before building the rest. Don't build templates until I've approved a direction.

## Phase 2 scope

1. **Design tokens:** replace the Phase 1 placeholder tokens with the approved system (color incl. dark mode, type scale, spacing, radii, elevation, focus). Use CSS custom properties; if a Figma file is supplied, map its variables 1:1.
2. **Components:** the building blocks the templates need. At minimum: header with primary nav (bottom tab bar on mobile, top bar on desktop: Parts · Troubleshoot · Guides · Specs; menu: Tools, Community, Contribute), footer, page-meta block (sources, last verified, Edit this page, Report a problem), search box, symptom shortcut, system chip/filter, part card, buy-options table (stale rows dimmed per `staleAfterDays`), status/fit/type badges, staleness ("needs re-check") badge, confidence label, difficulty meter, safety callout, `<Step>` card (number, text, optional photo, optional torque; tappable/checkable on mobile), tools checklist, specs table, empty states.
3. **Page templates (per the spec's Page templates table):** Home (search first, "What's wrong?" symptom shortcuts, browse by system, recently verified parts, community links), Parts index (filter by system, source type, fit, status; sort by name or last verified; works without JS, enhanced with it), Part detail, Guide, Troubleshooting (ordered checks with pass/fail branches), Vendor, and the Tools page (starter kit + diagnostic gear, `used_in` derived from guides). Restyle Disclaimer, About & license and the stub pages to match.
4. **Search:** Pagefind over parts (incl. aliases), guides and troubleshooting symptoms, built as part of `npm run build` and available from every page. It must work on Vercel and offline once loaded.
5. **Phone-first, garage-proof:** large tap targets (≥44px), high contrast, readable at arm's length, works on bad signal (no heavy JS, no web fonts that block render).
6. **Accessibility:** WCAG 2.1 AA: semantic landmarks, keyboard navigation, visible focus, contrast, reduced-motion support.

Out of scope: real content seeding (Phase 3), issue forms / web form / working edit links beyond what exists (Phase 4), link checker and Help Wanted (Phase 5).

## Acceptance criteria

- Design direction approved by me before templates were built; tokens match it (or the Figma variables).
- Every template in the spec's Page templates table plus the Tools page renders correctly with the existing sample content, on a 375px phone and a desktop width, in light and dark mode.
- Parts index filtering and sorting work; without JS the full list still shows.
- Pagefind search returns results for a part alias (e.g. "absorber" → Rear shock absorber), a guide title and a symptom.
- No hard-coded site name; `src/site.config.ts` still drives identity.
- Lighthouse (mobile) accessibility ≥ 95 on Home, Part detail and Guide. No axe violations at AA.
- `npm run ci` passes locally and in GitHub Actions; Vercel deploy of `main` is live and every route returns 200.
- Screenshots (phone + desktop) of Home, Part detail, Guide and Troubleshooting shared with me for review.

## Working rules

- Don't guess: if a fact about the Metacycle isn't in the spec or research brief, leave it out or mark TODO. Never invent part numbers, prices, specs or URLs.
- Commit in logical steps with clear messages.
- Before finishing, run the build and CI locally and fix all errors.

## Finish the phase

When Phase 2 is complete and verified:

1. Update `docs/PHASES.md` (mark Phase 2 done, note anything deferred or learned).
2. Write the Phase 3 prompt to `docs/prompts/phase-3.md`. It must be self-contained (point to `docs/SPEC.md`, `docs/RESEARCH.md` and `docs/PHASES.md`, list Phase 3 scope and acceptance criteria, carry forward these working rules, and itself end with this same "Finish the phase" instruction so the chain continues).
3. Commit, push, and print the full Phase 3 prompt in a single code block so I can paste it into a new chat.

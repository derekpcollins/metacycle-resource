# Phases

Each phase runs in its own chat. Every phase ends by updating this file and writing the next phase's prompt to `docs/prompts/phase-N.md`. [`docs/SPEC.md`](SPEC.md) is the source of truth.

| #   | Phase                                                                                              | Status      |
| --- | -------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Foundation: repo, schemas, base layout, legal pages, sample content, CI, deploy                    | Done        |
| 2   | Design system & page templates (+ Pagefind search, tools page)                                     | Done        |
| 3   | Content seed (parts, vendors, tools, troubleshooting, guides, spec sheet)                          | Not started |
| 4   | Contribution flows (edit links, GitHub issue forms, no-account web form w/ serverless + Turnstile) | Not started |
| 5   | Automation & trust (weekly link checker, staleness badges, Help Wanted, changelog)                 | Not started |
| 6   | Downloads repo, polish (a11y/perf/SEO, analytics), make repo public                                | Not started |

**Live URL:** https://metacycle-resource.vercel.app (Vercel project `metacycle-resource`, team _Derek's Projects_; pushes to `main` deploy to production).

Launch (beta invites, announcements) is non-development and happens after Phase 6.

## Decisions log

### From the spec (Nov 12, 2026)

- **Metacyclopedia:** link to it for now; explore a merge later.
- **Affiliate links:** allowed in principle to cover costs, disclosed, tools only. Off at launch. Parts stay link-neutral.
- **Manuals and software:** host mirrored copies (origin, date, checksum, link to original) in a **separate downloads repo** via GitHub Releases, with a takedown contact on the Disclaimer page.
- **Co-maintainers:** revisit later.
- **Used-bike buying checklist:** not in v1. Focus is maintenance, service and parts.
- **Tools list:** in v1, linked from every guide.
- **Disclaimer:** in v1 as footer line + full page + guide safety callouts.
- **Stack:** Astro + Content Collections (Zod), Pagefind, Vercel, one serverless function + Cloudflare Turnstile for the no-account form.
- **Licensing:** content CC BY-SA 4.0, code MIT.
- **Still open:** site name and domain.

### Phase 1 implementation decisions

- **Schema file location:** the spec's repo tree says `src/content/config.ts`; current Astro (v7) requires `src/content.config.ts`. Schemas live there; content folders match the spec.
- **Enum values are slugs** (e.g. `battery-charging`, `rebuild-service`, `hand-tool`) with display labels in `src/lib/enums.ts`. Source `type` keeps `OEM` / `OEM-equivalent` as written in the spec example.
- **Unknown values are the literal `TODO`.** Allowed for URLs, prices, `last_verified` and `time_minutes`; anything else unknown is simply omitted.
- **Strict schemas:** unknown or misspelled fields fail the build. This also enforces "`used_in` is never typed" for tools.
- **Cross-reference checks fail the build.** Astro only logs broken `reference()` targets, so `src/lib/validate.ts` (run via the prerendered `/content-check.json`) throws. `npm run test:validation` proves five kinds of bad files are rejected, and runs in CI.
- **Additions beyond the spec's field tables** (flag if unwanted):
  - Guides have a required `confidence` field (confirmed / community-reported / theory), because the Governance section says trust levels show on every guide.
  - Vendors have `references` (links backing vendor facts), and `ships_to_us` / `us_warehouse` are `yes / no / some-items / unknown`, not booleans, so we never have to guess.
  - Troubleshooting `checks` are `{ step, pass, fail }`; `fix` is a list of `{ guide?, part?, note? }`.
  - Tool `buy_links[].vendor` is a free-text store name, not a vendor id, since the vendors collection is for parts sellers.
- **`noindex` on every page** until the public launch (Phase 6).

### Phase 2 design & implementation decisions

- **Visual direction: "minimal mono" (v2), approved Nov 12.** A first "service manual" direction (black header, hazard stripes, heavy yellow) was approved and then replaced before any templates were built. v2: warm paper + ink, 1px rules, monospace for labels, nav, data and section headings; system sans for body text **and large headings** (h1, prose h2). One safety-yellow accent, used only as a fill behind ink text (current-nav underline, active-tab bar, "needs re-check" flag, safety-callout edge). Sample: https://claude.ai/artifact/AHHbmRKt9QQcFBNxThgB2R
- **Post-review tweaks (Nov 12):** the active nav item has a 3px yellow underline about 3px below the label (it replaces the highlighter). "edit this page" and "report a problem" sit side by side. The parts filter selects are custom-drawn at 48px with 13px mono text (Safari ignores `min-height` on native selects). "Recently verified parts" was removed from the home page at Derek's request, and from the spec's Home template (`docs/SPEC.md`, the project doc and the Docs artifact). Community now shows in columns (2 on desktop), and any row that acts as one link (lists, part cards, search results, tools checklist) takes the surface colour across the whole row on hover. Part cards and search results use a stretched link. Every button hovers the same way (yellow fill, ink text). The footer disclaimer runs the full width. A near-duplicate Facebook group was dropped and "private" tags removed. The logo dot was removed. Page actions line up with the first source on desktop. The theme switcher sits bottom-right in the footer. The home page's community link moved into its section heading ("all groups →"). The home page opens with the search box: the site name is a visually hidden `h1`, and the tagline lives only in the meta description.
- **No web fonts.** `system-ui` + `ui-monospace` stacks only.
- **Tokens** live in `src/styles/tokens.css` (color incl. dark, type scale, spacing, shape, elevation, focus, layout, motion). Light/dark follow `prefers-color-scheme` by default. A text-only theme switcher in the footer (system · light · dark, current choice bold) overrides it via `html[data-theme]`, saved in `localStorage` and applied by an inline head script before first paint. The dark palette appears twice in `tokens.css` (media query + `[data-theme='dark']`), so keep both copies in sync. The switcher is hidden without JS.
- **One breakpoint, 60rem.** Below it: phone layout with the fixed bottom tab bar (parts · troubleshoot · guides · specs · more). Above it: top nav with a "more" menu (tools, community, contribute). Menus are `<details>`, so they work without JS. Nav labels are lowercase mono.
- **Stale buy rows are greyed, not faded.** The spec says "dimmed"; opacity would break AA contrast, so stale rows use the muted text colour plus a dashed vendor link and the yellow "needs re-check" flag.
- **Parts index:** filters/sort are JS-only and stored in the URL (`?system=&type=&fit=&status=&sort=`), so home-page system links work. Without JS the full list shows. An inline `html.js` class reveals the filter form before first paint (no layout shift).
- **Search:** Pagefind (devDependency) runs in an `astro:build:done` integration in `astro.config.mjs`, so the index is built by any `astro build`, including Vercel's preset. Only part, guide and troubleshooting pages (`data-pagefind-body`) are indexed, with a type filter (Part / Guide / Symptom). Aliases are weighted up. The home and 404 search boxes and the header icon go to `/search?q=`. Search isn't available under `astro dev`.
- **Guides:** step and tool checkboxes are native inputs; ticks are remembered per guide in `localStorage` when JS is on.
- **Troubleshooting:** likely causes show first on phones and in a sidebar on desktop. Checks render as numbered cards with pass/fail branches.
- **New routes:** `/search` and `/404`. `Labeled.astro` was removed. Shared display helpers are in `src/lib/format.ts`, nav in `src/lib/nav.ts`, community links in `src/data/community.ts`.
- **Spec gaps flagged, not filled:** the Part detail template mentions a photo, but the part data model has no photo field (needs a schema decision). The Vendor template mentions duties, but there's no duties field, so they go in `buying_tips`. The optional exploded-diagram view isn't built because no diagram exists yet.

## Phase 2 notes (deferred / learned)

- **Verified:** axe (WCAG 2.0/2.1 A + AA) found 0 violations on 21 routes × phone/desktop × light/dark. Lighthouse mobile scored 100 for accessibility, performance and best practices on home, parts, part detail, guide and troubleshooting. No page scrolls horizontally at 375px. Search returns "absorber" and "votol" → parts, "battery removal" and "storage" → guides, "power on" and "speedometer" → symptoms, both locally and on Vercel. `npm run ci` passes locally and in GitHub Actions; all 23 pages plus `/content-check.json` and `/pagefind/*` return 200 on production.
- **QA tooling isn't in the repo.** axe, Lighthouse and screenshots were run ad hoc with Playwright. Consider adding an axe check to CI in Phase 6.
- **Deferred:** "Help verify it" and "Share a fix" link to `/contribute` until Phase 4/5 forms and Help Wanted exist. **Pulled forward from Phase 3:** all community links (8 groups, from Metacyclopedia's community page, fetched Nov 12) now link out from the home and Community pages.
- **Learned:** Pagefind only indexes pages with `data-pagefind-body` once any page has it, so index pages and the home page stay out of results. The `vercel` CLI wasn't needed this phase: pushing to `main` deployed.

## Phase 1 notes (deferred / learned)

- **Deployment:** Vercel project `metacycle-resource` is linked to the GitHub repo; every push to `main` deploys to production at https://metacycle-resource.vercel.app. All 21 routes plus `/content-check.json` returned 200 on Nov 12. Pages carry `noindex`, but the production URL itself is public (no Vercel deployment protection). Turn protection on if it should stay private before launch.
- **Tooling gotchas:** `gh` isn't authenticated in Claude's cloud workspace and the Vercel MCP got a 403 creating the project. What worked: create the GitHub repo by hand and attach it to the session, then log in to the Vercel CLI with the device flow (`vercel login`) and run `vercel link`.
- **GitHub Actions:** the CI workflow is committed but its first run wasn't checked from the workspace (no `gh` auth). Check the Actions tab. The repo is private, so runs use Actions minutes (about 2 min each).
- **Deferred to later phases:** real "Edit this page" behavior for non-content pages, issue-form "Report a problem" (Phase 4); the takedown contact, maintainer contact and affiliate disclosure are still TODO placeholders; the Specs, Community and Contribute pages are stubs.
- **Learned:** Astro 7 moved schemas to `src/content.config.ts` and only _logs_ broken references, which is why the hard check exists. Prettier formats content files too (YAML/MDX), but not `docs/SPEC.md` / `docs/RESEARCH.md`, which stay verbatim copies of the project docs.

# Phases

Each phase runs in its own chat. Every phase ends by updating this file and writing the next phase's prompt to `docs/prompts/phase-N.md`. [`docs/SPEC.md`](SPEC.md) is the source of truth.

| #   | Phase                                                                                              | Status      |
| --- | -------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Foundation: repo, schemas, base layout, legal pages, sample content, CI, deploy                    | Done        |
| 2   | Design system & page templates (+ Pagefind search, tools page)                                     | Done        |
| 3   | Content seed (parts, vendors, tools, troubleshooting, guides, spec sheet)                          | Done        |
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
- **Post-review tweaks (Nov 12):** the active nav item has a 3px yellow underline about 3px below the label (it replaces the highlighter). "edit this page" and "report a problem" sit side by side. The parts filter selects are custom-drawn at 48px with 13px mono text (Safari ignores `min-height` on native selects). "Recently verified parts" was removed from the home page at Derek's request, and from the spec's Home template (`docs/SPEC.md`, the project doc and the Docs artifact). Community now shows in columns (2 on desktop), and any row that acts as one link (lists, part cards, search results, tools checklist) takes the surface colour across the whole row on hover. Part cards and search results use a stretched link. Home sections are now "Symptoms", "Systems" and "Community", with section numbers at heading size and no "number = parts listed" caption. Every button hovers the same way (yellow fill, ink text). The footer disclaimer runs the full width. A near-duplicate Facebook group was dropped and "private" tags removed. The logo dot was removed. Page actions line up with the first source on desktop. The theme switcher sits bottom-right in the footer. The home page's community link moved into its section heading ("all groups →"). The home page opens with the search box: the site name is a visually hidden `h1`, and the tagline lives only in the meta description.
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

### Phase 3 decisions (confirmed by Derek, Nov 12)

- **Part photos:** add optional `photo`, `photo_alt` and `photo_credit` fields to the part schema and Part detail template now. `photo_alt` is required whenever `photo` is set. No photos are seeded unless they're sourced and licensed for reuse.
- **Sources beyond the research brief:** facts may come from pages actually fetched (Metacyclopedia sub-pages, vendor listings), as long as each fact is cited in the entry's `references` / `sources` and every new source is added to `docs/RESEARCH.md`.

### Phase 3 implementation decisions

- **Counts:** 42 parts (Metacyclopedia's 37 categories plus battery activator, 5 A fuse, 300 A main fuse, key switch and alarm plug, which guides and fixes link to), 14 vendors, 13 tools, 6 guides, 6 troubleshooting entries. 59 buy options, all `status: unverified`, `last_verified: TODO`, `price.amount: TODO`.
- **More vendors than the five named in the prompt.** Every buy option needs a vendor id, so each seller a source links (Amazon, Alibaba, BMS Battery, Jnicon, Wagner, Renhotec, Corbin-Pacific, Tapia's) has a file. AliExpress links that Metacyclopedia doesn't attribute to SiAECOSYS are filed under a separate `aliexpress` vendor ("seller not confirmed"); only listings a source names as SiAECOSYS's own use `siaecosys-aliexpress`. `cnqsmotor.com` is its own vendor (QS Motor's site; Metacyclopedia labels the links "SiAECOSYS"). The SiAECOSYS store URL stays `TODO`: no source gives it.
- **Unsourced values removed, flagged:** the spec's rear-shock example sets `failure_rate: occasional` and `difficulty: 2`, but no source supports either, so the seeded file omits them (spec example left as-is; it's illustrative). No part has a `difficulty`; only the controller and alarm module have a `failure_rate` (common), both sourced.
- **Guide `difficulty` is required by the schema but no source rates it.** The six guides carry editor estimates (storage 1, cold charging 1, seat 2, battery 3, alarm 3, Votol 4). Treat them as placeholders; consider making the field optional or adding a "not rated" value.
- **`fit` has no "unknown" value.** One aftermarket shock with undocumented fit uses `fit: adapt` plus a note saying so. Consider adding `unknown` to `FITS`.
- **Source conflicts kept visible, not resolved:** battery-activator ground pin (pin 5 on Metacyclopedia's activator page, pin 6 on its charger page); controller listing named "EM200-2SM" on the parts page vs EM200-2SP elsewhere; battery maker stated as Greenway on Metacyclopedia's parts page but "believed" on its battery page (shown as unconfirmed). Each is noted in the part's fit notes and on the Specs page.
- **Tire gap partly filled:** sizes and pressures (110/70 R17 @ 32 psi front, 150/60 R17 @ 30 psi rear) come from Metacyclopedia's parts page. Rims, front brake, fork, torque specs and the maintenance schedule are still gaps.
- **Specs page** is data-driven from `src/data/specs.ts` (one source URL per row): spec sheet, the two documented fuses, four pinout tables, bus speeds, the downloads list (names only, "coming in Phase 6", interim link to Metacyclopedia's Files page) and a "not yet known" list. Its edit link points at `src/data/specs.ts`.
- **Verification checklist:** `npm run verify:list` writes `docs/VERIFICATION.md` (vendors, then pending buy links by vendor, then a by-part index), each item with status, date, price and a GitHub edit link to the YAML file. Output has no timestamp, so it only changes when content does. Re-run it after editing parts or vendors. `yaml` is now an explicit devDependency.
- **Template tweaks (no restyle):** optional photo figure under the part header; part fit notes keep line breaks (`white-space: pre-line`); Specs page built with existing tokens and table styles.
- **Tool `buy_links` are empty** (affiliate off). Tools are only those a source or the spec names.

### Phase 3 follow-up fixes (Derek's review, Nov 12)

- **Search filter counts:** when the filter list loaded after a `?q=` search, Pagefind UI showed whole-index counts (e.g. "Part (42)" for 1 result). The search page now re-runs the query once the filter panel exists, so counts always match results. Reproduced and verified by delaying the filter files.
- **Search styling:** our overrides lost to Pagefind's stylesheet (its selectors carry 2–3 classes and load later), which is why results had no side inset and Clear had no padding. Rules are now scoped with `#search`. Results inset like home rows; Clear and "Load more" use the shared `.btn` spec (padding, border, mono 600, yellow hover). **Rule:** any third-party UI must be restyled to the shared button and row specs.
- **Right alignment:** the footer theme buttons had side padding, so "dark" sat 4px short of the content edge; padding removed (spacing comes from the gap). The header search icon was centred in its 48px tap target (14px short); it's now right-aligned within the target. A scripted scan of key pages at 375px and 1280px found no other misalignments. Rows (home, community, tools checklist) keep their deliberate 8px inset for the hover fill.
- **Troubleshooting:** the likely-causes sidebar is gone; the page is one column. Checks have an optional `most_likely` flag that shows a "most likely" tag, set only where a source supports it (the alarm check on "Won't power on"; the single check on the other one-cause entries; none on "Lost key fobs"). **Spec deviation to confirm:** `likely_causes` is still a required field (spec data model) but is no longer displayed. Either drop it from the spec or decide where it should appear.
- **Guides:** safety callouts run full width. Step cards use the tools-checklist pattern: an unlabeled checkbox on the left (accessible name "Step N done"), with the step number and text on the right.

## Phase 3 notes (deferred / learned)

- **Verified:** `npm run ci` passes locally (format, `astro check`, build, validation tests). All 93 built routes return 200 locally; no horizontal scroll at 375px or 1280px in light or dark; axe (WCAG 2.0/2.1 A + AA) found 0 violations on home, a part, two guides, a troubleshooting page, Specs, a vendor and the parts index at both sizes and both themes. Pagefind returns the right entry for every guide title and every symptom, and for aliases such as "fob", "tyres", "chogori", "pegs" and "flasher".
- **Link sweep (automated, not human-verified, Nov 12):** all 19 cnqsmotor.com product links returned 200 with matching page titles. The BMS Battery connector link returned 404 (noted on the entry). Wagner returned 403 to the bot. AliExpress returned 200/302, which proves nothing because it serves bot pages. Statuses were left `unverified` for Derek.
- **Community:** all 8 links re-checked: 200; both Discord invites valid; Facebook groups sit behind login.
- **Deferred:** human verification of 59 buy links and 1 vendor URL (`docs/VERIFICATION.md`); a Metacycle-specific rebuild price from E-Bike Market Place; part photos (fields exist, none licensed yet); torque values in guides (marked TODO); Sun Coast Cycle Sports stock (still UNVERIFIED; no parts link to it).
- **Learned:** Metacyclopedia's source is on GitHub (`metacyclopedia/metacyclopedia.github.io`), which makes every page readable in full; use it for future imports. The workspace shell can reach most vendor sites directly. `npm run test:validation` leaves `dist/` from a failed build, so run `npm run build` again before previewing.

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

# Phases

Each phase runs in its own chat. Every phase ends by updating this file and writing the next phase's prompt to `docs/prompts/phase-N.md`. [`docs/SPEC.md`](SPEC.md) is the source of truth.

| #   | Phase                                                                                              | Status      |
| --- | -------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Foundation: repo, schemas, base layout, legal pages, sample content, CI, deploy                    | In progress |
| 2   | Design system & page templates (+ Pagefind search, tools page)                                     | Not started |
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

## Phase 1 notes (deferred / learned)

- **Deployment:** Vercel project `metacycle-resource` is linked to the GitHub repo; every push to `main` deploys to production at https://metacycle-resource.vercel.app. All 21 routes plus `/content-check.json` returned 200 on Nov 12. Pages carry `noindex`, but the production URL itself is public (no Vercel deployment protection). Turn protection on if it should stay private before launch.
- **Tooling gotchas:** `gh` isn't authenticated in Claude's cloud workspace and the Vercel MCP got a 403 creating the project. What worked: create the GitHub repo by hand and attach it to the session, then log in to the Vercel CLI with the device flow (`vercel login`) and run `vercel link`.
- **GitHub Actions:** the CI workflow is committed but its first run wasn't checked from the workspace (no `gh` auth). Check the Actions tab. The repo is private, so runs use Actions minutes (about 2 min each).
- **Deferred to later phases:** real "Edit this page" behavior for non-content pages, issue-form "Report a problem" (Phase 4); the takedown contact, maintainer contact and affiliate disclosure are still TODO placeholders; the Specs, Community and Contribute pages are stubs.
- **Learned:** Astro 7 moved schemas to `src/content.config.ts` and only _logs_ broken references, which is why the hard check exists. Prettier formats content files too (YAML/MDX), but not `docs/SPEC.md` / `docs/RESEARCH.md`, which stay verbatim copies of the project docs.

# Metacycle Owner Resource — Site Spec v1

_Nov 12, 2026 · Derek. Source of truth exported from the Docs artifact "Metacycle Owner Resource — Site Spec v1" (https://claude.ai/artifact/LLVbwjgXq7TjpjzCZKgJDC). If the two diverge, the most recently edited wins; update both._

## Overview

An open-source, community-maintained reference that keeps every Sondors Metacycle on the road: what each part is, where to buy it today, and how to fix the common failures. Content lives in a public GitHub repo; owners contribute without needing to know Git; one editor (Derek) approves changes.

**Audience**

- **Owners with a problem right now** — bike won't start, part broke. Need a fix or a buy link in under a minute, usually on a phone in the garage.
- **Owners maintaining or modding** — want specs, torque values, part numbers, upgrade options.
- **Prospective buyers** of a used Metacycle — want to know what fails and whether parts exist.

**Principles**

1. **Every fact has a source and a date.** Each part link shows when it was last verified; stale links are flagged automatically.
2. **Structured over prose.** Parts are data, not paragraphs, so they can be filtered, checked and reused.
3. **Phone-first, garage-proof.** Large tap targets, readable with greasy hands, works on bad signal.
4. **Contributing takes one minute.** A form, not a pull request.
5. **Outlives its founder.** Open license and plain files so anyone can fork it.

**Non-goals (v1)**

- Not a forum or chat — link out to r/metacycle, Discord and Facebook groups.
- Not a store — nothing sold. Affiliate links, if ever enabled, apply to tools only, never to parts.
- No user accounts or logins on the site itself.
- No coverage of other Sondors products (e-bikes, Meta AT, 001).

## Information architecture

The home page is a search bar and a symptom picker; everything else sits one level down, so a stranded owner reaches a fix in two taps.

Sitemap:

- **Home** — search + "What's wrong?" symptom shortcuts
  - **Parts** — part detail, vendors, exploded diagram
  - **Troubleshoot** — symptom pages, by system
  - **Guides** — how-to, maintenance, mods
  - **Specs** — spec sheet, fuses & pinouts, downloads
  - **Community** — Reddit, Discord, Facebook groups
  - **Contribute** — how to help, Help Wanted, changelog
- On every page: search · sources + last verified · Edit this page · Report a problem

Primary navigation (bottom tab bar on mobile, top bar on desktop): Parts · Troubleshoot · Guides · Specs, with Tools, Community and Contribute in the menu. Parts and guides cross-link both ways: every guide lists the parts it needs, every part lists the guides that use it.

## Parts data model

Each part is one YAML file in `src/content/parts/`, validated by a schema at build time so a bad contribution fails loudly instead of breaking a page. Vendors are separate files so a store's details (ships from, US warehouse, reliability notes) are written once and reused.

**Part fields**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | slug | yes | e.g. `rear-shock` |
| `name` | string | yes | Plain-English name |
| `system` | enum | yes | Powertrain, Battery & charging, Electrical, Brakes, Suspension, Wheels & tires, Controls & display, Body & frame, Security |
| `aliases` | list | no | What owners search for ("shock", "absorber") |
| `oem_part_number` | string | no | Factory or supplier number |
| `specs` | map | no | Key/value with units, e.g. `eye_to_eye_mm: 310` |
| `failure_rate` | enum | no | common / occasional / rare / unknown |
| `difficulty` | enum | no | 1–5 wrench scale for replacement |
| `sources` | list | yes | One entry per buy option (below) |
| `fits_notes` | markdown | no | Gotchas, modifications needed |
| `related_guides` | list | no | Guide slugs |
| `references` | list | yes | Links backing the specs |
| `diagram_ref` | string | no | Callout number on the exploded diagram |

**Source (buy option) fields**

| Field | Type | Notes |
| --- | --- | --- |
| `vendor` | vendor id | Links to the vendor file |
| `url` | url | Product page |
| `type` | enum | OEM / OEM-equivalent / aftermarket / salvage / rebuild service |
| `fit` | enum | exact / minor-mod / adapt |
| `price` | number + currency | Price as last seen |
| `last_verified` | date | Set by a human or the link checker |
| `status` | enum | live / out-of-stock / dead / unverified |
| `notes` | string | e.g. "select US plug" |

**Example** (values from the research brief; prices and URLs still to be verified)

```yaml
id: rear-shock
name: Rear shock absorber
system: suspension
aliases: [shock, rear suspension, absorber]
specs:
  eye_to_eye_mm: 310
  mount_hole_mm: 10
  end_width_mm: 25
failure_rate: occasional
difficulty: 2
fits_notes: >
  Stock unit is reported as low quality. Some owners fit 320–330 mm
  to raise ride height.
sources:
  - vendor: siaecosys-aliexpress
    url: TODO
    type: OEM
    fit: exact
    price: { amount: TODO, currency: USD }
    last_verified: TODO
    status: unverified
references:
  - https://metacyclopedia.github.io/parts/
```

Vendor files carry `name`, `url`, `country`, `ships_to_us`, `us_warehouse`, `languages` and a short `buying_tips` note (e.g. customs duties not included on E Smart Way orders).

**Tools**

Each tool is a YAML file in `src/content/tools/`, and guides reference tools by id. Every guide shows a "Tools you'll need" checklist; a Tools page rolls them up into a starter kit plus diagnostic gear (multimeter, Votol programming cable).

| Field | Notes |
| --- | --- |
| `id`, `name` | e.g. `torx-t50` |
| `spec` | Exact size or range, e.g. T50 Torx bit; 3/8" torque wrench 10–80 Nm |
| `category` | hand tool / electrical / diagnostic / lifting / consumable |
| `essential` | In the starter kit or not |
| `used_in` | Built automatically from guides, never typed |
| `buy_links` | vendor, url, `affiliate` (false at launch) |

Affiliate links, if turned on later, live only on tool links and carry a disclosure. Parts stay link-neutral so recommendations can't be bought.

## Guides & troubleshooting content model

Guides are Markdown (MDX) files with structured frontmatter; troubleshooting entries are symptom-first so owners search by what they see, not by what's broken.

**Guide frontmatter**

| Field | Notes |
| --- | --- |
| `title`, `summary` | Shown in lists and search |
| `type` | how-to / reference / maintenance / mod |
| `system` | Same enum as parts |
| `difficulty` | 1–5 |
| `time_minutes` | Estimate |
| `tools` | Tool ids (e.g. T40, T50 Torx) |
| `parts` | Part ids used — rendered as buy links |
| `safety` | Callouts (high-voltage, lift support, freezing-temp charging) |
| `verified_by` / `last_verified` | Who confirmed it works, and when |
| `sources` | Links |

Steps use a `<Step>` component (number, text, optional photo, optional torque value) so they render as tappable, checkable cards on mobile.

**Troubleshooting entry frontmatter**

| Field | Notes |
| --- | --- |
| `symptom` | Owner's words: "Drives but no lights or horn" |
| `system` | Enum |
| `checks` | Ordered steps, most likely first, each with a pass/fail outcome; the most likely ones can be tagged |
| `fix` | Links to a guide or a part |
| `confidence` | confirmed / community-reported / theory |

**Launch content (seeded from known fixes)**

- Troubleshooting: won't power on / remotes dead; drives but no lights, horn or signals (controller reset); speedometer reads wrong (1675 mm circumference); cables rubbing rear tire; can't save sport-mode current; lost key fobs.
- Guides: battery removal & reinstall; long-term storage; cold-weather charging; reprogramming the Votol EM200-2SP; alarm removal; seat upgrades.
- Reference: full spec sheet; fuse map; connector pinouts; manuals & software downloads.
- **Gap to commission:** a maintenance schedule (tire pressure, brake pads, bearings, torque checks) — none exists anywhere today.

## Page templates

Six templates cover v1, plus a Tools page. Every content page ends with the same footer: sources, last-verified date, "Edit this page" and "Report a problem."

| Template | Job | Key elements |
| --- | --- | --- |
| **Home** | Get a stranded owner to a fix fast | Search bar first; "What's wrong?" symptom shortcuts; browse by system; community links |
| **Parts index** | Find a part | Filter by system, source type, fit, status; sort by name or last verified; optional exploded-diagram view with clickable callouts |
| **Part detail** | Decide what to buy | Name, photo, specs table, failure rate, difficulty; buy-options table (vendor, type, fit, price, status, verified date) with stale rows dimmed; fit notes; related guides; "Report broken link" per row |
| **Guide** | Do the job | Difficulty, time, tools, parts (with buy links), safety callouts up top; step cards with photos and torque values; verified-by badge |
| **Troubleshooting** | Diagnose a symptom | Symptom title; ordered checks with pass/fail branches; confidence label; links to the fix guide or part |
| **Vendor** | Know who you're buying from | Ships from, US warehouse, duties, languages, buying tips; all parts linked to this vendor |

Supporting pages: Specs, Downloads (manuals, Votol software), Tools, Community, About & license, Disclaimer, How to contribute, Changelog (auto-generated from merged changes).

**Search:** client-side full-text index (Pagefind) over parts, aliases, guides and symptoms. No server, works offline once loaded.

## Contribution flows

Four ways in, one review queue: owners never need to touch Git, and nothing goes live without the editor's approval.

Flow: Edit this page → pull request (preview deploy) → editor review. Issue form, web form and link checker → GitHub issue (labeled by type) → editor review. Review → approve → merged, site rebuilds; or needs changes → comment back to contributor.

| Entry point | For | What it asks |
| --- | --- | --- |
| **Edit this page** | Comfortable GitHub users | Opens the file in GitHub's web editor; saving creates a pull request automatically |
| **Issue form** | Owners with a GitHub account | Report a broken link · Suggest a part or vendor · Share a fix · Correct a spec. Each form has dropdowns for part and system, plus optional photo upload |
| **Web form on the site** | Everyone else (most Facebook-group owners) | The same fields; files a GitHub issue through the serverless function, with an optional name or handle for credit |
| **Link checker** | Automation | One rolling issue listing dead or stale links |

**Review rules**

- Spec or fix changes need a source link or a photo; otherwise they're published as *community-reported*.
- Price-only updates and dead-link fixes can be merged quickly. New vendors get a closer look for scams and counterfeits.
- Contributors are credited on the page they improved and in the changelog.

## Tech stack, repo & automation

A static Astro site built from files in a public GitHub repo. No database, no server to keep alive, nearly zero hosting cost.

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Astro + Content Collections (Zod schemas) | Typed YAML/MDX, fast static output |
| Search | Pagefind | Static, no service to run |
| Hosting | Vercel (or GitHub Pages) | Free tier; PR preview deploys let you review changes visually |
| Forms without GitHub | One serverless function + Cloudflare Turnstile | Turns a web form into a GitHub issue via a bot token; spam-protected |
| Images | Repo `/public` at first; move to an image CDN if size grows | Keep it simple |
| Domain | TBD | Name not chosen yet |

**Repo structure**

```
/src/content/parts/*.yaml
/src/content/vendors/*.yaml
/src/content/tools/*.yaml
/src/content/guides/*.mdx
/src/content/troubleshooting/*.mdx
/src/content/config.ts        # schemas
/src/pages, /src/components
/.github/ISSUE_TEMPLATE/*.yml # contribution forms
/.github/workflows/           # build, link-check
CONTRIBUTING.md, LICENSE-CONTENT, LICENSE-CODE
```

**Automation (GitHub Actions)**

- **On every PR:** schema validation, build, link check on changed files only, preview deploy.
- **Weekly link checker:** visits every source URL; marks `status` dead or out-of-stock where detectable; opens or updates one issue listing failures. Actions minutes are free on public repos.
- **Staleness badge:** any source with `last_verified` older than 90 days renders as "needs re-check" and appears on a public Help Wanted page.
- **Caveat:** AliExpress often blocks automated checks, so those links will need human verification. The checker should mark them "unverified" rather than "dead."

**Licensing**

- Content: CC BY-SA 4.0 (anyone can reuse and fork; changes stay open).
- Code: MIT.
- Third-party material (manuals, diagrams, photos): see Downloads & copyright below.

## Legal & disclaimer

The site gets a one-line disclaimer in every footer, a full Disclaimer page, and a safety callout at the top of every guide. The draft below is a starting point, not legal advice; a quick lawyer review before launch is worth it.

**Draft disclaimer**

> This site is an independent, community-maintained educational resource. It is not affiliated with, endorsed by, or connected to SONDORS Inc., SiAECOSYS, QS Motor, Votol, or any seller listed here. Everything is provided "as is," without warranty of any kind, and may be incomplete or wrong. The Metacycle has a 72 V high-voltage system, heavy components, and safety-critical brakes and suspension. Any maintenance, repair, or modification you do is at your own risk; if you're unsure, use a qualified technician. Modifications may affect road legality, registration, insurance, or warranty. Links to third-party sellers are for convenience only; we don't control them and aren't responsible for their products, prices, or conduct. Trademarks belong to their owners. To the fullest extent permitted by law, the maintainers and contributors are not liable for any damage, injury, or loss arising from use of this site.

**Downloads & copyright**

- **Host mirrored copies** of manuals, wiring diagrams and controller software, each with its origin, date, file checksum, and a link to the original where one still exists.
- Keep downloads in a **separate repo** (files attached to GitHub Releases, not committed to git). If a rights holder ever files a takedown, it hits that repo only, not the whole site.
- Publish a **takedown contact** on the Disclaimer page and honor requests promptly.
- Sondors-authored manuals carry the most risk now that the brand is active again; Votol's software is already freely redistributed by sellers.
- Add an **affiliate disclosure** to the Disclaimer page the day any affiliate link goes live.

## Governance, launch plan & decisions

**Governance**

- Derek is the editor and merges all changes. Add 1–2 trusted co-maintainers from the owner community later so the site survives anyone stepping away.
- Trust levels on content: *confirmed* (editor or co-maintainer tested it), *community-reported*, *theory*. Shown on every guide and fix.
- A short `CONTRIBUTING.md` and code of conduct; no vendor may edit its own listings without disclosure.

**Launch plan**

1. **Groundwork** — reserve a name and domain; set up the repo, schemas and templates.
2. **Seed content** — import and re-verify the parts list (37 categories); write the 6 known troubleshooting fixes and the battery, storage and controller guides; publish the spec sheet.
3. **Private beta** — invite 10–20 owners from r/metacycle and Discord to break things and fill gaps.
4. **Public launch** — announce in the Reddit, Discord and Facebook groups; pitch Electrek, which has covered the Metacycle story closely.
5. **Fill the gaps** — maintenance schedule, torque specs, tire and brake specs, exploded diagram, controller alternatives. Consider asking Bill Ruehl (former Sondors engineering lead) to review.

**Decisions (Nov 12)**

- Metacyclopedia: link to it for now; explore a merge later.
- Affiliate links: allowed in principle to cover costs, disclosed, tools only. Off at launch.
- Manuals and software: host mirrored copies (see Legal & disclaimer).
- Co-maintainers: revisit later.
- Used-bike buying checklist: not in v1. The focus is maintenance, service and parts.
- Tools list: in v1, linked from every guide.
- Disclaimer: in v1, footer + page + guide safety callouts.

**Still open**

- [ ] Site name and domain

## Related project docs

- `research/metacycle-research-brief.md` — sourced specs, suppliers, known problems, community
- `plan/development-phases.md` — phase plan

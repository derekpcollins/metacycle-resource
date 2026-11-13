You are starting Phase 3 (Content seed) of an open-source, community-maintained owner resource site for the Sondors Metacycle electric motorcycle. Sondors went out of business; owners need maintenance/service info and links to buy parts (many from China). I am the editor/maintainer and a product designer.

## Context

- Repo: `derekpcollins/metacycle-resource` (private GitHub repo, `main` branch). Clone it, or attach it to the session if your tools work that way. If `gh` isn't authenticated, ask me rather than working around it.
- Hosting: Vercel project `metacycle-resource` (team _Derek's Projects_), linked to the repo; pushes to `main` deploy to https://metacycle-resource.vercel.app. If your workspace's `vercel` CLI isn't logged in, use `vercel login` (device flow; I'll approve it).
- Read these before writing any content, in this order:
  1. `docs/SPEC.md`: the site spec and **source of truth**. Read it fully, especially the data models, "Launch content" and the launch plan's "Seed content" step.
  2. `docs/PHASES.md`: phase status, decisions log, and what Phases 1–2 built, deferred or learned.
  3. `docs/RESEARCH.md`: sourced research brief (specs, suppliers, known problems, community, open gaps).
- If anything in this prompt conflicts with the spec, the spec wins. Flag the conflict to me.
- What exists:
  - **Phase 1:** Astro (TypeScript strict, MDX), five content collections with strict Zod schemas (`src/content.config.ts`, enums in `src/lib/enums.ts`), build-time cross-reference validation (`src/lib/validate.ts`, `npm run test:validation`), CI and the Vercel deploy. Unknown values are the literal `TODO` (allowed for URLs, prices, `last_verified`, `time_minutes`); anything else unknown is omitted.
  - **Phase 2:** the approved "minimal mono" design system (`src/styles/tokens.css`, `base.css`), components in `src/components/`, and every page template. The Specs and Contribute pages are still stubs. Pagefind search over parts (incl. aliases), guides and symptoms is built by every `astro build`. There's a footer theme switcher (system/light/dark), and the Community page already links to all 9 groups.
  - All site identity lives in `src/site.config.ts`. Reference it everywhere and never hard-code the site name.

## Step 0: confirm two decisions before you start

Ask me these, and wait for answers, before seeding content:

1. **Part photos.** The Part detail template mentions a photo, but the part data model has no photo field. Should Phase 3 add an optional `photo` (+ `photo_alt`, `photo_credit`) field to the schema and template, or leave photos for later?
2. **Sources beyond the research brief.** The research brief is thin on per-part detail (37 categories live on Metacyclopedia's parts page). Is it OK to take facts from pages you actually fetch, such as Metacyclopedia and vendor listings, as long as each fact is cited in the entry's `references`/`sources` and the new sources are added to `docs/RESEARCH.md`?

## Phase 3 scope

1. **Parts (~37 categories):** one YAML file per part in `src/content/parts/`, imported from Metacyclopedia's parts list (https://metacyclopedia.github.io/parts/) and the research brief.
   - Use plain-English names, the right `system`, owner-language `aliases`, and `specs` with units in the key (e.g. `eye_to_eye_mm`).
   - Set `failure_rate` and `difficulty` only where a source supports them.
   - Fill `fits_notes` and `references` (at least one each).
   - Give each buy option `type`, `fit`, `status: unverified`, and `last_verified: TODO`, unless I've personally confirmed it.
   - Never invent part numbers, prices, specs or URLs. AliExpress blocks bots, so expect most links to stay `unverified`.
2. **Vendors:** a YAML file per seller named in the sources: the SiAECOSYS AliExpress store, cnqsmotor.com, E Smart Way, E-Bike Market Place (battery rebuilds) and Sun Coast Cycle Sports (mark it unverified per the brief). Include ships-from, US warehouse, languages, `buying_tips` (duties go here) and `references`. Replace the current `url: TODO` where a source gives the URL.
3. **Tools:** a YAML file per tool that a guide or source actually calls for (e.g. T40/T50 Torx, multimeter, Votol programming cable), with an exact `spec`, a `category` and `essential` set sensibly. Leave `buy_links` empty or `TODO` (affiliate stays off).
4. **Troubleshooting (6 entries):**
   - won't power on / remotes dead
   - drives but no lights, horn or signals (controller reset)
   - speedometer reads wrong (1675 mm)
   - cables rubbing rear tire
   - can't save sport-mode current
   - lost key fobs

   Two already exist; complete and re-check them. Use ordered `checks` with pass/fail, `fix` links to guides or parts, and an honest `confidence`.

5. **Launch guides:**
   - battery removal & reinstall
   - long-term storage
   - cold-weather charging
   - reprogramming the Votol EM200-2SP
   - alarm removal
   - seat upgrades

   Use `<Step>` cards, `tools` and `parts` references, and `safety` callouts (high voltage, lift support, freezing-temperature charging). Write only steps a source supports; mark missing steps TODO and invite contributions.

6. **Specs page:** a real spec sheet built from the brief's spec table, as structured data (e.g. `src/data/specs.ts` with a source per row), rendered with the existing components. Add fuse and pinout sections only where sourced (Metacyclopedia's Battery / CAN Bus / Controller pages); otherwise show the empty state. List downloads by name with a "coming in Phase 6" note (the downloads repo is Phase 6; don't host files).
7. **Community page:** links were filled in at the end of Phase 2 from Metacyclopedia's community page (`src/data/community.ts`). Re-check that each one still resolves and add the community page source to `docs/RESEARCH.md` if it's missing; don't add groups without a source.
8. **Verification checklist for me:** a generated list of every buy link, vendor URL and price that needs a human check. Generate it with a script (e.g. `npm run verify:list` → `docs/VERIFICATION.md`) that groups entries by part and vendor and shows the current status and date. Make it easy for me to work through on my phone and update `last_verified` / `status` / `price`.
9. **Cross-links:** every guide lists its parts and tools, and parts list their guides (`related_guides`, or derived). The build's cross-reference validation must pass.

Out of scope: issue forms, the web form and working edit links beyond what exists (Phase 4); the link checker and Help Wanted page (Phase 5); hosting downloads, analytics and making the repo public (Phase 6). Don't restyle the design system; small template tweaks needed to show real content are fine (note them in `docs/PHASES.md`).

## Acceptance criteria

- The two Step 0 decisions were confirmed by me and are recorded in `docs/PHASES.md`.
- About 37 part entries, all vendors named in the sources, the tools the guides need, 6 troubleshooting entries and 6 launch guides exist and pass schema and cross-reference validation.
- Every fact has a source link in the entry. Nothing is invented. Unknowns are `TODO` or omitted, and new sources are added to `docs/RESEARCH.md`.
- The Specs page shows real, sourced content, with no stub text left; Community links are re-checked.
- `docs/VERIFICATION.md` (or the agreed equivalent) lists every link/price needing a human check and is regenerated by a script.
- Pagefind returns results for a few new aliases, every guide title and every symptom.
- Every page still renders correctly at 375px and on desktop in light and dark. No axe violations at AA on Home, a part, a guide and a troubleshooting page.
- `npm run ci` passes locally and in GitHub Actions; the Vercel deploy of `main` is live and every route returns 200.
- A short summary for me: counts per collection, the gaps that remain (tires, rims, front brake, fork, torque specs, maintenance schedule), and how many links need my verification.

## Working rules

- Don't guess: if a fact about the Metacycle isn't in the spec, the research brief or a source you fetched and cite, leave it out or mark it TODO. Never invent part numbers, prices, specs or URLs.
- Commit in logical steps with clear messages.
- Before finishing, run the build and CI locally and fix all errors.

## Finish the phase

When Phase 3 is complete and verified:

1. Update `docs/PHASES.md` (mark Phase 3 done, note anything deferred or learned).
2. Write the Phase 4 prompt to `docs/prompts/phase-4.md`. It must be self-contained (point to `docs/SPEC.md`, `docs/RESEARCH.md` and `docs/PHASES.md`, list Phase 4 scope and acceptance criteria, carry forward these working rules, and itself end with this same "Finish the phase" instruction so the chain continues).
3. Commit, push, and print the full Phase 4 prompt in a single code block so I can paste it into a new chat.

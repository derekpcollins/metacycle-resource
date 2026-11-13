# Contributing

Thanks for helping keep Metacycles on the road. This guide is for people working on GitHub. **No GitHub account?** Use the web form on the site (`/contribute/form`): it asks the same questions and lands in the same review queue.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md). By contributing, you agree that your content is licensed under [CC BY-SA 4.0](LICENSE-CONTENT) and your code under [MIT](LICENSE-CODE).

## Four ways in, one review queue

| Way in             | Who it's for                 | What happens                                                                                       |
| ------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| **Edit this page** | Comfortable with GitHub      | Opens the page's file in GitHub's web editor. Saving creates a pull request with a preview deploy. |
| **Issue forms**    | Owners with a GitHub account | Report a broken link · Suggest a part or vendor · Share a fix · Correct a spec.                    |
| **Web form**       | Everyone else                | Same fields, no account; files a labeled issue through the site's bot.                             |
| **Link checker**   | Automation                   | Keeps one rolling issue listing failing buy links; proposes `status: dead` for provably dead ones. |

Nothing goes live until the editor approves it.

Short on time? **[Help wanted](https://metacycle.guide/contribute/help-wanted)** lists every buy link that needs a check, every unknown value and every unverified guide, generated from the content on each build. The **[changelog](https://metacycle.guide/contribute/changelog)** lists every merged change and who to thank.

## The rules that matter

1. **Every fact needs a source.** Add a link or a photo. Spec or fix changes without one are published as _community-reported_.
2. **Never guess.** If you don't know a value, write `TODO` (see below). Never invent part numbers, prices, specs or URLs.
3. **Vendors don't edit their own listings without disclosure.** If you sell a part or work for a store, say so in the pull request (or tick the disclosure box on a form). Undisclosed self-promotion is removed.
4. **Price-only updates and dead-link fixes** are merged quickly. **New vendors** get a closer look for scams and counterfeits.
5. **Credit:** contributors are credited on the page they improved and in the changelog (see [Credit](#credit)).

## How content files are structured

Content is plain files in `src/content/`, validated against the schemas in [`src/content.config.ts`](src/content.config.ts). A misspelled field, an unknown value or a reference to something that doesn't exist **fails the build**, and the error names the file and field.

| Folder                         | One file per… | Format | Key fields                                                              |
| ------------------------------ | ------------- | ------ | ----------------------------------------------------------------------- |
| `src/content/parts/`           | part          | YAML   | `id`, `name`, `system`, `sources` (buy options), `references`           |
| `src/content/vendors/`         | store         | YAML   | `id`, `name`, `url`, `country`, `ships_to_us`, `buying_tips`            |
| `src/content/tools/`           | tool          | YAML   | `id`, `name`, `spec`, `category`, `essential`                           |
| `src/content/guides/`          | how-to / mod  | MDX    | `title`, `type`, `system`, `difficulty`, `tools`, `parts`, `confidence` |
| `src/content/troubleshooting/` | symptom       | MDX    | `symptom`, `system`, `checks` (ordered, most likely first), `fix`       |

- **Ids** are lowercase-kebab-case (`rear-shock`). Parts, vendors and tools carry `id` in the file; guides and troubleshooting entries use the file name.
- **Systems and other choices** are fixed lists in [`src/lib/enums.ts`](src/lib/enums.ts) (e.g. `battery-charging`, `wheels-tires`).
- **References between files** use ids: a buy option's `vendor: e-smart-way`, a guide's `parts: [battery]`, a fix's `guide: battery-removal`.
- **Trust levels** (`confidence`): `confirmed` (the editor or a co-maintainer tested it), `community-reported`, `theory`.
- A troubleshooting check can carry `most_likely: true`, but only where a source supports it.
- Tools never list where they're used (`used_in`); that's worked out from the guides.

### `TODO` rules

Unknown values are the literal string `TODO`, never a guess. `TODO` is allowed for a buy option's `url`, `price.amount` and `last_verified`, for a vendor's `url`, and for a guide's `time_minutes`. Anything else you don't know is simply left out (the field is optional) and shows on the site as unknown.

## How buy-link verification works

Each part's `sources` list holds its buy options:

```yaml
sources:
  - vendor: e-smart-way
    url: https://e-smartway.com/products/…
    type: OEM-equivalent # OEM / OEM-equivalent / aftermarket / salvage / rebuild-service
    fit: exact # exact / minor-mod / adapt
    price: { amount: 89.99, currency: USD } # as last seen; amount may be TODO
    last_verified: 2026-11-12 # the day a person opened the link and checked it
    status: live # live / out-of-stock / dead / unverified
    notes: Select the US plug.
```

- When you check a link, set `status`, `price` and `last_verified` to what you saw **that day**. Only a person sets `last_verified` or `status: live`; the link checker never does.
- `unverified` means nobody has confirmed it. AliExpress blocks automated checks, so its links stay `unverified` until a person looks.
- Rows never verified, or not verified in the last 90 days (`staleAfterDays` in `src/site.config.ts`), are greyed on the site, flagged "needs re-check" and listed on Help wanted. One helper, `src/lib/staleness.ts`, applies this rule everywhere (badge, Help wanted, checklist, checker report).
- `npm run verify:list` regenerates [`docs/VERIFICATION.md`](docs/VERIFICATION.md), a checklist of every buy link still to check, each with an edit link. Re-run it after editing parts or vendors.

## The link checker

`scripts/link-check.ts` visits every buy-option and vendor URL. It's polite: two stores at a time, one request at a time per store with a pause between, a 20-second timeout, one retry, and a User-Agent that names the site. Each URL gets one outcome:

| Outcome                    | Meaning                                                                                                                                                          | What happens                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Live                       | The page loaded                                                                                                                                                  | Nothing. Loading isn't verifying, so `status`/`last_verified` don't change |
| Dead                       | HTTP 404/410, or the domain no longer exists, on two tries                                                                                                       | Listed in the issue; the pull request sets `status: dead`                  |
| Likely out of stock        | The page's structured data (schema.org / og `availability`) says out of stock, and no variant is in stock                                                        | Listed in the issue; a person confirms and edits                           |
| Redirects to the home page | A product link lands on the store's front page                                                                                                                   | Listed in the issue                                                        |
| Couldn't reach             | Timeouts, 5xx, connection errors, on two tries                                                                                                                   | Listed in the issue; usually temporary                                     |
| Needs a human              | Bot-blocking stores (`NEEDS_HUMAN_HOSTS` in `src/lib/link-rules.ts`: AliExpress, Alibaba, Amazon) are never fetched; 401/403/429 and captcha pages land here too | Never marked dead; stays `unverified`; listed on Help wanted               |

**In GitHub Actions:** it runs every Monday at 09:17 UTC, or on demand from Actions → **Link check** → **Run workflow**. Scheduled runs also rebuild production through a Vercel deploy hook (repository secret `VERCEL_DEPLOY_HOOK_URL`), because "needs re-check" flags are worked out at build time and would otherwise only age when content changes. A run opens or updates **one** issue labeled `link-check` (re-runs edit it; it closes itself when a run has no failures) and, if anything is provably dead and "open pull request" is ticked, force-pushes `link-checker/dead-links` and opens or updates **one** pull request. Pushes made by the workflow don't trigger CI on their own, so the workflow starts CI on that branch; its result shows on the pull request.

**On every pull request:** CI checks only the URLs the pull request adds or changes in content files and writes the result to the job summary. It fails only on a clearly dead link (404/410 or a missing domain); blocked stores and timeouts never fail it. No content changes, no check.

**Locally:**

```sh
npm run links:check                                   # dry run: report only, changes nothing
npm run links:check -- --only https://example.com/x   # one URL (repeatable)
npm run links:check -- --apply                        # also set status: dead on provably dead buy options
npm run links:check -- --changed-since origin/main    # PR mode
npm run links:check -- --report r.md --json r.json    # write the report and raw results
npm run test:links                                    # rule tests, no network
```

To stop the checker fetching a store that always blocks it, add its host to `NEEDS_HUMAN_HOSTS`.

## Credit

Contributors are credited in two places:

- **On the page they improved.** Every content file has an optional `contributors` list (a name or handle as the contributor gave it; never an email address). The page shows "improved by …" in its footer. Add the name when you merge their change.
- **In the changelog.** After each merge, `.github/workflows/changelog.yml` runs `npm run changelog -- --pr N`, which adds the pull request to `src/data/changelog.json` (don't edit it by hand) and commits it to `main`; `/contribute/changelog` renders it. Credit for an entry comes from `Credit: Name, @handle` lines in the pull request description, names newly added to a `contributors` list, and the pull request's author unless they're a maintainer (`maintainers` in `src/site.config.ts`) or a bot. Web-form issues end with "Credit: **name**"; copy that line into the pull request.

`npm run changelog -- --backfill` rebuilds every entry from GitHub (needs the `gh` CLI).

## Contributing from a fork

The repository is public, so anyone can propose changes:

1. **Fork** the repo on GitHub (the "edit this page" link does this for you on its first use), make your change on a branch, and open a pull request against `main`.
2. **Checks on your pull request:** CI runs `npm run ci` (formatting, generated issue forms, type check, build, the accessibility check and the tests) plus the link check on any URLs you added. It needs no secrets, so it works the same from a fork. If this is your first contribution, GitHub waits for a maintainer to approve the run; that's normal.
3. **Preview:** Vercel builds a preview of every pull request. For pull requests from forks, Vercel waits for a maintainer to authorize the preview first.
4. **After merge**, the changelog workflow credits you (see [Credit](#credit)). It runs from `main`'s own workflow file, never from the fork's code.

Keep pull requests small and about one thing. Fixing a buy link, a price or one spec is the ideal first contribution; [Help wanted](https://metacycle.guide/contribute/help-wanted) lists them.

## Adding a download (maintainers)

Manuals, wiring diagrams and software are mirrored in a separate repo, [`metacycle-resource-downloads`](https://github.com/derekpcollins/metacycle-resource-downloads) (`downloadsRepoUrl` in `src/site.config.ts`), as **GitHub Release assets**. Never commit the files themselves, here or there: a takedown then only touches that repo.

1. Get the file from its original link if one still exists; otherwise from the best public copy. Note where and when.
2. Give it a kebab-case name with no spaces (`votol-controller-programming-manual.pdf`), then run `npm run downloads:hash -- path/to/file` for its `size_bytes` and `sha256`.
3. Attach it to a Release in the downloads repo (a new Release tagged with the date, e.g. `2026-12-01`, or an existing one). Its release notes should list each file with its origin and SHA-256.
4. Add an entry to [`src/data/downloads.yaml`](src/data/downloads.yaml): `name`, `group`, `description`, `release`, `asset`, `size_bytes`, `sha256`, `origin` (who made it, only as far as the file or its source says), `retrieved_from`, `retrieved`, `original_url` (or `TODO`) and `rights`. The schema rejects a missing field or a malformed checksum.
5. Run `npm run downloads:check -- --sha` to confirm every listed asset exists in its Release with the same size and checksum.

Sondors-authored manuals are held back for now (spec, "Downloads & copyright"). A takedown request: remove the asset from its Release, delete its entry, note it in the pull request.

## Working from a clone

Requires Node 22.12+.

```sh
npm install
npm run dev            # http://localhost:4321 (no search, no web form)
npm run ci             # everything CI runs: format, issue forms, type check, build, axe, tests
npm run test:a11y      # just the accessibility check (after npm run build)
npm run verify:list    # rebuild docs/VERIFICATION.md
npm run links:check    # link checker dry run (see below)
npm run format         # fix formatting
```

`npm run test:a11y` needs Chromium for Playwright once: `npx playwright install chromium`. It runs axe (WCAG 2.1 A and AA) on a representative set of pages at 375px and 1280px, in light and dark, and fails on horizontal scrolling too. Add a route to `DEFAULT_ROUTES` in `scripts/test-a11y.ts` when you add a new kind of page.

`npm run ci` must pass before a pull request can be merged. It also runs on every pull request in GitHub Actions, and Vercel builds a preview of every pull request.

### Issue forms are generated

The GitHub issue forms in `.github/ISSUE_TEMPLATE/` and `src/data/part-options.ts` are generated from [`src/lib/contribution.ts`](src/lib/contribution.ts) and the part files. **After adding, renaming or removing a part, run `npm run forms:sync` and commit the result**; CI fails if they're out of date. To change a question or a label, edit `src/lib/contribution.ts` (the web form uses the same definitions), then run `npm run forms:sync`. `npm run labels:sync` creates the repo labels (needs the `gh` CLI).

### The web form locally

`npm run build && npm run serve:local -- --stub-github` serves the built site with the form's function, using Cloudflare's test Turnstile keys and a fake GitHub (nothing is filed). Drop `--stub-github` and set the `GITHUB_APP_*` variables below to file real issues.

## Web-form configuration (maintainers)

The form's function (`api/contribute.ts`) needs these Vercel environment variables. Never commit them.

| Variable                     | Needed | What                                                                                 |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------ |
| `GITHUB_APP_ID`              | yes    | The GitHub App that files issues (Issues: read & write on this repo only)            |
| `GITHUB_APP_PRIVATE_KEY`     | yes    | The App's private key (`.pem` contents). Mark as sensitive.                          |
| `GITHUB_APP_INSTALLATION_ID` | no     | Saves one API call; looked up from the repo if unset                                 |
| `TURNSTILE_SECRET_KEY`       | one of | Cloudflare Turnstile secret key (sensitive)                                          |
| `TURNSTILE_TEST_MODE`        | one of | `pass` or `fail`: use Cloudflare's public test secret instead (testing only)         |
| `TURNSTILE_SITE_KEY`         | no     | Turnstile site key, read at build time; defaults to the always-pass test key         |
| `WEBFORM_HOURLY_CAP`         | no     | Max web-form issues per hour across the site (default 20)                            |
| `GITHUB_CONTRIBUTIONS`       | no     | `true` turns on "edit this page" and issue-form links in that build (set on Preview) |

Spam defenses: Turnstile, a hidden honeypot field, a same-origin check, a size cap, a per-IP limit (per function instance) and the hourly cap. If anything fails, the form keeps what was typed and says so.

## Repository secrets (maintainers)

| Secret                   | Where          | What                                                                                                     |
| ------------------------ | -------------- | -------------------------------------------------------------------------------------------------------- |
| `VERCEL_DEPLOY_HOOK_URL` | GitHub Actions | A Vercel deploy hook for `main` (Vercel → Settings → Git → Deploy Hooks). The weekly link check uses it. |

Analytics (Plausible) needs no secret: its script URL is public and lives in `src/site.config.ts`. It loads only on production builds.

## Reviewing a contribution (maintainers)

1. **Issue arrives** (form, web form or link checker), labeled by type: `broken-link`, `new-part`, `new-vendor`, `fix`, `spec-correction`; `needs-source` if there's no link or photo; `web-form` if it came from the site; `link-check` for the checker's rolling issue and pull request. A broken-link report that says "It works: I checked it" is a verification: set `status: live`, `last_verified` to the date it was filed and the price it gives.
2. **Make the change** with "edit this page" (or a branch), add the contributor's name to the file's `contributors` list, then open a pull request that says `Closes #N` and `Credit: Name`.
3. **Check the preview.** Vercel comments a preview URL on the pull request; CI runs `npm run ci`.
4. **Merge** when CI passes and the preview looks right; `main` deploys to production. If there's no source, publish it with `confidence: community-reported` and add the `community-reported` label to the issue.
5. **Needs changes?** Comment on the issue or pull request.

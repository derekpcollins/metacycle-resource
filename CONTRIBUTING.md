# Contributing

Thanks for helping keep Metacycles on the road. This guide is for people working on GitHub. **No GitHub account?** Use the web form on the site (`/contribute/form`): it asks the same questions and lands in the same review queue.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md). By contributing, you agree that your content is licensed under [CC BY-SA 4.0](LICENSE-CONTENT) and your code under [MIT](LICENSE-CODE).

## Four ways in, one review queue

| Way in             | Who it's for                   | What happens                                                                                       |
| ------------------ | ------------------------------ | -------------------------------------------------------------------------------------------------- |
| **Edit this page** | Comfortable with GitHub        | Opens the page's file in GitHub's web editor. Saving creates a pull request with a preview deploy. |
| **Issue forms**    | Owners with a GitHub account   | Report a broken link · Suggest a part or vendor · Share a fix · Correct a spec.                    |
| **Web form**       | Everyone else                  | Same fields, no account; files a labeled issue through the site's bot.                             |
| **Link checker**   | Automation (coming in Phase 5) | Keeps one rolling issue listing dead or stale buy links.                                           |

Nothing goes live until the editor approves it.

## The rules that matter

1. **Every fact needs a source.** Add a link or a photo. Spec or fix changes without one are published as _community-reported_.
2. **Never guess.** If you don't know a value, write `TODO` (see below). Never invent part numbers, prices, specs or URLs.
3. **Vendors don't edit their own listings without disclosure.** If you sell a part or work for a store, say so in the pull request (or tick the disclosure box on a form). Undisclosed self-promotion is removed.
4. **Price-only updates and dead-link fixes** are merged quickly. **New vendors** get a closer look for scams and counterfeits.
5. **Credit:** contributors are credited on the page they improved and in the changelog.

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

- When you check a link, set `status`, `price` and `last_verified` to what you saw **that day**. Only a person (or, from Phase 5, the link checker) sets `last_verified`.
- `unverified` means nobody has confirmed it. AliExpress blocks automated checks, so its links stay `unverified` until a person looks.
- Rows not verified in the last 90 days are greyed on the site and flagged "needs re-check."
- `npm run verify:list` regenerates [`docs/VERIFICATION.md`](docs/VERIFICATION.md), a checklist of every buy link still to check, each with an edit link. Re-run it after editing parts or vendors.

## Working from a clone

Requires Node 22.12+.

```sh
npm install
npm run dev            # http://localhost:4321 (no search, no web form)
npm run ci             # everything CI runs: format, issue forms, type check, build, tests
npm run verify:list    # rebuild docs/VERIFICATION.md
npm run format         # fix formatting
```

`npm run ci` must pass before a pull request can be merged. It also runs on every pull request in GitHub Actions, and Vercel builds a preview of every pull request.

### Issue forms are generated

The GitHub issue forms in `.github/ISSUE_TEMPLATE/` and `src/data/part-options.ts` are generated from [`src/lib/contribution.ts`](src/lib/contribution.ts) and the part files. **After adding, renaming or removing a part, run `npm run forms:sync` and commit the result**; CI fails if they're out of date. To change a question or a label, edit `src/lib/contribution.ts` (the web form uses the same definitions), then run `npm run forms:sync`. `npm run labels:sync` creates the repo labels (needs the `gh` CLI).

### The web form locally

`npm run build && npm run serve:local -- --stub-github` serves the built site with the form's function, using Cloudflare's test Turnstile keys and a fake GitHub (nothing is filed). Drop `--stub-github` and set the `GITHUB_APP_*` variables below to file real issues.

## Web-form configuration (maintainers)

The form's function (`api/contribute.ts`) needs these Vercel environment variables. Never commit them.

| Variable                      | Needed | What                                                                                 |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------ |
| `GITHUB_APP_ID`               | yes    | The GitHub App that files issues (Issues: read & write on this repo only)            |
| `GITHUB_APP_PRIVATE_KEY`      | yes    | The App's private key (`.pem` contents). Mark as sensitive.                          |
| `GITHUB_APP_INSTALLATION_ID`  | no     | Saves one API call; looked up from the repo if unset                                 |
| `TURNSTILE_SECRET_KEY`        | one of | Cloudflare Turnstile secret key (sensitive)                                          |
| `TURNSTILE_TEST_MODE`         | one of | `pass` or `fail`: use Cloudflare's public test secret instead (testing only)         |
| `PUBLIC_TURNSTILE_SITE_KEY`   | no     | Turnstile site key, read at build time; defaults to the always-pass test key         |
| `WEBFORM_HOURLY_CAP`          | no     | Max web-form issues per hour across the site (default 20)                            |
| `PUBLIC_GITHUB_CONTRIBUTIONS` | no     | `true` turns on "edit this page" and issue-form links in that build (set on Preview) |

Spam defenses: Turnstile, a hidden honeypot field, a same-origin check, a size cap, a per-IP limit (per function instance) and the hourly cap. If anything fails, the form keeps what was typed and says so.

## Reviewing a contribution (maintainers)

1. **Issue arrives** (form, web form or link checker), labeled by type: `broken-link`, `new-part`, `new-vendor`, `fix`, `spec-correction`; `needs-source` if there's no link or photo; `web-form` if it came from the site.
2. **Make the change** with "edit this page" (or a branch), then open a pull request that says `Closes #N` and credits the contributor.
3. **Check the preview.** Vercel comments a preview URL on the pull request; CI runs `npm run ci`.
4. **Merge** when CI passes and the preview looks right; `main` deploys to production. If there's no source, publish it with `confidence: community-reported` and add the `community-reported` label to the issue.
5. **Needs changes?** Comment on the issue or pull request.

# Metacycle Owner Guide

An open-source, community-maintained reference that keeps every Sondors Metacycle on the road: what each part is, where to buy it today, and how to fix the common failures. Sondors went out of business; owners keep each other going.

> Live at https://metacycle.guide (private beta). The site name, tagline, repo URL and domain all live in [`src/site.config.ts`](src/site.config.ts).

## Run it locally

Requires Node 22.12+.

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run ci         # format, issue-form sync, type check, build, and tests
```

## How content works

Content is plain files, validated at build time:

| Folder                         | What                                | Format |
| ------------------------------ | ----------------------------------- | ------ |
| `src/content/parts/`           | One file per part, with buy options | YAML   |
| `src/content/vendors/`         | Stores that sell parts              | YAML   |
| `src/content/tools/`           | Tools that guides need              | YAML   |
| `src/content/guides/`          | How-tos, maintenance, mods          | MDX    |
| `src/content/troubleshooting/` | Symptom-first fixes                 | MDX    |

Schemas are in [`src/content.config.ts`](src/content.config.ts). A misspelled field, an unknown enum value, or a reference to a part, vendor, tool or guide that doesn't exist **fails the build**. Unknown facts are written as `TODO`, never guessed.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md). Owners without GitHub use the site's web form (`/contribute/form`); GitHub users get issue forms and "edit this page" links (live once the repo is public).

## Docs

- [`docs/SPEC.md`](docs/SPEC.md): the site spec and source of truth
- [`docs/RESEARCH.md`](docs/RESEARCH.md): sourced research brief
- [`docs/PHASES.md`](docs/PHASES.md): build phases and decisions log

## License

Content is [CC BY-SA 4.0](LICENSE-CONTENT). Code is [MIT](LICENSE-CODE). Not affiliated with SONDORS Inc. or any seller; see the site's Disclaimer page.

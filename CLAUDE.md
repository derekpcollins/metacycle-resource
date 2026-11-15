# Metacycle Owner Guide

An open-source, community-maintained reference that keeps every Sondors Metacycle on the road: what each part is, where to buy it today, and how to fix the common failures. Astro static site (content in YAML and MDX, validated at build time), Pagefind search, and one Vercel function for the web contribution form. Live at https://metacycle.guide.

`docs/SPEC.md` is the source of truth; `CONTRIBUTING.md` covers content, downloads, the link checker and the web form.

**Pushes to `main` deploy to production.** This repo is public.

## Commands

- `npm run dev`: local dev server (http://localhost:4321)
- `npm run build`: static site in `dist/`; fails on bad content or broken cross-references
- `npm run ci`: everything CI runs (format, issue forms, type check, build, axe, tests)
- `npm run format`: fix formatting

## Rules

- Never commit or push to `main`. Always work on a branch and open a PR.
- Every PR gets a Vercel preview URL (it appears on the PR). Review it before merging.
- `npm run build` must pass before every commit. `npm run ci` must pass before a PR can merge; CI runs it on every PR.
- After adding, renaming or removing a part, run `npm run forms:sync`; the issue forms are generated.
- Don't edit `src/data/changelog.json` by hand; the changelog workflow writes it after each merge.
- Never commit secrets. The form's keys live only in Vercel environment variables.

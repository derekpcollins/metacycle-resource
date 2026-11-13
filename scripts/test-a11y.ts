#!/usr/bin/env tsx
/**
 * Automated accessibility check against the built site (run `npm run build` first).
 * Serves dist/ with scripts/serve-local.ts (GitHub stubbed), then runs axe (WCAG 2.0/2.1
 * A + AA) on a representative set of routes at 375px and 1280px, in light and dark.
 * Also fails if a page scrolls horizontally or anything pokes past the viewport edge.
 *
 *   npm run build && npm run test:a11y
 *   npm run test:a11y -- --route /parts      # one route
 *
 * Needs Chromium for Playwright: `npx playwright install chromium` (CI does this).
 */
import { spawn } from 'node:child_process';
import { chromium, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PORT = Number(process.env.A11Y_PORT ?? 4399);
const BASE = `http://localhost:${PORT}`;

/** One of each template, plus the pages with the most custom UI. */
const DEFAULT_ROUTES = [
  '/',
  '/parts',
  '/parts/rear-shock',
  '/guides/battery-removal',
  '/troubleshooting/wont-power-on',
  '/vendors/e-smart-way',
  '/tools',
  '/specs',
  '/downloads',
  '/community',
  '/contribute',
  '/contribute/form',
  '/contribute/help-wanted',
  '/contribute/changelog',
  '/disclaimer',
  '/search?q=battery',
  '/this-page-does-not-exist',
];
const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '1280', width: 1280, height: 900 },
];
const SCHEMES = ['light', 'dark'] as const;

const argRoute = process.argv.indexOf('--route');
const routes = argRoute > -1 ? [process.argv[argRoute + 1]!] : DEFAULT_ROUTES;

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('local server did not start');
}

/** Elements whose right edge passes the viewport (ignores visually hidden/offscreen helpers). */
async function overflow(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const scroll = document.documentElement.scrollWidth > vw + 1;
    const out: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.right <= vw + 1) continue;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' && r.left >= vw) continue; // offscreen skip link etc.
      if (el.closest('.visually-hidden, .skip-link, [hidden], iframe')) continue;
      // Content inside a horizontal scroller is fine (wide tables scroll on purpose).
      let p = el.parentElement;
      let scrolled = false;
      while (p) {
        const o = getComputedStyle(p).overflowX;
        if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') scrolled = true;
        p = p.parentElement;
      }
      if (!scrolled) out.push(`${el.tagName.toLowerCase()}.${el.className}`.slice(0, 80));
    }
    return { scroll, offenders: out.slice(0, 5) };
  });
}

const server = spawn('npx', ['tsx', 'scripts/serve-local.ts', '--stub-github'], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'ignore',
});
let failures = 0;
try {
  await waitForServer();
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    for (const scheme of SCHEMES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: scheme,
      });
      // Keep third-party widgets out of the run: Turnstile is a cross-origin iframe we can't
      // change, and analytics only loads on production builds anyway.
      await context.route(/challenges\.cloudflare\.com|plausible\.io/, (r) => r.abort());
      const page = await context.newPage();
      for (const route of routes) {
        const label = `${route} @${vp.name} ${scheme}`;
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe')
          .analyze();
        const ov = await overflow(page);
        const problems = [
          ...results.violations.map(
            (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
          ),
          ...(ov.scroll ? ['page scrolls horizontally'] : []),
          ...ov.offenders.map((o) => `past the right edge: ${o}`),
        ];
        if (problems.length) {
          failures++;
          console.log(`✗ ${label}`);
          for (const p of problems) console.log(`    ${p}`);
        } else console.log(`✓ ${label}`);
      }
      await context.close();
    }
  }
  await browser.close();
} finally {
  server.kill();
}
console.log(failures ? `\n${failures} page checks failed` : '\nall page checks passed');
process.exit(failures ? 1 : 0);

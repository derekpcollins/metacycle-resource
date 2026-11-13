#!/usr/bin/env node
/**
 * Proves the content gate works: each case drops a deliberately broken file into a
 * collection, runs the build, and expects it to FAIL. Exits non-zero if any bad file
 * slips through. Run with `npm run test:validation`.
 */
import { execSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';

const cases = [
  {
    name: 'part references a vendor that does not exist',
    file: 'src/content/parts/zz-test-bad-vendor.yaml',
    body: `id: zz-test-bad-vendor
name: Test
system: brakes
sources:
  - { vendor: no-such-vendor, url: TODO, type: OEM, fit: exact, last_verified: TODO, status: unverified }
references: [https://example.com]
`,
  },
  {
    name: 'guide references a tool that does not exist',
    file: 'src/content/guides/zz-test-bad-tool.mdx',
    body: `---
title: Test
summary: Test
type: how-to
system: brakes
difficulty: 1
time_minutes: 5
tools: [no-such-tool]
confidence: theory
sources: [https://example.com]
---
`,
  },
  {
    name: 'guide references a part that does not exist',
    file: 'src/content/guides/zz-test-bad-part.mdx',
    body: `---
title: Test
summary: Test
type: how-to
system: brakes
difficulty: 1
time_minutes: 5
parts: [no-such-part]
confidence: theory
sources: [https://example.com]
---
`,
  },
  {
    name: 'invalid enum value (system)',
    file: 'src/content/parts/zz-test-bad-enum.yaml',
    body: `id: zz-test-bad-enum
name: Test
system: hovercraft
sources: []
references: [https://example.com]
`,
  },
  {
    name: 'tool with a hand-typed used_in field',
    file: 'src/content/tools/zz-test-used-in.yaml',
    body: `id: zz-test-used-in
name: Test
spec: Test
category: hand-tool
used_in: [battery-removal]
`,
  },
  {
    // likely_causes was dropped in Phase 4: ordered checks with most_likely carry it now.
    name: 'troubleshooting entry with the retired likely_causes field',
    file: 'src/content/troubleshooting/zz-test-likely-causes.mdx',
    body: `---
symptom: Test
system: brakes
likely_causes: [Test]
confidence: theory
sources: [https://example.com]
---
`,
  },
  {
    // Phase 5: contributors are names or handles, never email addresses.
    name: 'contributor credited by email address',
    file: 'src/content/tools/zz-test-contributor-email.yaml',
    body: `id: zz-test-contributor-email
name: Test
spec: Test
category: hand-tool
contributors: [someone@example.com]
`,
  },
];

let failures = 0;
for (const c of cases) {
  writeFileSync(c.file, c.body);
  let built = false;
  try {
    execSync('npx astro build', { stdio: 'pipe' });
    built = true;
  } catch {
    // expected
  } finally {
    rmSync(c.file, { force: true });
  }
  console.log(`${built ? '✗ NOT CAUGHT' : '✓ caught'}  ${c.name}`);
  if (built) failures++;
}

if (failures) {
  console.error(`\n${failures} broken file(s) passed the build.`);
  process.exit(1);
}
console.log('\nAll broken content was rejected.');

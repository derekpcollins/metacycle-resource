#!/usr/bin/env tsx
/**
 * Local preview of the built site *with* the web-form function, which `astro preview`
 * can't run. Serves dist/ and routes /api/contribute to api/contribute.ts.
 *
 *   npm run build && npm run serve:local                 # real GitHub (needs the env vars)
 *   npm run build && npm run serve:local -- --stub-github  # fake issue #1, nothing filed
 *
 * Turnstile defaults to Cloudflare's always-pass test keys here (TURNSTILE_TEST_MODE=pass).
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT ?? 4322);
const dist = new URL('../dist/', import.meta.url).pathname;
process.env.TURNSTILE_TEST_MODE ??= 'pass';

if (process.argv.includes('--stub-github')) {
  process.env.GITHUB_APP_ID ??= 'stub';
  process.env.GITHUB_APP_INSTALLATION_ID ??= 'stub';
  const { generateKeyPairSync } = await import('node:crypto');
  process.env.GITHUB_APP_PRIVATE_KEY ??= generateKeyPairSync('rsa', { modulusLength: 2048 })
    .privateKey.export({ type: 'pkcs1', format: 'pem' })
    .toString();
  const real = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    if (!url.startsWith('https://api.github.com/')) return real(input, init);
    if (url.includes('/access_tokens'))
      return Response.json({
        token: 'stub',
        expires_at: new Date(Date.now() + 3.6e6).toISOString(),
      });
    if (url.includes('/issues?')) return Response.json([]);
    console.log(`[stub] would file: ${init?.body}`);
    return Response.json({ number: 1, html_url: 'https://github.com/stub/stub/issues/1' });
  }) as typeof fetch;
}

const { POST, GET } = await import('../api/contribute.ts');
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`);
  if (url.pathname === '/api/contribute') {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const request = new Request(url, {
      method: req.method,
      headers: Object.entries(req.headers).flatMap(([k, v]) =>
        v === undefined ? [] : [[k, String(v)] as [string, string]],
      ),
      body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
    });
    const out = req.method === 'POST' ? await POST(request) : GET();
    res.writeHead(out.status, Object.fromEntries(out.headers));
    res.end(Buffer.from(await out.arrayBuffer()));
    return;
  }
  let path = normalize(join(dist, decodeURIComponent(url.pathname)));
  if (!path.startsWith(dist)) return res.writeHead(403).end();
  try {
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
  } catch {
    path = `${path.replace(/\/$/, '')}.html`;
  }
  try {
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    res.end(await readFile(join(dist, '404.html')).catch(() => 'Not found'));
  }
}).listen(port, () => console.log(`http://localhost:${port}`));

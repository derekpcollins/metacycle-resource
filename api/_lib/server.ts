/**
 * Server-only helpers for api/contribute.ts: Cloudflare Turnstile verification, GitHub App
 * authentication, issue filing and spam limits. Nothing here is sent to the browser.
 * (Files under api/_lib are not routes: Vercel skips paths starting with "_".)
 *
 * Environment variables (set in Vercel → Settings → Environment Variables; see CONTRIBUTING.md):
 *   GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY      required: the bot that files issues
 *   GITHUB_APP_INSTALLATION_ID                 optional: looked up from the repo if unset
 *   TURNSTILE_SECRET_KEY                       real Turnstile secret, or instead:
 *   TURNSTILE_TEST_MODE=pass|fail              use Cloudflare's public test secret
 *   WEBFORM_HOURLY_CAP                         optional: max web-form issues per hour (20)
 */
import { createSign } from 'node:crypto';

const GITHUB_API = 'https://api.github.com';
const env = (name: string) => process.env[name]?.trim() || undefined;

// ---------- Turnstile ----------

/** Cloudflare's documented test secrets: one always passes, one always fails. */
export const TURNSTILE_TEST_SECRETS = {
  pass: '1x0000000000000000000000000000000AA',
  fail: '2x0000000000000000000000000000000AA',
} as const;

export function turnstileSecret(): string | undefined {
  const mode = env('TURNSTILE_TEST_MODE');
  if (mode === 'pass') return TURNSTILE_TEST_SECRETS.pass;
  if (mode === 'fail') return TURNSTILE_TEST_SECRETS.fail;
  return env('TURNSTILE_SECRET_KEY');
}

export async function verifyTurnstile(token: string, ip: string | undefined) {
  const secret = turnstileSecret();
  if (!secret) throw new ConfigError('Turnstile is not configured');
  if (!token) return false;
  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Turnstile siteverify HTTP ${res.status}`);
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

// ---------- GitHub App auth ----------

export class ConfigError extends Error {}

const b64url = (v: string | Buffer) => Buffer.from(v).toString('base64url');

/** A short-lived JWT that authenticates as the GitHub App itself (RS256). */
export function appJwt(appId: string, privateKey: string, now = Math.floor(Date.now() / 1000)) {
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  return `${header}.${payload}.${signer.sign(privateKey).toString('base64url')}`;
}

const gh = async (path: string, token: string, init: RequestInit = {}) => {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'metacycle-resource-web-form',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${init.method ?? 'GET'} ${path} → HTTP ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
};

let cached: { token: string; expires: number } | undefined;

/** Installation token for the repo, cached until five minutes before it expires. */
export async function installationToken(repoSlug: string): Promise<string> {
  if (cached && cached.expires - 5 * 60_000 > Date.now()) return cached.token;
  const appId = env('GITHUB_APP_ID');
  // Vercel keeps real newlines; accept "\n"-escaped keys too.
  const key = env('GITHUB_APP_PRIVATE_KEY')?.replace(/\\n/g, '\n');
  if (!appId || !key) throw new ConfigError('GitHub App credentials are not configured');
  const jwt = appJwt(appId, key);
  const installation =
    env('GITHUB_APP_INSTALLATION_ID') ??
    String((await gh(`/repos/${repoSlug}/installation`, jwt)).id);
  const repo = repoSlug.split('/')[1];
  const data = await gh(`/app/installations/${installation}/access_tokens`, jwt, {
    method: 'POST',
    // Narrow the token to this repo and to issues only.
    body: JSON.stringify({ repositories: [repo], permissions: { issues: 'write' } }),
  });
  cached = { token: String(data.token), expires: Date.parse(String(data.expires_at)) };
  return cached.token;
}

export async function createIssue(
  repoSlug: string,
  issue: { title: string; body: string; labels: string[] },
) {
  const token = await installationToken(repoSlug);
  const data = await gh(`/repos/${repoSlug}/issues`, token, {
    method: 'POST',
    body: JSON.stringify(issue),
  });
  return { number: Number(data.number), url: String(data.html_url) };
}

// ---------- spam limits ----------

const PER_IP = { max: 5, windowMs: 10 * 60_000 };
const hits = new Map<string, number[]>();

/**
 * Best-effort per-IP limit. It lives in one function instance's memory, so it slows a
 * single abuser down but isn't global; the hourly cap below is the global backstop.
 */
export function ipAllowed(ip: string | undefined, now = Date.now()) {
  if (!ip) return true;
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < PER_IP.windowMs);
  if (recent.length >= PER_IP.max) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return true;
}

/** Global cap: counts web-form issues created in the last hour (state any). */
export async function underHourlyCap(repoSlug: string, now = Date.now()) {
  const cap = Number(env('WEBFORM_HOURLY_CAP') ?? 20);
  const since = new Date(now - 60 * 60_000).toISOString();
  const token = await installationToken(repoSlug);
  const res = await fetch(
    `${GITHUB_API}/repos/${repoSlug}/issues?labels=web-form&state=all&per_page=100&since=${since}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'metacycle-resource-web-form',
      },
    },
  );
  if (!res.ok) throw new Error(`GitHub issue count HTTP ${res.status}`);
  const issues = (await res.json()) as { created_at: string }[];
  return issues.filter((i) => Date.parse(i.created_at) > now - 60 * 60_000).length < cap;
}

/** Test hook: forget cached tokens and per-IP hits. */
export function _reset() {
  cached = undefined;
  hits.clear();
}

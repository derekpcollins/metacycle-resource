/**
 * POST /api/contribute: the no-account web form (docs/SPEC.md → "Contribution flows").
 * Verifies Cloudflare Turnstile, validates the fields, and files a labeled GitHub issue as
 * the site's GitHub App. The rest of the site stays static; this is its only function.
 *
 * Two response modes:
 *   - Accept: application/json (the form's script): JSON, so the page can show errors
 *     inline without losing what was typed.
 *   - anything else (plain HTML form POST): a 303 redirect to /contribute/thanks or back
 *     to /contribute/form with an error code.
 */
import { validate, labelsFor, issueTitle, issueBody } from '../src/lib/contribution.js';
import { repoSlug } from '../src/site.config.js';
import {
  ConfigError,
  createIssue,
  ipAllowed,
  underHourlyCap,
  verifyTurnstile,
} from './_lib/server.js';

const MAX_BYTES = 32 * 1024;
/** Fields copied back into the form URL after a no-JS error (short ones only). */
const KEEP = ['type', 'part', 'system', 'page', 'vendor', 'url'];

type Failure = 'invalid' | 'turnstile' | 'rate' | 'unavailable' | 'too-large' | 'origin';
const STATUS: Record<Failure, number> = {
  invalid: 400,
  origin: 403,
  turnstile: 403,
  'too-large': 413,
  rate: 429,
  unavailable: 503,
};

export async function POST(request: Request): Promise<Response> {
  const json = (request.headers.get('accept') ?? '').includes('application/json');
  const url = new URL(request.url);
  const ip =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    undefined;
  let fields: Record<string, string> = {};

  const fail = (reason: Failure, errors?: Record<string, string>) => {
    if (json) return Response.json({ ok: false, reason, errors }, { status: STATUS[reason] });
    const q = new URLSearchParams({ error: reason });
    for (const k of KEEP) if (fields[k] && fields[k].length <= 500) q.set(k, fields[k]);
    return redirect(`/contribute/form?${q}#form-status`);
  };

  // Same-origin only: a browser always sends Origin on a cross-site POST.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== url.host) return fail('origin');

  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BYTES) return fail('too-large');
  try {
    const text = await request.text();
    if (text.length > MAX_BYTES) return fail('too-large');
    const type = request.headers.get('content-type') ?? '';
    fields = type.includes('application/json')
      ? (JSON.parse(text) as Record<string, string>)
      : Object.fromEntries(new URLSearchParams(text));
  } catch {
    return fail('invalid', { form: 'The form data could not be read.' });
  }

  // Honeypot: a hidden field people never fill in. Pretend it worked; file nothing.
  if (fields.website) return json ? Response.json({ ok: true }) : redirect('/contribute/thanks');

  const result = validate(fields);
  if (!result.ok) return fail('invalid', result.errors);

  try {
    if (!ipAllowed(ip)) return fail('rate');
    if (!(await verifyTurnstile(fields['cf-turnstile-response'] ?? '', ip)))
      return fail('turnstile');
    if (!(await underHourlyCap(repoSlug))) return fail('rate');
    const issue = await createIssue(repoSlug, {
      title: issueTitle(result.submission),
      body: issueBody(result.submission, { origin: url.origin }),
      labels: [...labelsFor(result.submission), 'web-form'],
    });
    if (json) return Response.json({ ok: true, issue });
    return redirect(`/contribute/thanks?n=${issue.number}`);
  } catch (err) {
    // Log the cause for Vercel's runtime logs; never echo it (or any secret) to the client.
    console.error(err instanceof ConfigError ? `config: ${err.message}` : err);
    return fail('unavailable');
  }
}

/** A GET (e.g. someone opening the URL) goes back to the form. */
export function GET(): Response {
  return redirect('/contribute/form');
}

function redirect(location: string) {
  return new Response(null, { status: 303, headers: { Location: location } });
}

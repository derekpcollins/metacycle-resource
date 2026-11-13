import type { APIRoute } from 'astro';
import { validateContent } from '../lib/validate';

// Prerendered on every build: throws (failing the build) if any cross-reference is broken.
export const GET: APIRoute = async () => {
  const report = await validateContent();
  return new Response(JSON.stringify(report, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};

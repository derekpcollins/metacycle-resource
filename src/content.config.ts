/**
 * Content collection schemas — implements the data models in docs/SPEC.md.
 *
 * Note: the spec's repo tree lists `src/content/config.ts`; current Astro requires the
 * schemas at `src/content.config.ts`, so they live here. The content folders are unchanged.
 *
 * All objects are strict: an unknown or misspelled field fails the build instead of being
 * silently dropped. Cross-references (vendor, tool, part, guide ids) are typed with
 * `reference()` and hard-checked by src/lib/validate.ts during the build.
 */
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  CONFIDENCE,
  DIFFICULTIES,
  FAILURE_RATES,
  FITS,
  GUIDE_TYPES,
  SOURCE_STATUSES,
  SOURCE_TYPES,
  SYSTEMS,
  TOOL_CATEGORIES,
  YES_NO_UNKNOWN,
  keys,
} from './lib/enums';

// ---------- shared field types ----------

/** Unknown values are written as the literal string TODO, never guessed. */
const TODO = z.literal('TODO');
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase-kebab-case, e.g. "rear-shock"');
const url = z.url({ protocol: /^https?$/ });
const urlOrTodo = z.union([TODO, url]);
const dateOrTodo = z.union([TODO, z.coerce.date()]);
const system = z.enum(keys(SYSTEMS));
const difficulty = z.union(DIFFICULTIES.map((d) => z.literal(d)));

/** YAML entries carry their own `id`; MDX entries use the file name. */
const generateId = ({ entry, data }: { entry: string; data: Record<string, unknown> }) =>
  typeof data.id === 'string' ? data.id : entry.replace(/\.(ya?ml|mdx?)$/, '');

// ---------- vendors ----------

const vendors = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/vendors', generateId }),
  schema: z.strictObject({
    id: slug,
    name: z.string().min(1),
    url: urlOrTodo,
    country: z.string().optional(),
    ships_to_us: z.enum(keys(YES_NO_UNKNOWN)).default('unknown'),
    us_warehouse: z.enum(keys(YES_NO_UNKNOWN)).default('unknown'),
    languages: z.array(z.string()).default([]),
    buying_tips: z.string().optional(),
    references: z.array(url).default([]),
  }),
});

// ---------- parts ----------

const price = z.strictObject({
  amount: z.union([TODO, z.number().nonnegative()]),
  currency: z.string().regex(/^[A-Z]{3}$/, 'ISO 4217 code, e.g. USD'),
});

const source = z.strictObject({
  vendor: reference('vendors'),
  url: urlOrTodo,
  type: z.enum(keys(SOURCE_TYPES)),
  fit: z.enum(keys(FITS)),
  price: price.optional(),
  last_verified: dateOrTodo,
  status: z.enum(keys(SOURCE_STATUSES)),
  notes: z.string().optional(),
});

const parts = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/parts', generateId }),
  schema: z
    .strictObject({
      id: slug,
      name: z.string().min(1),
      system,
      aliases: z.array(z.string()).default([]),
      oem_part_number: z.string().optional(),
      specs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
      failure_rate: z.enum(keys(FAILURE_RATES)).optional(),
      difficulty: difficulty.optional(),
      // Required by the spec; may be empty while no buy option is known yet.
      sources: z.array(source),
      fits_notes: z.string().optional(),
      related_guides: z.array(reference('guides')).default([]),
      references: z.array(url).min(1, 'Every part needs at least one reference link'),
      diagram_ref: z.string().optional(),
      // Optional photo (Phase 3 decision, docs/PHASES.md). A site path under /public
      // (e.g. /images/parts/rear-shock.jpg) or an https URL. Alt text is required with a
      // photo; credit names the photographer/source so licensing stays traceable.
      photo: z
        .union([z.string().regex(/^\/[^\s]+$/, 'Use a site path like /images/parts/x.jpg'), url])
        .optional(),
      photo_alt: z.string().min(1).optional(),
      photo_credit: z.string().min(1).optional(),
    })
    .refine((p) => !p.photo || p.photo_alt, {
      message: 'photo_alt is required when photo is set',
      path: ['photo_alt'],
    }),
});

// ---------- tools ----------

const tools = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/tools', generateId }),
  // `used_in` is intentionally absent: it's derived from guides and must never be typed.
  schema: z.strictObject({
    id: slug,
    name: z.string().min(1),
    spec: z.string().min(1),
    category: z.enum(keys(TOOL_CATEGORIES)),
    essential: z.boolean().default(false),
    buy_links: z
      .array(
        z.strictObject({
          vendor: z.string().min(1),
          url: urlOrTodo,
          affiliate: z.boolean().default(false),
        }),
      )
      .default([]),
  }),
});

// ---------- guides ----------

const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides', generateId }),
  schema: z.strictObject({
    title: z.string().min(1),
    summary: z.string().min(1),
    type: z.enum(keys(GUIDE_TYPES)),
    system,
    difficulty,
    time_minutes: z.union([TODO, z.number().int().positive()]),
    tools: z.array(reference('tools')).default([]),
    parts: z.array(reference('parts')).default([]),
    safety: z.array(z.string()).default([]),
    confidence: z.enum(keys(CONFIDENCE)),
    verified_by: z.string().optional(),
    last_verified: dateOrTodo.optional(),
    sources: z.array(url).min(1, 'Every guide needs at least one source link'),
  }),
});

// ---------- troubleshooting ----------

const check = z.strictObject({
  step: z.string().min(1),
  pass: z.string().min(1),
  fail: z.string().min(1),
});

const fix = z
  .strictObject({
    guide: reference('guides').optional(),
    part: reference('parts').optional(),
    note: z.string().optional(),
  })
  .refine((f) => f.guide || f.part || f.note, 'fix needs a guide, a part, or a note');

const troubleshooting = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/troubleshooting', generateId }),
  schema: z.strictObject({
    symptom: z.string().min(1),
    system,
    likely_causes: z.array(z.string()).min(1),
    checks: z.array(check).default([]),
    fix: z.array(fix).default([]),
    confidence: z.enum(keys(CONFIDENCE)),
    sources: z.array(url).min(1, 'Every entry needs at least one source link'),
  }),
});

export const collections = { vendors, parts, tools, guides, troubleshooting };

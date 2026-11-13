/**
 * Contribution flows (docs/SPEC.md → "Contribution flows"): the single definition of the
 * four contribution types and their fields. Used by
 *   - scripts/sync-issue-forms.ts → .github/ISSUE_TEMPLATE/*.yml (GitHub issue forms)
 *   - src/pages/contribute/form.astro (the no-account web form)
 *   - api/contribute.ts (validates the web form and files the GitHub issue)
 * so the GitHub forms and the web form ask the same questions and produce issues in the
 * same format ("### Label" sections, as GitHub's issue forms do).
 *
 * Plain TypeScript with no Astro imports: it also runs in the Vercel function and in tsx.
 */
import { SYSTEMS } from './enums.js';
import { PART_OPTIONS } from '../data/part-options.js';
import { site } from '../site.config.js';

// ---------- types and labels ----------

export const CONTRIBUTION_TYPES = {
  'broken-link': {
    label: 'Report a broken link',
    short: 'Broken link',
    blurb: 'A buy link is dead, out of stock, the wrong item, or the price changed.',
    template: 'broken-link.yml',
  },
  suggest: {
    label: 'Suggest a part or vendor',
    short: 'Suggestion',
    blurb: 'A part we’re missing, or a store that sells Metacycle parts.',
    template: 'suggest.yml',
  },
  fix: {
    label: 'Share a fix',
    short: 'Fix',
    blurb: 'Something you did that solved a problem, or a step that worked for you.',
    template: 'fix.yml',
  },
  'spec-correction': {
    label: 'Correct a spec',
    short: 'Correction',
    blurb: 'Something on a page is wrong or out of date: a spec, a step, a part number.',
    template: 'spec-correction.yml',
  },
} as const;

export type ContributionType = keyof typeof CONTRIBUTION_TYPES;
export const isContributionType = (v: unknown): v is ContributionType =>
  typeof v === 'string' && Object.prototype.hasOwnProperty.call(CONTRIBUTION_TYPES, v);

/**
 * Repo labels used by the issue forms, the label workflow and the web-form function.
 * `npm run labels:sync` creates or updates them on GitHub (needs the gh CLI).
 */
export const LABELS = {
  'broken-link': { color: 'b60205', description: 'A buy link is dead, out of stock or wrong' },
  'new-part': { color: '0e8a16', description: 'Suggests a part that isn’t on the site' },
  'new-vendor': { color: '5319e7', description: 'Suggests a vendor — check for scams first' },
  fix: { color: '1d76db', description: 'Shares a fix or a guide step' },
  'spec-correction': { color: 'fbca04', description: 'Something on a page is wrong' },
  'needs-source': { color: 'd93f0b', description: 'No source link or photo yet' },
  'community-reported': {
    color: 'c5def5',
    description: 'Published without a source, as community-reported',
  },
  'web-form': { color: 'ededed', description: 'Filed through the site’s no-account form' },
} as const;
export type Label = keyof typeof LABELS;

/** Labels a type always gets. `suggest` gets new-part or new-vendor from its answer. */
export const TYPE_LABELS: Record<ContributionType, Label[]> = {
  'broken-link': ['broken-link'],
  suggest: [],
  fix: ['fix'],
  'spec-correction': ['spec-correction'],
};

// ---------- dropdown options ----------

export const PART_NONE = 'Not about one part';
export const PART_UNLISTED = 'A part that isn’t listed';
/** Dropdown text for a part. Contains the id so issues stay unambiguous after renames. */
export const partOption = (p: { id: string; name: string }) => `${p.name} · ${p.id}`;
/** Part id from a dropdown answer, or undefined for the two non-part options. */
export const partIdOf = (option: string) => option.match(/ · ([a-z0-9-]+)$/)?.[1];
export const partOptions = () => [PART_NONE, PART_UNLISTED, ...PART_OPTIONS.map(partOption)];

export const SYSTEM_UNSURE = 'Not sure';
export const systemOptions = (): string[] => [
  SYSTEM_UNSURE,
  ...Object.keys(SYSTEMS).map((k) => SYSTEMS[k as keyof typeof SYSTEMS]),
];

export const SUGGEST_KINDS = { part: 'A part', vendor: 'A vendor (a store that sells parts)' };
export const LINK_PROBLEMS = [
  'The page is gone',
  'Out of stock',
  'Wrong item',
  'The price changed',
  'Something else',
];

// ---------- fields ----------

type Base = {
  id: string;
  label: string;
  description?: string;
  /** Types that show this field, in this order of appearance. */
  types: readonly ContributionType[];
  /** Required on these types (defaults to none). */
  requiredFor?: readonly ContributionType[];
  /** Web form only (issue forms take credit from the GitHub account). */
  webOnly?: boolean;
  /** Per-type label overrides. */
  labelFor?: Partial<Record<ContributionType, string>>;
  descriptionFor?: Partial<Record<ContributionType, string>>;
};
export type Field =
  | (Base & { kind: 'dropdown'; options: () => string[] })
  | (Base & { kind: 'input'; maxLength: number; inputType?: 'url' | 'text'; placeholder?: string })
  | (Base & { kind: 'textarea'; maxLength: number; placeholder?: string })
  | (Base & { kind: 'checkbox'; text: string });

const ALL = ['broken-link', 'suggest', 'fix', 'spec-correction'] as const;

export const FIELDS: Field[] = [
  {
    id: 'kind',
    kind: 'dropdown',
    label: 'What are you suggesting?',
    options: (): string[] => [SUGGEST_KINDS.part, SUGGEST_KINDS.vendor],
    types: ['suggest'],
    requiredFor: ['suggest'],
  },
  {
    id: 'part',
    kind: 'dropdown',
    label: 'Which part?',
    description: 'Pick the closest match.',
    options: partOptions,
    types: ALL,
    requiredFor: ['broken-link'],
  },
  {
    id: 'system',
    kind: 'dropdown',
    label: 'Which system?',
    options: systemOptions,
    types: ALL,
  },
  {
    id: 'vendor',
    kind: 'input',
    label: 'Store or vendor',
    labelFor: { suggest: 'Store or vendor name' },
    maxLength: 120,
    types: ['broken-link', 'suggest'],
  },
  {
    id: 'url',
    kind: 'input',
    inputType: 'url',
    label: 'The broken link',
    labelFor: { suggest: 'Link to the part or store' },
    maxLength: 500,
    placeholder: 'https://',
    types: ['broken-link', 'suggest'],
    requiredFor: ['broken-link'],
  },
  {
    id: 'problem',
    kind: 'dropdown',
    label: 'What’s wrong with it?',
    options: () => LINK_PROBLEMS,
    types: ['broken-link'],
    requiredFor: ['broken-link'],
  },
  {
    id: 'replacement',
    kind: 'input',
    label: 'Working link or new price, if you have one',
    maxLength: 500,
    types: ['broken-link'],
  },
  {
    id: 'page',
    kind: 'input',
    label: 'Page on this site',
    description: 'The page this is about, if any.',
    maxLength: 300,
    types: ALL,
  },
  {
    id: 'summary',
    kind: 'input',
    label: 'Summary',
    description: 'One line. This becomes the title.',
    maxLength: 120,
    types: ALL,
    requiredFor: ALL,
  },
  {
    id: 'details',
    kind: 'textarea',
    label: 'Details',
    labelFor: {
      'broken-link': 'Anything else?',
      suggest: 'Tell us about it',
      fix: 'The fix',
      'spec-correction': 'What’s wrong, and what’s right?',
    },
    descriptionFor: {
      suggest: 'What it is, what it fits, price, part numbers, anything you had to modify.',
      fix: 'The symptom, what you did step by step, and what tools or parts it took.',
      'spec-correction': 'Quote what the page says now and what it should say.',
    },
    maxLength: 5000,
    types: ALL,
    requiredFor: ['suggest', 'fix', 'spec-correction'],
  },
  {
    id: 'source',
    kind: 'textarea',
    label: 'Source or photo',
    description:
      'A link to a manual, listing, video or forum post, or a photo of the part or label. Without one, a change is published as “community-reported.”',
    maxLength: 1000,
    types: ALL,
  },
  {
    id: 'disclosure',
    kind: 'checkbox',
    label: 'Disclosure',
    text: 'I sell this, or I work for this store or vendor.',
    types: ['broken-link', 'suggest'],
  },
  {
    id: 'credit',
    kind: 'input',
    label: 'Name or handle for credit',
    description: 'Optional. Shown on the page you improve and in the changelog.',
    maxLength: 60,
    types: ALL,
    webOnly: true,
  },
  {
    id: 'license',
    kind: 'checkbox',
    label: 'License',
    text: `I agree my contribution is published under ${site.license.content.name}.`,
    types: ALL,
    requiredFor: ALL,
  },
];

export const fieldsFor = (type: ContributionType, { web = false } = {}) =>
  FIELDS.filter((f) => f.types.includes(type) && (web || !f.webOnly));
export const labelOf = (f: Field, type: ContributionType) => f.labelFor?.[type] ?? f.label;
export const descriptionOf = (f: Field, type: ContributionType) =>
  f.descriptionFor?.[type] ?? f.description;
export const isRequired = (f: Field, type: ContributionType) =>
  f.requiredFor?.includes(type) ?? false;

// ---------- validation (server side; the web form mirrors it in HTML attributes) ----------

export type Submission = { type: ContributionType; values: Record<string, string> };
export type ValidationResult =
  { ok: true; submission: Submission } | { ok: false; errors: Record<string, string> };

// C0/C1 control characters except tab, newline and carriage return.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const clean = (v: unknown) =>
  typeof v === 'string' ? v.replace(CONTROL, '').replace(/\r\n?/g, '\n').trim() : '';
const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
};

/** Validates raw form input. Unknown fields are ignored; values are trimmed and capped. */
export function validate(input: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};
  const type = input.type;
  if (!isContributionType(type)) return { ok: false, errors: { type: 'Choose what this is.' } };
  const values: Record<string, string> = {};
  for (const f of fieldsFor(type, { web: true })) {
    const raw = clean(input[f.id]);
    const label = labelOf(f, type);
    if (f.kind === 'checkbox') {
      const on = raw === 'on' || raw === 'true' || raw === 'yes';
      if (isRequired(f, type) && !on) errors[f.id] = 'Tick this box to continue.';
      values[f.id] = on ? 'yes' : '';
      continue;
    }
    if (!raw) {
      if (isRequired(f, type)) errors[f.id] = `${label} is required.`;
      values[f.id] = '';
      continue;
    }
    if (f.kind === 'dropdown') {
      if (!f.options().includes(raw)) errors[f.id] = `Choose one of the options for “${label}”.`;
    } else if (raw.length > f.maxLength) {
      errors[f.id] = `${label} is too long (max ${f.maxLength} characters).`;
    } else if (f.kind === 'input' && f.inputType === 'url' && !isHttpUrl(raw)) {
      errors[f.id] = 'Enter a full link starting with https://';
    } else if (f.id === 'summary' && raw.length < 5) {
      errors[f.id] = 'Summary is too short.';
    }
    values[f.id] = raw;
  }
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, submission: { type, values } };
}

// ---------- issue output ----------

/** Labels for a filed issue (the GitHub label workflow applies the same rules). */
export function labelsFor({ type, values }: Submission): Label[] {
  const labels = [...TYPE_LABELS[type]];
  if (type === 'suggest')
    labels.push(values.kind === SUGGEST_KINDS.vendor ? 'new-vendor' : 'new-part');
  if (type !== 'broken-link' && !values.source) labels.push('needs-source');
  return labels;
}

/** Stops @mentions and #refs in user text from pinging people or linking issues. */
const defang = (v: string) => v.replace(/@(?=\w)/g, '@​').replace(/#(?=\d)/g, '#​');

export function issueTitle({ type, values }: Submission) {
  const part =
    values.part && values.part !== PART_NONE
      ? ` · ${values.part.replace(/ · [a-z0-9-]+$/, '')}`
      : '';
  return `[${CONTRIBUTION_TYPES[type].short}${part}] ${defang(values.summary)}`.slice(0, 200);
}

/** Markdown body in GitHub's issue-form format: "### Label" then the answer. */
export function issueBody({ type, values }: Submission, { origin }: { origin: string }) {
  const out: string[] = [];
  for (const f of fieldsFor(type, { web: true })) {
    if (f.id === 'credit' || f.id === 'summary') continue;
    const v = values[f.id];
    out.push(`### ${labelOf(f, type)}`, '');
    if (f.kind === 'checkbox') out.push(`- [${v ? 'X' : ' '}] ${f.text}`);
    else if (f.id === 'page' && v.startsWith('/')) out.push(`${origin}${defang(v)}`);
    else out.push(v ? defang(v) : '_No response_');
    out.push('');
  }
  const credit = values.credit ? defang(values.credit) : 'anonymous';
  out.push('---', '', `Filed through the site’s web form. Credit: **${credit}**.`);
  return out.join('\n');
}

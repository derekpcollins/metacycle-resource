/**
 * Enum values from docs/SPEC.md. Stored values are slugs; labels are for display.
 * Keep these in sync with the spec — changing a value is a content migration.
 */

export const SYSTEMS = {
  powertrain: 'Powertrain',
  'battery-charging': 'Battery & charging',
  electrical: 'Electrical',
  brakes: 'Brakes',
  suspension: 'Suspension',
  'wheels-tires': 'Wheels & tires',
  'controls-display': 'Controls & display',
  'body-frame': 'Body & frame',
  security: 'Security',
} as const;

export const FAILURE_RATES = {
  common: 'Common',
  occasional: 'Occasional',
  rare: 'Rare',
  unknown: 'Unknown',
} as const;

/** 1–5 wrench scale. */
export const DIFFICULTIES = [1, 2, 3, 4, 5] as const;

export const SOURCE_TYPES = {
  OEM: 'OEM',
  'OEM-equivalent': 'OEM-equivalent',
  aftermarket: 'Aftermarket',
  salvage: 'Salvage',
  'rebuild-service': 'Rebuild service',
} as const;

export const FITS = {
  exact: 'Exact',
  'minor-mod': 'Minor mod',
  adapt: 'Adapt',
} as const;

export const SOURCE_STATUSES = {
  live: 'Live',
  'out-of-stock': 'Out of stock',
  dead: 'Dead',
  unverified: 'Unverified',
} as const;

export const TOOL_CATEGORIES = {
  'hand-tool': 'Hand tool',
  electrical: 'Electrical',
  diagnostic: 'Diagnostic',
  lifting: 'Lifting',
  consumable: 'Consumable',
} as const;

export const GUIDE_TYPES = {
  'how-to': 'How-to',
  reference: 'Reference',
  maintenance: 'Maintenance',
  mod: 'Mod',
} as const;

export const CONFIDENCE = {
  confirmed: 'Confirmed',
  'community-reported': 'Community-reported',
  theory: 'Theory',
} as const;

/** Vendor tri-state for facts we often can't confirm. Not in the spec's field list; see docs/PHASES.md. */
export const YES_NO_UNKNOWN = {
  yes: 'Yes',
  no: 'No',
  'some-items': 'Some items',
  unknown: 'Unknown',
} as const;

export const keys = <T extends Record<string, string>>(o: T) =>
  Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

/**
 * Display helpers shared by components and pages. Pure functions only.
 */
import type { CollectionEntry } from 'astro:content';
import { SOURCE_STATUSES } from './enums';
import { isStale } from './content';

type Source = CollectionEntry<'parts'>['data']['sources'][number];
type Status = keyof typeof SOURCE_STATUSES;

/** Unit suffixes allowed at the end of a spec key, e.g. `eye_to_eye_mm`. */
const UNITS: Record<string, string> = {
  mm: 'mm',
  cm: 'cm',
  m: 'm',
  in: 'in',
  v: 'V',
  vac: 'VAC',
  vdc: 'VDC',
  a: 'A',
  ah: 'Ah',
  w: 'W',
  kw: 'kW',
  kwh: 'kWh',
  nm: 'N·m',
  kg: 'kg',
  lb: 'lb',
  psi: 'psi',
  mph: 'mph',
  kmh: 'km/h',
  c: '°C',
};

/** `eye_to_eye_mm: 310` → { label: 'eye to eye', value: '310 mm' }. */
export function formatSpec(key: string, value: string | number | boolean) {
  const parts = key.split('_');
  const last = parts.at(-1)?.toLowerCase() ?? '';
  const unit = parts.length > 1 ? UNITS[last] : undefined;
  const label = (unit ? parts.slice(0, -1) : parts).join(' ');
  const raw = typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value);
  return { label, value: unit ? `${raw} ${unit}` : raw };
}

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Tone for a buy-option status badge. */
export const statusTone = (s: Status) =>
  ({ live: 'ok', 'out-of-stock': 'warn', dead: 'bad', unverified: 'off' })[s] as
    'ok' | 'warn' | 'bad' | 'off';

/** Most recent human-verified date across a part's sources, if any. */
export function latestVerified(sources: Source[]): Date | undefined {
  const dates = sources
    .map((s) => s.last_verified)
    .filter((d): d is Date => d instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime());
  return dates[0];
}

/** Best status across sources: live > out-of-stock > unverified > dead. */
export function bestStatus(sources: Source[]): Status | undefined {
  const order: Status[] = ['live', 'out-of-stock', 'unverified', 'dead'];
  return order.find((st) => sources.some((s) => s.status === st));
}

export const sourceIsStale = (s: Source) => isStale(s.last_verified);

export function formatPrice(price: Source['price']) {
  if (!price || price.amount === 'TODO') return undefined;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency }).format(
      price.amount,
    );
  } catch {
    return `${price.amount} ${price.currency}`;
  }
}

export const lower = (s: string) => s.toLowerCase();

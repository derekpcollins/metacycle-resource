/**
 * Reads the YAML content files directly (no Astro), for scripts that run under tsx:
 * the verification checklist, the link checker and the changelog. Shapes mirror the
 * schemas in src/content.config.ts, but only the fields scripts need are typed.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export const ROOT = new URL('../..', import.meta.url).pathname;

export interface SourceData {
  vendor: string;
  url: string;
  type: string;
  fit: string;
  price?: { amount: number | 'TODO'; currency: string };
  last_verified: Date | string;
  status: string;
  notes?: string;
}
export interface PartData {
  id: string;
  name: string;
  system: string;
  sources?: SourceData[];
}
export interface VendorData {
  id: string;
  name: string;
  url: string;
  ships_to_us?: string;
  us_warehouse?: string;
}
export interface FileEntry<T> {
  /** Repo-relative path, e.g. src/content/parts/rear-shock.yaml */
  file: string;
  data: T;
}

export function loadYamlDir<T>(dir: string): FileEntry<T>[] {
  return readdirSync(join(ROOT, dir))
    .filter((f) => /\.ya?ml$/.test(f))
    .sort()
    .map((f) => ({
      file: `${dir}/${f}`,
      data: parse(readFileSync(join(ROOT, dir, f), 'utf8')) as T,
    }));
}

export const loadParts = () => loadYamlDir<PartData>('src/content/parts');
export const loadVendors = () => loadYamlDir<VendorData>('src/content/vendors');

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Indian digit grouping: ₹12,45,000 */
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const numFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export function formatInr(value: number): string {
  return inrFormatter.format(Math.round(value));
}

export function formatNumber(value: number): string {
  return numFormatter.format(value);
}

/** ₹9.4 L / ₹1.2 Cr style compact Indian notation */
export function formatInrCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_00_00_000) return `₹${trim(value / 1_00_00_000)} Cr`;
  if (abs >= 1_00_000) return `₹${trim(value / 1_00_000)} L`;
  if (abs >= 1_000) return `₹${trim(value / 1_000)}k`;
  return formatInr(value);
}

function trim(n: number): string {
  const s = n.toFixed(n >= 10 ? 0 : 1);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}

export function formatRange(low: number, high: number, compact = false): string {
  const f = compact ? formatInrCompact : formatInr;
  return `${f(low)} – ${f(high)}`;
}

export function formatSqft(n: number): string {
  return `${formatNumber(n)} sq ft`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function uid(prefix = ''): string {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${id}` : id;
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`);
}

export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function prefersReducedMotion(): boolean {
  return isBrowser() && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isSlowConnection(): boolean {
  if (!isBrowser()) return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const c = nav.connection;
  if (!c) return false;
  if (c.saveData) return true;
  return c.effectiveType !== undefined && c.effectiveType !== '4g';
}

export function readTime(words: number): number {
  return Math.max(1, Math.round(words / 220));
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function groupBy<T, K extends string | number>(arr: T[], key: (t: T) => K): Record<K, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = key(item);
      (acc[k] ??= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

export function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Strip control characters and cap length — used before embedding user text in URLs. */
export function sanitiseForUrl(text: string, max = 600): string {
  return text
    // eslint-disable-next-line no-control-regex -- intentionally stripping control chars
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

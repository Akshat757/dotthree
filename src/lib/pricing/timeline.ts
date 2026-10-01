import type { Bhk, PriceBook } from '@/types/content';

export interface TimelineArgs {
  bhk: Bhk;
  commercial: boolean;
  renovation: boolean;
  /** Selected-scope weight ÷ full-home weight (1 = full home). */
  scopeRatio: number;
}

const MIN_WEEKS = 3;

/**
 * Timeline range in weeks: price-book band for the BHK (or commercial),
 * scaled for partial scope (never below MIN_WEEKS) and +20% for renovation
 * (demolition + making-good).
 */
export function timelineFor(pb: PriceBook, a: TimelineArgs): [number, number] {
  const band = (a.commercial
    ? pb.rates.timelineWeeks.COMMERCIAL
    : pb.rates.timelineWeeks[a.bhk]) ?? [8, 12];
  const scope = Math.min(1.25, Math.max(0.35, a.scopeRatio));
  const reno = a.renovation ? 1.2 : 1;
  const lo = Math.max(MIN_WEEKS, Math.round(band[0] * scope * reno));
  const hi = Math.max(lo + 1, Math.round(band[1] * scope * reno));
  return [lo, hi];
}

export function formatWeeks([lo, hi]: [number, number]): string {
  return lo === hi ? `${lo} weeks` : `${lo}–${hi} weeks`;
}

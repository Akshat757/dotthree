'use client';

import Link from 'next/link';
import * as React from 'react';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/form-controls';
import { Chip } from '@/components/ui/display';
import { quickEstimate, TYPICAL_CARPET_SQFT, formatWeeks } from '@/lib/pricing';
import { formatInrCompact, formatNumber } from '@/lib/utils';
import type { Bhk, Tier } from '@/types/content';

const BHKS: Bhk[] = ['1BHK', '2BHK', '3BHK', '4BHK+'];
const TIERS: { value: Tier; label: string }[] = [
  { value: 'ESSENTIAL', label: 'Essential' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'LUXURY', label: 'Luxury' },
];

/** Homepage "ballpark in 10 seconds" widget. Deep-links to the full estimator with prefill. */
export function MiniEstimator({ className }: { className?: string }) {
  const [bhk, setBhk] = React.useState<Bhk>('2BHK');
  const [tier, setTier] = React.useState<Tier>('STANDARD');
  const [area, setArea] = React.useState<number>(TYPICAL_CARPET_SQFT['2BHK']);

  const result = React.useMemo(
    () => quickEstimate({ bhk, tier, carpetAreaSqft: area }),
    [bhk, tier, area],
  );
  const href = `/estimate/?bhk=${encodeURIComponent(bhk)}&tier=${tier}&sqft=${area}`;

  return (
    <div className={className}>
      <fieldset className="grid gap-2">
        <legend className="text-body-s font-medium text-ink">Home size</legend>
        <div className="flex flex-wrap gap-2">
          {BHKS.map((b) => (
            <Chip
              key={b}
              size="sm"
              selected={bhk === b}
              onClick={() => {
                setBhk(b);
                setArea(TYPICAL_CARPET_SQFT[b]);
              }}
            >
              {b}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="mini-area" className="text-body-s font-medium text-ink">
            Carpet area
          </label>
          <span className="tabular text-body-s text-ink-muted">{formatNumber(area)} sq ft</span>
        </div>
        <Slider
          id="mini-area"
          thumbLabels={['Carpet area in square feet']}
          min={350}
          max={4000}
          step={50}
          value={[area]}
          onValueChange={([v]) => v !== undefined && setArea(v)}
          formatValue={(v) => `${formatNumber(v)} sq ft`}
        />
      </div>

      <fieldset className="mt-5 grid gap-2">
        <legend className="text-body-s font-medium text-ink">Finish tier</legend>
        <div className="flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <Chip
              key={t.value}
              size="sm"
              selected={tier === t.value}
              onClick={() => setTier(t.value)}
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 rounded-lg bg-surface-sunk p-4" aria-live="polite">
        <p className="overline">Ballpark, incl. GST</p>
        <p className="tabular mt-1 font-display text-h1 text-ink">
          {formatInrCompact(result.total.low)} – {formatInrCompact(result.total.high)}
        </p>
        <p className="mt-1 text-body-s text-ink-muted">
          About {formatWeeks(result.timelineWeeks)} · EMI from{' '}
          <span className="tabular font-medium text-ink">
            {formatInrCompact(result.emi[2]?.low ?? 0)}/mo
          </span>{' '}
          over 36 months
        </p>
      </div>

      <Button asChild className="mt-4" fullWidth>
        <Link href={href}>
          Refine room by room <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
      <p className="mt-2 text-center text-caption text-ink-subtle">
        Based on our Indore price book 2026.09. A full-home scope; no commitment.
      </p>
    </div>
  );
}

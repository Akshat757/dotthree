'use client';

import { Check, Minus, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { roomLabel } from '@/components/cards';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, PriceRange } from '@/components/ui/display';
import { Img } from '@/components/ui/img';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { getMaterial } from '@/data/demo';
import { categoryLabel, surfaceLabel } from '@/lib/materials/labels';
import { titleCase } from '@/lib/utils';
import type { Material } from '@/types/content';

const MAX = 4;

export function MaterialsCompare() {
  const params = useSearchParams();
  const router = useRouter();
  const slugs = useMemo(
    () =>
      (params.get('items') ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, MAX),
    [params],
  );
  const items = slugs.map(getMaterial).filter((m): m is Material => Boolean(m));

  const remove = (slug: string) => {
    const next = slugs.filter((s) => s !== slug);
    router.replace(
      next.length ? `/materials/compare/?items=${next.join(',')}` : '/materials/compare/',
    );
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Plus className="size-6" aria-hidden />}
        title="Nothing to compare yet"
        description="Pick up to four finishes from the catalogue using the compare button on each card."
        action={
          <Button asChild>
            <Link href="/materials/">Browse materials</Link>
          </Button>
        }
      />
    );
  }

  const rows: { label: string; render: (m: Material) => React.ReactNode }[] = [
    { label: 'Brand', render: (m) => m.brand ?? '—' },
    { label: 'Category', render: (m) => categoryLabel(m.category) },
    { label: 'Tier', render: (m) => titleCase(m.tier) },
    {
      label: 'Indore price',
      render: (m) =>
        m.price ? (
          <PriceRange low={m.price.min} high={m.price.max} unit={m.price.unit} size="sm" />
        ) : (
          'On request'
        ),
    },
    { label: 'Finish', render: (m) => (m.finish ? titleCase(m.finish) : '—') },
    { label: 'Tonality', render: (m) => (m.tonality ? titleCase(m.tonality) : '—') },
    { label: 'Durability', render: (m) => <Dots n={m.durability ?? 0} /> },
    { label: 'Maintenance', render: (m) => (m.maintenance ? titleCase(m.maintenance) : '—') },
    { label: 'Water resistant', render: (m) => <YesNo v={m.waterResistant} /> },
    { label: 'Heat resistant', render: (m) => <YesNo v={m.heatResistant} /> },
    { label: 'Warranty', render: (m) => m.warranty ?? '—' },
    {
      label: 'Availability',
      render: (m) =>
        m.availability ? titleCase(m.availability.replace('_INDORE', ' (Indore)')) : '—',
    },
    {
      label: 'Surfaces',
      render: (m) => (
        <span className="flex flex-wrap gap-1">
          {m.usageSurfaces.map((s) => (
            <Badge key={s} tone="outline">
              {surfaceLabel(s)}
            </Badge>
          ))}
        </span>
      ),
    },
    {
      label: 'Rooms',
      render: (m) => (
        <span className="flex flex-wrap gap-1">
          {m.usageRooms.map((r) => (
            <Badge key={r} tone="outline">
              {roomLabel(r)}
            </Badge>
          ))}
        </span>
      ),
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-e1">
        <table className="w-full min-w-[640px] border-collapse text-body-s">
          <caption className="sr-only">Comparison of {items.map((m) => m.name).join(', ')}</caption>
          <thead>
            <tr className="align-top">
              <th
                scope="col"
                className="w-36 border-b border-line p-3 text-left text-caption font-medium text-ink-muted"
              >
                <span className="sr-only">Attribute</span>
              </th>
              {items.map((m) => (
                <th
                  key={m.slug}
                  scope="col"
                  className="border-b border-l border-line p-3 text-left font-normal"
                >
                  <div className="flex items-start gap-3">
                    <Img
                      image={m.swatch}
                      sizes="64px"
                      alt=""
                      className="size-16 shrink-0 rounded-md"
                      imgClassName="size-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/materials/${m.slug}/`}
                        className="font-display text-h3 text-ink hover:text-accent"
                      >
                        {m.name}
                      </Link>
                      <p className="text-caption text-ink-muted">{categoryLabel(m.category)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(m.slug)}
                      className="rounded-full p-1 text-ink-muted hover:bg-surface-sunk hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
                      aria-label={`Remove ${m.name} from comparison`}
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                </th>
              ))}
              {items.length < MAX && (
                <th scope="col" className="border-b border-l border-line p-3 text-left font-normal">
                  <Link
                    href="/materials/"
                    className="flex h-16 items-center justify-center gap-2 rounded-md border border-dashed border-line text-body-s text-ink-muted hover:border-sand hover:text-ink"
                  >
                    <Plus className="size-4" aria-hidden /> Add another
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="align-top odd:bg-surface-sunk/50">
                <th scope="row" className="p-3 text-left text-caption font-medium text-ink-muted">
                  {row.label}
                </th>
                {items.map((m) => (
                  <td key={m.slug} className="border-l border-line p-3 text-ink">
                    {row.render(m)}
                  </td>
                ))}
                {items.length < MAX && <td className="border-l border-line" />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-s text-ink-muted">
          Not sure which to pick? Send us the shortlist and we&apos;ll advise for your room.
        </p>
        <WhatsAppButton
          message={`Hi Dot 3, I'm comparing ${items.map((m) => m.name).join(', ')} for my home. Which would you recommend?`}
          label="Ask on WhatsApp"
        />
      </div>
    </div>
  );
}

function Dots({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${n} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < n ? 'size-2 rounded-full bg-accent' : 'size-2 rounded-full bg-line'}
          aria-hidden
        />
      ))}
    </span>
  );
}

function YesNo({ v }: { v: boolean }) {
  return v ? (
    <span className="inline-flex items-center gap-1 text-success">
      <Check className="size-4" aria-hidden /> Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-ink-muted">
      <Minus className="size-4" aria-hidden /> No
    </span>
  );
}

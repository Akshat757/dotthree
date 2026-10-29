'use client';

import { useMemo, useState } from 'react';

import { TestimonialCard } from '@/components/cards';
import { Chip, EmptyState } from '@/components/ui/display';
import { SimpleSelect } from '@/components/ui/form-controls';
import { designers, testimonials } from '@/data/demo';

const SORTS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'longest', label: 'Longest projects' },
];

export function TestimonialsBrowser() {
  const [rating, setRating] = useState<number>(0);
  const [type, setType] = useState<string>('');
  const [designer, setDesigner] = useState<string>('');
  const [sort, setSort] = useState<string>('recent');

  const types = useMemo(
    () =>
      Array.from(
        new Set(testimonials.map((t) => t.projectType).filter((x): x is string => Boolean(x))),
      ).sort(),
    [],
  );

  const list = useMemo(() => {
    const out = testimonials.filter(
      (t) =>
        t.rating >= rating &&
        (!type || t.projectType === type) &&
        (!designer || t.designerSlug === designer),
    );
    out.sort((a, b) => {
      if (sort === 'rating')
        return b.rating - a.rating || (b.date ?? '').localeCompare(a.date ?? '');
      if (sort === 'longest') return (b.timelineWeeks ?? 0) - (a.timelineWeeks ?? 0);
      return (b.date ?? '').localeCompare(a.date ?? '');
    });
    return out;
  }, [rating, type, designer, sort]);

  const anyFilter = rating > 0 || type || designer;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Minimum rating">
          {[0, 4, 5].map((r) => (
            <Chip key={r} selected={rating === r} onClick={() => setRating(r)} size="md">
              {r === 0 ? 'All ratings' : `${r}★ and up`}
            </Chip>
          ))}
        </div>
        <SimpleSelect
          aria-label="Project type"
          placeholder="Any project type"
          className="w-48"
          options={[
            { value: '__all', label: 'Any project type' },
            ...types.map((t) => ({ value: t, label: t })),
          ]}
          value={type || '__all'}
          onValueChange={(v) => setType(v === '__all' ? '' : v)}
        />
        <SimpleSelect
          aria-label="Designer"
          placeholder="Any designer"
          className="w-48"
          options={[
            { value: '__all', label: 'Any designer' },
            ...designers.map((d) => ({ value: d.slug, label: d.name })),
          ]}
          value={designer || '__all'}
          onValueChange={(v) => setDesigner(v === '__all' ? '' : v)}
        />
        <SimpleSelect
          aria-label="Sort"
          className="ml-auto w-44"
          options={SORTS}
          value={sort}
          onValueChange={setSort}
        />
      </div>
      <p className="text-body-s text-ink-muted" aria-live="polite">
        {list.length} of {testimonials.length} testimonials
      </p>
      {list.length === 0 ? (
        <EmptyState
          title="No testimonials match"
          description="Try a lower rating or any project type."
          action={
            anyFilter ? (
              <button
                type="button"
                className="text-body-s font-medium text-accent hover:underline"
                onClick={() => {
                  setRating(0);
                  setType('');
                  setDesigner('');
                }}
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <TestimonialCard key={t.id} t={t} full />
          ))}
        </div>
      )}
    </div>
  );
}

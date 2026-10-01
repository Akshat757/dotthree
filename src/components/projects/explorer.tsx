'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { BUDGET_BAND_LABEL, ProjectCard, PROPERTY_LABEL, roomLabel } from '@/components/cards';
import { Button } from '@/components/ui/button';
import { Chip, EmptyState } from '@/components/ui/display';
import { SimpleSelect } from '@/components/ui/form-controls';
import { Label } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/overlay';
import { ROOM_LABELS, projects, styles } from '@/data/demo';
import {
  activeFilterCount,
  applyFilters,
  FILTER_KEYS,
  parseFilters,
  relaxFilters,
  serialiseFilters,
  SORT_OPTIONS,
  SPECIAL_LABEL,
  type ProjectFilters,
} from '@/lib/projects/filters';
import { BUDGET_BANDS, PROPERTY_TYPES } from '@/types/content';

type Key = (typeof FILTER_KEYS)[number];

const ROOM_OPTIONS = Array.from(new Set(projects.flatMap((p) => p.roomTypes)))
  .filter((r) => r in ROOM_LABELS)
  .map((r) => ({ value: r, label: roomLabel(r) }))
  .sort((a, b) => a.label.localeCompare(b.label));

const STYLE_OPTIONS = styles
  .filter((s) => projects.some((p) => p.styles.includes(s.slug)))
  .map((s) => ({ value: s.slug, label: s.name }));

const PROPERTY_OPTIONS = PROPERTY_TYPES.filter((t) => projects.some((p) => p.propertyType === t));

function labelFor(k: Key, v: string): string {
  switch (k) {
    case 'propertyType':
      return PROPERTY_LABEL[v as keyof typeof PROPERTY_LABEL] ?? v;
    case 'budget':
      return BUDGET_BAND_LABEL[v as keyof typeof BUDGET_BAND_LABEL] ?? v;
    case 'special':
      return SPECIAL_LABEL[v as keyof typeof SPECIAL_LABEL] ?? v;
    case 'style':
      return STYLE_OPTIONS.find((o) => o.value === v)?.label ?? v;
    case 'room':
      return roomLabel(v);
    case 'segment':
      return v === 'COMMERCIAL' ? 'Commercial' : 'Residential';
    case 'nature':
      return v === 'RENOVATION' ? 'Renovation' : 'New home';
    default:
      return v;
  }
}

export function ProjectsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const filters = React.useMemo(() => parseFilters(new URLSearchParams(sp.toString())), [sp]);

  const update = React.useCallback(
    (patch: Partial<ProjectFilters>) => {
      const next = { ...filters, ...patch };
      const qs = serialiseFilters(next);
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [filters, pathname, router],
  );

  const toggle = (k: Key, v: string) => update({ [k]: filters[k] === v ? undefined : v });
  const clearAll = () => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, undefined])));

  const results = React.useMemo(() => applyFilters(projects, filters), [filters]);
  const relaxed = React.useMemo(
    () => (results.length === 0 ? relaxFilters(projects, filters) : null),
    [results.length, filters],
  );
  const active = activeFilterCount(filters);

  const quickChips: { k: Key; v: string; label: string }[] = [
    { k: 'segment', v: 'RESIDENTIAL', label: 'Homes' },
    { k: 'segment', v: 'COMMERCIAL', label: 'Commercial' },
    { k: 'nature', v: 'RENOVATION', label: 'Renovations' },
    { k: 'bhk', v: '2BHK', label: '2 BHK' },
    { k: 'bhk', v: '3BHK', label: '3 BHK' },
    { k: 'special', v: 'vastu', label: 'Vastu-aligned' },
    { k: 'special', v: 'compact', label: 'Compact' },
  ];

  const shown = relaxed ? relaxed.results : results;

  return (
    <div>
      {/* Quick chips + controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="no-scrollbar -mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          role="group"
          aria-label="Quick filters"
        >
          <Chip selected={active === 0} onClick={clearAll}>
            All
          </Chip>
          {quickChips.map((c) => (
            <Chip
              key={`${c.k}-${c.v}`}
              selected={filters[c.k] === c.v}
              onClick={() => toggle(c.k, c.v)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="size-4" aria-hidden />
                Filters{active > 0 && <span className="tabular">({active})</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter projects</SheetTitle>
                <SheetDescription>
                  Narrow down by home type, rooms, style and budget.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-5">
                <Field label="Property type" id="f-prop">
                  <SimpleSelect
                    id="f-prop"
                    placeholder="Any"
                    value={filters.propertyType ?? 'any'}
                    onValueChange={(v) =>
                      update({
                        propertyType:
                          v === 'any' ? undefined : (v as ProjectFilters['propertyType']),
                      })
                    }
                    options={[
                      { value: 'any', label: 'Any' },
                      ...PROPERTY_OPTIONS.map((t) => ({ value: t, label: PROPERTY_LABEL[t] })),
                    ]}
                  />
                </Field>
                <ChipField
                  label="Configuration"
                  options={['1BHK', '2BHK', '3BHK', '4BHK+'].map((b) => ({
                    value: b,
                    label: b.replace('BHK', ' BHK'),
                  }))}
                  value={filters.bhk}
                  onChange={(v) => update({ bhk: v })}
                />
                <ChipField
                  label="Nature of work"
                  options={[
                    { value: 'NEW', label: 'New home' },
                    { value: 'RENOVATION', label: 'Renovation' },
                  ]}
                  value={filters.nature}
                  onChange={(v) => update({ nature: v as ProjectFilters['nature'] })}
                />
                <ChipField
                  label="Budget"
                  options={BUDGET_BANDS.map((b) => ({ value: b, label: BUDGET_BAND_LABEL[b] }))}
                  value={filters.budget}
                  onChange={(v) => update({ budget: v as ProjectFilters['budget'] })}
                />
                <Field label="Style" id="f-style">
                  <SimpleSelect
                    id="f-style"
                    placeholder="Any"
                    value={filters.style ?? 'any'}
                    onValueChange={(v) => update({ style: v === 'any' ? undefined : v })}
                    options={[{ value: 'any', label: 'Any' }, ...STYLE_OPTIONS]}
                  />
                </Field>
                <Field label="Room" id="f-room">
                  <SimpleSelect
                    id="f-room"
                    placeholder="Any"
                    value={filters.room ?? 'any'}
                    onValueChange={(v) => update({ room: v === 'any' ? undefined : v })}
                    options={[{ value: 'any', label: 'Any' }, ...ROOM_OPTIONS]}
                  />
                </Field>
                <ChipField
                  label="Special"
                  options={Object.entries(SPECIAL_LABEL).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                  value={filters.special}
                  onChange={(v) => update({ special: v as ProjectFilters['special'] })}
                />
              </div>
              <SheetFooter className="mt-auto">
                <Button variant="ghost" onClick={clearAll} disabled={active === 0}>
                  Clear all
                </Button>
                <span className="tabular self-center text-body-s text-ink-muted" aria-live="polite">
                  {results.length} match{results.length === 1 ? '' : 'es'}
                </span>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <SimpleSelect
            aria-label="Sort projects"
            value={filters.sort}
            onValueChange={(v) => update({ sort: v as ProjectFilters['sort'] })}
            options={SORT_OPTIONS}
            className="h-9 w-44 text-body-s"
          />
        </div>
      </div>

      {/* Active filters */}
      {active > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {FILTER_KEYS.filter((k) => filters[k]).map((k) => (
            <Chip
              key={k}
              size="sm"
              selected
              onClick={() => update({ [k]: undefined })}
              onRemove={() => update({ [k]: undefined })}
            >
              {labelFor(k, filters[k]!)}
            </Chip>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-body-s text-ink-muted hover:text-ink"
          >
            <X className="size-3.5" aria-hidden /> Clear all
          </button>
        </div>
      )}

      <p className="mt-6 text-body-s text-ink-muted" role="status" aria-live="polite">
        {relaxed ? (
          <>
            No exact matches. Showing{' '}
            <span className="tabular font-medium text-ink">{shown.length}</span> projects after
            relaxing {relaxed.dropped.map((k) => labelFor(k, filters[k]!)).join(', ')}.
          </>
        ) : (
          <>
            Showing <span className="tabular font-medium text-ink">{shown.length}</span> of{' '}
            {projects.length} projects
          </>
        )}
      </p>

      {shown.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="Nothing matches yet"
          description="We're adding projects every month. Tell us what you're planning and we'll share similar work on WhatsApp."
          action={
            <Button asChild variant="outline">
              <Link href="/contact/">Ask us for examples</Link>
            </Button>
          }
        />
      ) : (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <li key={p.slug}>
              <ProjectCard project={p} priority={i < 3} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function ChipField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-body-s font-medium text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip
            key={o.value}
            size="sm"
            selected={value === o.value}
            onClick={() => onChange(value === o.value ? undefined : o.value)}
          >
            {o.label}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

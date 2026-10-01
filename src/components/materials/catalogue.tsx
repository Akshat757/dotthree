'use client';

import { differenceCiede2000, parse } from 'culori';
import { ArrowRight, Search, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { MaterialCard } from '@/components/cards';
import { Button } from '@/components/ui/button';
import { Badge, Chip, EmptyState } from '@/components/ui/display';
import { SimpleSelect } from '@/components/ui/form-controls';
import { Img } from '@/components/ui/img';
import { Input, Label } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/overlay';
import { ROOM_LABELS, materials } from '@/data/demo';
import { getAdapters } from '@/lib/adapters';
import { categoryLabel, surfaceLabel } from '@/lib/materials/labels';
import { cn, formatInrCompact, titleCase } from '@/lib/utils';
import type { Material, MaterialCategory, SurfaceType, Tier } from '@/types/content';
import { MATERIAL_CATEGORIES, SURFACE_TYPES, TIERS } from '@/types/content';

const COMPARE_KEY = 'atelier.materials.compare';
const MAX_COMPARE = 4;

const TONALITIES = ['warm', 'cool', 'neutral', 'bold', 'pastel', 'earthy', 'jewel'] as const;
const FINISHES = Array.from(
  new Set(materials.map((m) => m.finish).filter((f): f is NonNullable<Material['finish']> => !!f)),
);
const CATEGORIES = MATERIAL_CATEGORIES.filter((c) => materials.some((m) => m.category === c));
const SURFACES = SURFACE_TYPES.filter((s) => materials.some((m) => m.usageSurfaces.includes(s)));
const ROOMS = Array.from(new Set(materials.flatMap((m) => m.usageRooms))).filter(
  (r) => r in ROOM_LABELS,
);
const PRICE_MAX = Math.max(...materials.map((m) => m.price?.max ?? 0));

interface Facets {
  q: string;
  category?: MaterialCategory;
  tier?: Tier;
  tonality?: (typeof TONALITIES)[number];
  finish?: Material['finish'];
  surface?: SurfaceType;
  room?: string;
  maxPrice?: number;
  colour?: string;
  sort: 'relevance' | 'price-asc' | 'price-desc' | 'name';
}

const KEYS = [
  'q',
  'category',
  'tier',
  'tonality',
  'finish',
  'surface',
  'room',
  'maxPrice',
  'colour',
  'sort',
] as const;

function parse_(sp: URLSearchParams): Facets {
  const num = Number(sp.get('maxPrice'));
  const pick = <T extends string>(k: string, allowed: readonly T[]) => {
    const v = sp.get(k);
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
  };
  return {
    q: sp.get('q') ?? '',
    category: pick('category', CATEGORIES),
    tier: pick('tier', TIERS),
    tonality: pick('tonality', TONALITIES),
    finish: pick('finish', FINISHES),
    surface: pick('surface', SURFACES),
    room: pick('room', ROOMS),
    maxPrice: Number.isFinite(num) && num > 0 ? num : undefined,
    colour: /^#?[0-9a-f]{6}$/i.test(sp.get('colour') ?? '')
      ? `#${sp.get('colour')!.replace('#', '')}`
      : undefined,
    sort: pick('sort', ['relevance', 'price-asc', 'price-desc', 'name'] as const) ?? 'relevance',
  };
}

function serialise(f: Facets): string {
  const u = new URLSearchParams();
  for (const k of KEYS) {
    const v = f[k];
    if (k === 'sort' && v === 'relevance') continue;
    if (v !== undefined && v !== '') u.set(k, String(v).replace('#', ''));
  }
  return u.toString();
}

const dE = differenceCiede2000();

export function MaterialsCatalogue() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const facets = React.useMemo(() => parse_(new URLSearchParams(sp.toString())), [sp]);

  const update = React.useCallback(
    (patch: Partial<Facets>) => {
      const qs = serialise({ ...facets, ...patch });
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [facets, pathname, router],
  );

  // Text search via adapters (MiniSearch), debounced.
  const [qInput, setQInput] = React.useState(facets.q);
  React.useEffect(() => setQInput(facets.q), [facets.q]);
  React.useEffect(() => {
    if (qInput === facets.q) return;
    const t = setTimeout(() => update({ q: qInput }), 250);
    return () => clearTimeout(t);
  }, [qInput, facets.q, update]);

  const [hits, setHits] = React.useState<Map<string, number> | null>(null);
  React.useEffect(() => {
    let alive = true;
    if (facets.q.trim().length < 2) {
      setHits(null);
      return;
    }
    getAdapters()
      .content.search(facets.q, ['materials'])
      .then((r) => alive && setHits(new Map(r.map((h) => [h.slug, h.score]))));
    return () => {
      alive = false;
    };
  }, [facets.q]);

  const colour = facets.colour ? parse(facets.colour) : undefined;

  const results = React.useMemo(() => {
    let list = materials.filter((m) => {
      if (hits && !hits.has(m.slug)) return false;
      if (facets.category && m.category !== facets.category) return false;
      if (facets.tier && m.tier !== facets.tier) return false;
      if (facets.tonality && m.tonality !== facets.tonality) return false;
      if (facets.finish && m.finish !== facets.finish) return false;
      if (facets.surface && !m.usageSurfaces.includes(facets.surface)) return false;
      if (facets.room && !m.usageRooms.includes(facets.room)) return false;
      if (facets.maxPrice && (m.price?.min ?? 0) > facets.maxPrice) return false;
      if (colour && !m.hex) return false;
      return true;
    });
    if (colour) {
      list = list
        .map((m) => ({ m, d: dE(colour, parse(m.hex!) ?? colour) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 24)
        .map((x) => x.m);
    } else if (facets.sort === 'price-asc')
      list.sort((a, b) => (a.price?.min ?? 0) - (b.price?.min ?? 0));
    else if (facets.sort === 'price-desc')
      list.sort((a, b) => (b.price?.max ?? 0) - (a.price?.max ?? 0));
    else if (facets.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (hits) list.sort((a, b) => (hits.get(b.slug) ?? 0) - (hits.get(a.slug) ?? 0));
    return list;
  }, [facets, hits, colour]);

  // Compare tray (sessionStorage).
  const [compare, setCompare] = React.useState<string[]>([]);
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(COMPARE_KEY);
      if (raw) setCompare(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);
  const toggleCompare = (slug: string) =>
    setCompare((cur) => {
      const next = cur.includes(slug)
        ? cur.filter((s) => s !== slug)
        : cur.length >= MAX_COMPARE
          ? cur
          : [...cur, slug];
      sessionStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      return next;
    });
  const compareItems = compare
    .map((s) => materials.find((m) => m.slug === s))
    .filter((m): m is Material => !!m);

  const activeKeys = (
    ['category', 'tier', 'tonality', 'finish', 'surface', 'room', 'maxPrice', 'colour'] as const
  ).filter((k) => facets[k] !== undefined);
  const clearAll = () =>
    update({
      q: '',
      category: undefined,
      tier: undefined,
      tonality: undefined,
      finish: undefined,
      surface: undefined,
      room: undefined,
      maxPrice: undefined,
      colour: undefined,
    });

  const facetLabel = (k: (typeof activeKeys)[number]) => {
    const v = facets[k]!;
    switch (k) {
      case 'category':
        return categoryLabel(v as MaterialCategory);
      case 'surface':
        return surfaceLabel(v as SurfaceType);
      case 'room':
        return ROOM_LABELS[v as string] ?? String(v);
      case 'maxPrice':
        return `Under ${formatInrCompact(Number(v))}`;
      case 'colour':
        return `Near ${v}`;
      default:
        return titleCase(String(v));
    }
  };

  return (
    <div>
      {/* Search + controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1">
          <Label htmlFor="mat-q" className="sr-only">
            Search materials
          </Label>
          <Input
            id="mat-q"
            type="search"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search by name, brand, code or room — e.g. “teak”, “Asian Paints”, “kitchen”"
            leading={<Search className="size-4 text-ink-muted" aria-hidden />}
            autoComplete="off"
          />
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="size-4" aria-hidden /> Filters
                {activeKeys.length > 0 && <span className="tabular">({activeKeys.length})</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter materials</SheetTitle>
                <SheetDescription>
                  {materials.length} finishes with Indore pricing.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-5">
                <SelectField
                  id="f-cat"
                  label="Category"
                  value={facets.category}
                  onChange={(v) => update({ category: v as MaterialCategory | undefined })}
                  options={CATEGORIES.map((c) => ({ value: c, label: categoryLabel(c) }))}
                />
                <ChipField
                  label="Tier"
                  value={facets.tier}
                  onChange={(v) => update({ tier: v as Tier | undefined })}
                  options={TIERS.map((t) => ({ value: t, label: titleCase(t) }))}
                />
                <ChipField
                  label="Tonality"
                  value={facets.tonality}
                  onChange={(v) => update({ tonality: v as Facets['tonality'] })}
                  options={TONALITIES.map((t) => ({ value: t, label: titleCase(t) }))}
                />
                <ChipField
                  label="Finish"
                  value={facets.finish}
                  onChange={(v) => update({ finish: v as Material['finish'] })}
                  options={FINISHES.map((f) => ({ value: f, label: titleCase(f) }))}
                />
                <SelectField
                  id="f-surf"
                  label="Surface"
                  value={facets.surface}
                  onChange={(v) => update({ surface: v as SurfaceType | undefined })}
                  options={SURFACES.map((s) => ({ value: s, label: surfaceLabel(s) }))}
                />
                <SelectField
                  id="f-room"
                  label="Room"
                  value={facets.room}
                  onChange={(v) => update({ room: v })}
                  options={ROOMS.map((r) => ({ value: r, label: ROOM_LABELS[r] ?? r }))}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor="f-price">
                    Max price per unit ·{' '}
                    {facets.maxPrice ? formatInrCompact(facets.maxPrice) : 'any'}
                  </Label>
                  <input
                    id="f-price"
                    type="range"
                    min={0}
                    max={PRICE_MAX}
                    step={50}
                    value={facets.maxPrice ?? PRICE_MAX}
                    onChange={(e) =>
                      update({
                        maxPrice:
                          Number(e.target.value) >= PRICE_MAX ? undefined : Number(e.target.value),
                      })
                    }
                    className="accent-accent"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="f-colour">Match a colour</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="f-colour"
                      type="color"
                      value={facets.colour ?? '#b5643c'}
                      onChange={(e) => update({ colour: e.target.value })}
                      className="size-11 cursor-pointer rounded-md border border-line bg-surface p-1"
                    />
                    <Input
                      aria-label="Hex colour"
                      value={facets.colour ?? ''}
                      placeholder="#RRGGBB"
                      onChange={(e) =>
                        /^#?[0-9a-f]{6}$/i.test(e.target.value) &&
                        update({ colour: e.target.value })
                      }
                      className="font-mono"
                    />
                    {facets.colour && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => update({ colour: undefined })}
                        aria-label="Clear colour"
                      >
                        <X className="size-4" aria-hidden />
                      </Button>
                    )}
                  </div>
                  <p className="text-caption text-ink-muted">
                    Finds the closest paints and solid finishes by perceptual colour distance.
                  </p>
                </div>
              </div>
              <SheetFooter className="mt-auto">
                <Button
                  variant="ghost"
                  onClick={clearAll}
                  disabled={activeKeys.length === 0 && !facets.q}
                >
                  Clear all
                </Button>
                <span className="tabular self-center text-body-s text-ink-muted" aria-live="polite">
                  {results.length} match{results.length === 1 ? '' : 'es'}
                </span>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <SimpleSelect
            aria-label="Sort materials"
            value={facets.sort}
            onValueChange={(v) => update({ sort: v as Facets['sort'] })}
            options={[
              { value: 'relevance', label: 'Relevance' },
              { value: 'price-asc', label: 'Price: low to high' },
              { value: 'price-desc', label: 'Price: high to low' },
              { value: 'name', label: 'Name A–Z' },
            ]}
            className="w-44"
          />
        </div>
      </div>

      {/* Category chips */}
      <div
        className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Category"
      >
        <Chip size="sm" selected={!facets.category} onClick={() => update({ category: undefined })}>
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            size="sm"
            selected={facets.category === c}
            onClick={() => update({ category: facets.category === c ? undefined : c })}
          >
            {categoryLabel(c)}
          </Chip>
        ))}
      </div>

      {(activeKeys.length > 0 || facets.q) && (
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {facets.q && (
            <Chip
              size="sm"
              selected
              onRemove={() => update({ q: '' })}
              onClick={() => update({ q: '' })}
            >
              “{facets.q}”
            </Chip>
          )}
          {activeKeys.map((k) => (
            <Chip
              key={k}
              size="sm"
              selected
              onRemove={() => update({ [k]: undefined })}
              onClick={() => update({ [k]: undefined })}
            >
              {k === 'colour' && (
                <span
                  className="mr-1 inline-block size-3 rounded-full ring-1 ring-canvas/40"
                  style={{ background: facets.colour }}
                  aria-hidden
                />
              )}
              {facetLabel(k)}
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

      <p className="mt-5 text-body-s text-ink-muted" role="status" aria-live="polite">
        {colour ? (
          <>
            Closest <span className="tabular font-medium text-ink">{results.length}</span> finishes
            to {facets.colour}
          </>
        ) : (
          <>
            Showing <span className="tabular font-medium text-ink">{results.length}</span> of{' '}
            {materials.length} materials
          </>
        )}
      </p>

      {results.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No materials match"
          description="Try a broader category or clear the colour match. If you have a specific product in mind, we can usually source it."
          action={
            <Button variant="outline" onClick={clearAll}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul
          className={cn(
            'mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5',
            compareItems.length > 0 && 'pb-28',
          )}
        >
          {results.map((m) => (
            <li key={m.slug}>
              <MaterialCard
                material={m}
                selected={compare.includes(m.slug)}
                onSelect={() => toggleCompare(m.slug)}
                action={
                  m.hex ? (
                    <span
                      className="block size-5 rounded-full ring-2 ring-canvas"
                      style={{ background: m.hex }}
                      aria-hidden
                    />
                  ) : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      {/* Compare tray */}
      {compareItems.length > 0 && (
        <div
          className="fixed inset-x-0 bottom-16 z-40 border-t border-line bg-surface/95 shadow-e3 backdrop-blur md:bottom-0"
          role="region"
          aria-label="Compare tray"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <ul className="flex flex-1 gap-2 overflow-x-auto">
              {compareItems.map((m) => (
                <li
                  key={m.slug}
                  className="flex shrink-0 items-center gap-2 rounded-md border border-line bg-surface px-2 py-1"
                >
                  <Img
                    image={m.swatch}
                    sizes="28px"
                    alt=""
                    className="size-7 rounded-sm"
                    imgClassName="size-full object-cover"
                  />
                  <span className="max-w-32 truncate text-body-s text-ink">{m.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(m.slug)}
                    className="rounded-sm p-0.5 text-ink-muted hover:text-ink"
                    aria-label={`Remove ${m.name} from compare`}
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <Badge tone="neutral" className="hidden sm:inline-flex">
              {compareItems.length}/{MAX_COMPARE}
            </Badge>
            <Button asChild size="sm" disabled={compareItems.length < 2}>
              <Link href={`/materials/compare/?items=${compareItems.map((m) => m.slug).join(',')}`}>
                Compare <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <SimpleSelect
        id={id}
        placeholder="Any"
        value={value ?? 'any'}
        onValueChange={(v) => onChange(v === 'any' ? undefined : v)}
        options={[{ value: 'any', label: 'Any' }, ...options]}
      />
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

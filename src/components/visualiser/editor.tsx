'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calculator,
  Check,
  Columns2,
  Copy,
  Eye,
  EyeOff,
  Link2,
  RotateCcw,
  Save,
  Search,
  Sun,
  X,
} from 'lucide-react';

import { Container, ForceDarkTheme } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge, Chip } from '@/components/ui/display';
import { Switch } from '@/components/ui/form-controls';
import { Img } from '@/components/ui/img';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { imgSrc, materials, projects, roomTemplates } from '@/data/demo';
import { getAdapters } from '@/lib/adapters';
import { messages } from '@/lib/whatsapp';
import { cn, formatInr, titleCase, uid } from '@/lib/utils';
import type { Material, RoomTemplate, SurfaceMask, SurfaceType } from '@/types/content';
import type { DaylightPreset, Design, DesignVariant, SurfaceAssignment } from '@/types/local';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type Assignments = Record<string, string | undefined>; // surfaceId → materialSlug

const DAYLIGHT: { value: DaylightPreset; label: string; tint: string; opacity: number }[] = [
  { value: 'morning', label: 'Morning', tint: '#fff4d6', opacity: 0.14 },
  { value: 'midday', label: 'Midday', tint: '#ffffff', opacity: 0 },
  { value: 'afternoon', label: 'Afternoon', tint: '#ffe3b8', opacity: 0.16 },
  { value: 'golden', label: 'Golden hour', tint: '#ffb86b', opacity: 0.24 },
  { value: 'evening', label: 'Evening', tint: '#6b7bb8', opacity: 0.28 },
  { value: 'night', label: 'Night', tint: '#1e2440', opacity: 0.5 },
];

/** Which other surface types a material may reasonably be shown on. */
const COMPAT: Partial<Record<SurfaceType, SurfaceType[]>> = {
  ACCENT_WALL: ['WALL', 'WALL_PANEL'],
  WALL_PANEL: ['WALL', 'ACCENT_WALL'],
  BACKSPLASH: ['BATH_TILE', 'WALL'],
  BATH_TILE: ['BACKSPLASH', 'FLOOR'],
  CABINET_UPPER: ['CABINET_LOWER', 'WARDROBE'],
  CABINET_LOWER: ['CABINET_UPPER', 'WARDROBE'],
  WARDROBE: ['CABINET_LOWER', 'CABINET_UPPER'],
  CEILING: ['WALL'],
};

function materialsFor(type: SurfaceType): Material[] {
  const types = [type, ...(COMPAT[type] ?? [])];
  const exact = materials.filter((m) => m.usageSurfaces.includes(type));
  const near = materials.filter(
    (m) => !m.usageSurfaces.includes(type) && m.usageSurfaces.some((s) => types.includes(s)),
  );
  return [...exact, ...near];
}

function encodeAssignments(a: Assignments): string {
  return Object.entries(a)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}:${v}`)
    .join(',');
}
function decodeAssignments(s: string | null): Assignments {
  if (!s) return {};
  const out: Assignments = {};
  for (const pair of s.split(',')) {
    const [k, v] = pair.split(':');
    if (k && v && materials.some((m) => m.slug === v)) out[k] = v;
  }
  return out;
}

function defaultAssignments(t: RoomTemplate): Assignments {
  const out: Assignments = {};
  for (const s of t.surfaces) if (s.defaultMaterialSlug) out[s.id] = s.defaultMaterialSlug;
  return out;
}

function presetAssignments(t: RoomTemplate, projectSlug: string | null): Assignments | null {
  const p = projects.find((x) => x.slug === projectSlug);
  if (!p?.palette) return null;
  const out: Assignments = {};
  for (const s of t.surfaces) {
    const slug = p.palette[s.surfaceType];
    if (slug && materials.some((m) => m.slug === slug)) out[s.id] = slug;
  }
  return out;
}

const byMaterial = new Map(materials.map((m) => [m.slug, m]));

/* ------------------------------------------------------------------ */
/* Variants                                                            */
/* ------------------------------------------------------------------ */

interface Variant {
  id: string;
  name: string;
  colour: string;
  assign: Assignments;
  daylight: DaylightPreset;
}

const VARIANT_COLOURS = ['#c9a26b', '#6b9bc9', '#8fb58a', '#c97b9b'];
const MAX_VARIANTS = 4;
const DAYLIGHT_VALUES = DAYLIGHT.map((d) => d.value);

function variantName(i: number): string {
  return `Variant ${String.fromCharCode(65 + i)}`;
}

/* ------------------------------------------------------------------ */
/* Mask hit-testing                                                    */
/* ------------------------------------------------------------------ */

/**
 * CSS masks do not affect pointer hit-testing, so surfaces are picked by sampling the alpha of each mask
 * (decoded once at reduced size) at the clicked point; the top-most surface wins.
 */
function useSurfacePicker(template: RoomTemplate) {
  const masks = React.useRef(new Map<string, { w: number; h: number; alpha: Uint8Array }>());

  React.useEffect(() => {
    let cancelled = false;
    masks.current = new Map();
    for (const s of template.surfaces) {
      const img = new window.Image();
      img.onload = () => {
        if (cancelled) return;
        const w = 400;
        const h = Math.max(1, Math.round((w * img.naturalHeight) / img.naturalWidth));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const px = ctx.getImageData(0, 0, w, h).data;
        const alpha = new Uint8Array(w * h);
        for (let i = 0; i < alpha.length; i++) alpha[i] = px[i * 4 + 3] ?? 0;
        masks.current.set(s.id, { w, h, alpha });
      };
      img.src = s.maskSrc;
    }
    return () => {
      cancelled = true;
    };
  }, [template]);

  return React.useCallback(
    (nx: number, ny: number): string | null => {
      const ordered = [...template.surfaces].sort((a, b) => b.orderIndex - a.orderIndex);
      for (const s of ordered) {
        const m = masks.current.get(s.id);
        if (!m) continue;
        const x = Math.min(m.w - 1, Math.max(0, Math.floor(nx * m.w)));
        const y = Math.min(m.h - 1, Math.max(0, Math.floor(ny * m.h)));
        if ((m.alpha[y * m.w + x] ?? 0) > 64) return s.id;
      }
      return null;
    },
    [template],
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

export function VisualiserEditor() {
  const params = useSearchParams();
  const template = React.useMemo(
    () => roomTemplates.find((t) => t.slug === params.get('template')) ?? roomTemplates[0],
    [params],
  );
  if (!template) {
    return (
      <Container className="py-16 text-center">
        <h1 className="font-display text-h3 text-ink">No rooms available</h1>
        <p className="mt-2 text-body-s text-ink-muted">
          Add a room template to the demo data to use the visualiser.
        </p>
        <Button asChild className="mt-6">
          <Link href="/visualiser/">Back to visualiser</Link>
        </Button>
      </Container>
    );
  }
  return <Editor key={`${template.slug}|${params.get('preset') ?? ''}`} template={template} />;
}

function Editor({ template }: { template: RoomTemplate }) {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const presetSlug = params.get('preset');

  const initial = React.useMemo<Variant>(() => {
    const fromUrl = decodeAssignments(params.get('s'));
    const preset = Object.keys(fromUrl).length ? null : presetAssignments(template, presetSlug);
    const l = params.get('l') as DaylightPreset | null;
    return {
      id: uid('var'),
      name: variantName(0),
      colour: VARIANT_COLOURS[0]!,
      assign: { ...defaultAssignments(template), ...fromUrl, ...(preset ?? {}) },
      daylight: l && DAYLIGHT_VALUES.includes(l) ? l : 'midday',
    };
    // Only the URL at first render seeds the editor; later edits are local state.
  }, []);

  const [variants, setVariants] = React.useState<Variant[]>([initial]);
  const [activeVariantId, setActiveVariantId] = React.useState(initial.id);
  const [compare, setCompare] = React.useState(false);
  const [compareId, setCompareId] = React.useState<string | null>(null);
  const [active, setActive] = React.useState<string>(template.surfaces[0]?.id ?? '');
  const [hover, setHover] = React.useState<string | null>(null);
  const [showOriginal, setShowOriginal] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const pick = useSurfacePicker(template);

  const variant = variants.find((v) => v.id === activeVariantId) ?? variants[0]!;
  const otherVariants = variants.filter((v) => v.id !== variant.id);
  const compareWith = otherVariants.find((v) => v.id === compareId) ?? otherVariants[0];
  const { assign, daylight } = variant;

  const patchVariant = (patch: Partial<Pick<Variant, 'assign' | 'daylight'>>) =>
    setVariants((vs) => vs.map((v) => (v.id === variant.id ? { ...v, ...patch } : v)));
  const setAssign = (fn: (a: Assignments) => Assignments) => patchVariant({ assign: fn(assign) });

  const addVariant = () => {
    if (variants.length >= MAX_VARIANTS) return;
    const i = variants.length;
    const next: Variant = {
      ...variant,
      id: uid('var'),
      name: variantName(i),
      colour: VARIANT_COLOURS[i] ?? VARIANT_COLOURS[0]!,
      assign: { ...variant.assign },
    };
    setVariants((vs) => [...vs, next]);
    setActiveVariantId(next.id);
    toast({
      title: `${next.name} created`,
      description: `A copy of ${variant.name} — change it, then compare.`,
      tone: 'success',
    });
  };

  const removeVariant = (id: string) => {
    if (variants.length < 2) return;
    const rest = variants.filter((v) => v.id !== id);
    setVariants(rest);
    if (activeVariantId === id) setActiveVariantId(rest[0]!.id);
    if (rest.length < 2) setCompare(false);
  };

  const activeSurface = template.surfaces.find((s) => s.id === active);
  const candidates = React.useMemo(() => {
    if (!activeSurface) return [];
    const list = materialsFor(activeSurface.surfaceType);
    const q = query.trim().toLowerCase();
    return q
      ? list.filter((m) =>
          `${m.name} ${m.category} ${m.brand ?? ''} ${m.colorFamily ?? ''}`
            .toLowerCase()
            .includes(q),
        )
      : list;
  }, [activeSurface, query]);

  const chosen = template.surfaces
    .map((s) => ({
      surface: s,
      material: assign[s.id] ? byMaterial.get(assign[s.id]!) : undefined,
    }))
    .filter((x): x is { surface: SurfaceMask; material: Material } => Boolean(x.material));

  const shareUrl = () => {
    const u = new URL(window.location.href);
    u.search = '';
    u.searchParams.set('template', template.slug);
    u.searchParams.set('s', encodeAssignments(assign));
    u.searchParams.set('l', daylight);
    return u.toString();
  };

  const spec = `${variant.name} (${DAYLIGHT.find((d) => d.value === daylight)?.label ?? daylight}) — ${template.name}\n${chosen
    .map((c) => `${c.surface.label}: ${c.material.name}`)
    .join('\n')}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      toast({
        title: 'Link copied',
        description: `Anyone with the link sees ${variant.name} exactly as you do.`,
        tone: 'success',
      });
    } catch {
      toast({ title: 'Could not copy', description: shareUrl(), tone: 'warning' });
    }
  };

  const toAssignments = (v: Variant): SurfaceAssignment[] =>
    template.surfaces.map((s) => {
      const m = v.assign[s.id] ? byMaterial.get(v.assign[s.id]!) : undefined;
      return {
        surfaceId: s.id,
        surfaceType: s.surfaceType,
        materialSlug: m?.slug,
        hex: m?.hex,
        finish: m?.finish ?? 'matte',
        pattern: m?.pattern ?? 'plain',
        patternScale: 1,
        patternRotation: 0,
        textureIntensity: 0.5,
        tileLayout: 'straight',
        groutWidth: 0,
        opacity: 1,
        visible: true,
        label: s.label,
      };
    });

  const save = async () => {
    setSaving(true);
    try {
      const { user } = getAdapters();
      const now = Date.now();
      const designId = uid('dsg');
      const saved: DesignVariant[] = variants.map((v) => ({
        id: v.id,
        designId,
        name: v.name,
        colour: v.colour,
        favourite: false,
        assignments: toAssignments(v),
        lighting: {
          daylight: v.daylight,
          windowDirection: template.windowDirection ?? 'N',
          artificial: [],
        },
        annotations: [],
        createdAt: now,
        updatedAt: now,
      }));
      const design: Design = {
        id: designId,
        name: `${template.name} · ${new Date(now).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
        templateSlug: template.slug,
        width: template.baseImage.width,
        height: template.baseImage.height,
        variantIds: saved.map((v) => v.id),
        activeVariantId: variant.id,
        createdAt: now,
        updatedAt: now,
        presetProjectSlug: presetSlug ?? undefined,
      };
      await user.saveDesign(design);
      for (const v of saved) await user.saveVariant(v);
      toast({
        title: `Design saved on this device (${saved.length} variant${saved.length > 1 ? 's' : ''})`,
        description: 'Find it under Designs in your dashboard.',
        tone: 'success',
        action: { label: 'Open dashboard', onClick: () => router.push('/dashboard/?tab=designs') },
      });
    } catch {
      toast({
        title: 'Could not save',
        description: 'Storage may be full or blocked in this browser.',
        tone: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetVariant = () => patchVariant({ assign: defaultAssignments(template) });

  const estimateHref = `/estimate/?materials=${encodeURIComponent(chosen.map((c) => c.material.slug).join(','))}`;
  const comparing = compare && compareWith;

  return (
    <>
      <ForceDarkTheme />
      <div className="min-h-dvh bg-canvas text-ink">
        <Container className="py-4 md:py-6">
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="overline">Visualiser</p>
              <h1 className="truncate font-display text-h3 text-ink">{template.name}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={resetVariant}>
                <RotateCcw className="size-4" aria-hidden /> Reset
              </Button>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Link2 className="size-4" aria-hidden /> Share link
              </Button>
              <Button size="sm" onClick={save} loading={saving}>
                <Save className="size-4" aria-hidden /> Save design
              </Button>
            </div>
          </div>

          {/* Variants */}
          <div
            className="mt-4 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Variants"
          >
            {variants.map((v) => (
              <span key={v.id} className="inline-flex items-center">
                <Chip
                  size="sm"
                  selected={v.id === variant.id}
                  onClick={() => setActiveVariantId(v.id)}
                >
                  <span
                    className="mr-1.5 inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: v.colour }}
                    aria-hidden
                  />
                  {v.name}
                </Chip>
                {variants.length > 1 && v.id === variant.id && (
                  <button
                    type="button"
                    onClick={() => removeVariant(v.id)}
                    aria-label={`Delete ${v.name}`}
                    className="ml-1 grid size-6 place-items-center rounded-full text-ink-muted hover:bg-surface-sunk hover:text-ink"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                )}
              </span>
            ))}
            {variants.length < MAX_VARIANTS && (
              <Button variant="outline" size="sm" onClick={addVariant}>
                <Copy className="size-4" aria-hidden /> Duplicate as new variant
              </Button>
            )}
            {variants.length > 1 && (
              <Button
                variant={compare ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCompare((c) => !c)}
                aria-pressed={compare}
              >
                <Columns2 className="size-4" aria-hidden /> Compare
              </Button>
            )}
          </div>
          {comparing && otherVariants.length > 1 && (
            <div
              className="mt-2 flex flex-wrap items-center gap-2 text-body-s text-ink-muted"
              role="group"
              aria-label="Compare with"
            >
              Compare {variant.name} with
              {otherVariants.map((v) => (
                <Chip
                  key={v.id}
                  size="sm"
                  selected={v.id === compareWith.id}
                  onClick={() => setCompareId(v.id)}
                >
                  {v.name}
                </Chip>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Canvas */}
            <div className="min-w-0">
              {comparing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <RoomCanvas
                    template={template}
                    assign={assign}
                    daylight={daylight}
                    caption={variant.name}
                  />
                  <RoomCanvas
                    template={template}
                    assign={compareWith.assign}
                    daylight={compareWith.daylight}
                    caption={compareWith.name}
                  />
                </div>
              ) : (
                <RoomCanvas
                  template={template}
                  assign={assign}
                  daylight={daylight}
                  showOriginal={showOriginal}
                  active={active}
                  hover={hover}
                  onPick={(x, y) => {
                    const id = pick(x, y);
                    if (id) setActive(id);
                  }}
                  onHover={(x, y) => setHover(pick(x, y))}
                  onLeave={() => setHover(null)}
                  caption={
                    showOriginal
                      ? 'Original'
                      : activeSurface
                        ? `Editing: ${activeSurface.label}`
                        : undefined
                  }
                  priority
                />
              )}

              {/* Under-canvas controls */}
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {!comparing && (
                  <label className="flex items-center gap-2 text-body-s text-ink-muted">
                    <Switch
                      checked={showOriginal}
                      onCheckedChange={setShowOriginal}
                      aria-label="Show original photo"
                    />
                    {showOriginal ? (
                      <EyeOff className="size-4" aria-hidden />
                    ) : (
                      <Eye className="size-4" aria-hidden />
                    )}{' '}
                    Original
                  </label>
                )}
                <div
                  className="flex flex-wrap items-center gap-1.5"
                  role="group"
                  aria-label="Time of day"
                >
                  <Sun className="size-4 text-ink-muted" aria-hidden />
                  {DAYLIGHT.map((d) => (
                    <Chip
                      key={d.value}
                      size="sm"
                      selected={daylight === d.value}
                      onClick={() => patchVariant({ daylight: d.value })}
                    >
                      {d.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Surface strip */}
              <ol className="mt-4 flex snap-x gap-2 overflow-x-auto pb-2" aria-label="Surfaces">
                {template.surfaces.map((s) => {
                  const m = assign[s.id] ? byMaterial.get(assign[s.id]!) : undefined;
                  return (
                    <li key={s.id} className="snap-start">
                      <button
                        type="button"
                        onClick={() => setActive(s.id)}
                        aria-pressed={active === s.id}
                        className={cn(
                          'flex w-40 items-center gap-2 rounded-md border p-2 text-left transition-colors',
                          active === s.id
                            ? 'border-accent bg-accent-soft/40'
                            : 'border-line bg-surface hover:bg-surface-sunk',
                        )}
                      >
                        <span
                          className="size-9 shrink-0 overflow-hidden rounded-sm border border-line"
                          style={{ backgroundColor: m?.hex ?? 'transparent' }}
                        >
                          {m && !m.hex && <Img image={m.swatch} aspect="1 / 1" sizes="36px" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-caption font-medium text-ink">
                            {s.label}
                          </span>
                          <span className="block truncate text-caption text-ink-muted">
                            {m?.name ?? 'Untouched'}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Material picker */}
            <aside className="flex max-h-[80vh] flex-col rounded-lg border border-line bg-surface lg:sticky lg:top-24">
              <div className="border-b border-line p-4">
                <p className="overline">
                  {activeSurface ? titleCase(activeSurface.surfaceType) : 'Surface'}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-h3 text-ink">
                    {activeSurface?.label ?? 'Pick a surface'}
                  </h2>
                  {activeSurface && assign[activeSurface.id] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAssign((a) => ({ ...a, [activeSurface.id]: undefined }))}
                    >
                      <X className="size-4" aria-hidden /> Clear
                    </Button>
                  )}
                </div>
                <Input
                  className="mt-3"
                  placeholder="Search materials"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  leading={<Search className="size-4" aria-hidden />}
                  aria-label="Search materials"
                />
              </div>
              <ul
                className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto p-4"
                aria-label="Materials"
              >
                {candidates.map((m) => {
                  const selected = activeSurface ? assign[activeSurface.id] === m.slug : false;
                  return (
                    <li key={m.slug}>
                      <button
                        type="button"
                        onClick={() =>
                          activeSurface && setAssign((a) => ({ ...a, [activeSurface.id]: m.slug }))
                        }
                        aria-pressed={selected}
                        title={m.name}
                        className={cn(
                          'group relative block w-full overflow-hidden rounded-md border text-left transition-shadow',
                          selected
                            ? 'border-accent ring-2 ring-accent'
                            : 'border-line hover:shadow-sm',
                        )}
                      >
                        <span
                          className="block aspect-square w-full"
                          style={{ backgroundColor: m.hex ?? undefined }}
                        >
                          {!m.hex && <Img image={m.swatch} aspect="1 / 1" sizes="120px" />}
                        </span>
                        {selected && (
                          <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-accent text-canvas">
                            <Check className="size-3" aria-hidden />
                          </span>
                        )}
                        <span className="block p-1.5">
                          <span className="block truncate text-caption font-medium text-ink">
                            {m.name}
                          </span>
                          <span className="block truncate text-[11px] text-ink-muted">
                            {m.price
                              ? `${formatInr(m.price.min)}–${formatInr(m.price.max)}/${m.price.unit}`
                              : titleCase(m.category)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
                {candidates.length === 0 && (
                  <li className="col-span-3 py-8 text-center text-body-s text-ink-muted">
                    No materials match.
                  </li>
                )}
              </ul>
              <div className="grid gap-2 border-t border-line p-4">
                <Button asChild variant="outline" fullWidth>
                  <Link href={estimateHref}>
                    <Calculator className="size-4" aria-hidden /> Estimate with these materials
                  </Link>
                </Button>
                <WhatsAppButton
                  fullWidth
                  label="Send to a designer"
                  message={messages.visualiser({
                    url: typeof window === 'undefined' ? '' : shareUrl(),
                    spec,
                  })}
                />
              </div>
            </aside>
          </div>

          {/* Summary */}
          {chosen.length > 0 && (
            <section
              className="mt-8 rounded-lg border border-line bg-surface p-5"
              aria-label="Materials in this design"
            >
              <p className="overline">In {variant.name}</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {chosen.map((c) => (
                  <li key={c.surface.id} className="flex items-center gap-3 text-body-s">
                    <span
                      className="size-8 shrink-0 overflow-hidden rounded-sm border border-line"
                      style={{ backgroundColor: c.material.hex ?? 'transparent' }}
                    >
                      {!c.material.hex && (
                        <Img image={c.material.swatch} aspect="1 / 1" sizes="32px" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-ink">
                        <span className="text-ink-muted">{c.surface.label}: </span>
                        <Link
                          href={`/materials/${c.material.slug}/`}
                          className="underline-offset-2 hover:underline"
                        >
                          {c.material.name}
                        </Link>
                      </span>
                      <span className="block text-caption text-ink-muted">
                        {titleCase(c.material.category)} · {titleCase(c.material.tier)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="mt-4 text-caption text-ink-subtle">
            Colours are indicative; screens vary. Order a physical sample before you commit —{' '}
            <Link href="/materials/" className="underline">
              every material page has a sample button
            </Link>
            .
          </p>
        </Container>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas                                                              */
/* ------------------------------------------------------------------ */

interface RoomCanvasProps {
  template: RoomTemplate;
  assign: Assignments;
  daylight: DaylightPreset;
  showOriginal?: boolean;
  active?: string;
  hover?: string | null;
  caption?: string;
  priority?: boolean;
  onPick?: (nx: number, ny: number) => void;
  onHover?: (nx: number, ny: number) => void;
  onLeave?: () => void;
}

function RoomCanvas({
  template,
  assign,
  daylight,
  showOriginal,
  active,
  hover,
  caption,
  priority,
  onPick,
  onHover,
  onLeave,
}: RoomCanvasProps) {
  const light = DAYLIGHT.find((d) => d.value === daylight) ?? DAYLIGHT[1]!;
  const interactive = Boolean(onPick);
  const norm = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height] as const;
  };
  const highlight = (id: string | null | undefined, colour: string) => {
    const s = template.surfaces.find((x) => x.id === id);
    if (!s) return null;
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-colors duration-200"
        style={{ ...maskStyle(s), backgroundColor: colour, zIndex: 20 }}
      />
    );
  };

  return (
    <div
      className="relative isolate overflow-hidden rounded-lg border border-line bg-black"
      style={{ aspectRatio: `${template.baseImage.width} / ${template.baseImage.height}` }}
    >
      <Img
        image={template.baseImage}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 70vw, 100vw"
        className="absolute inset-0"
        imgClassName="h-full w-full object-cover"
      />

      {!showOriginal &&
        template.surfaces.map((s) => {
          const m = assign[s.id] ? byMaterial.get(assign[s.id]!) : undefined;
          return m ? (
            <SurfaceLayer
              key={s.id}
              surface={s}
              material={m}
              base={imgSrc(template.baseImage, 1200)}
            />
          ) : null;
        })}

      {light.opacity > 0 && !showOriginal && (
        <div
          className="pointer-events-none absolute inset-0 transition-colors duration-700"
          style={{
            backgroundColor: light.tint,
            opacity: light.opacity,
            mixBlendMode:
              daylight === 'night' || daylight === 'evening' ? 'multiply' : 'soft-light',
            zIndex: 15,
          }}
          aria-hidden
        />
      )}

      {interactive && !showOriginal && (
        <>
          {hover && hover !== active && highlight(hover, 'rgba(255,255,255,0.16)')}
          {highlight(active, 'rgba(201,162,107,0.22)')}
        </>
      )}

      {interactive && (
        <div
          className="absolute inset-0 z-30 cursor-pointer"
          onClick={(e) => onPick?.(...norm(e))}
          onPointerMove={(e) => onHover?.(...norm(e))}
          onPointerLeave={onLeave}
          aria-hidden
        />
      )}

      {caption && (
        <div className="pointer-events-none absolute top-3 left-3 z-40">
          <Badge tone={showOriginal ? 'neutral' : 'accent'}>{caption}</Badge>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function maskStyle(surface: SurfaceMask): React.CSSProperties {
  return {
    WebkitMaskImage: `url(${surface.maskSrc})`,
    maskImage: `url(${surface.maskSrc})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  };
}

/**
 * A flat fill of the chosen material, then the room's own shading blended back over it so the surface
 * keeps its light falloff instead of looking like a sticker.
 */
function SurfaceLayer({
  surface,
  material,
  base,
}: {
  surface: SurfaceMask;
  material: Material;
  base: string;
}) {
  const tile = material.texture ? `${material.texture.albedo}.webp` : imgSrc(material.swatch, 400);
  const scale = material.texture ? Math.max(12, Math.min(40, material.texture.scaleCm / 3)) : 18;
  const isPlainColour =
    Boolean(material.hex) &&
    (material.category === 'PAINT' ||
      material.category === 'PU_FINISH' ||
      material.category === 'ACRYLIC');
  // Materials that carry a colour keep it; their texture only adds grain. Texture-only materials show the texture itself.
  const grainOnly = Boolean(material.hex) && !isPlainColour;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ ...maskStyle(surface), zIndex: 1 + surface.orderIndex, transition: 'opacity 300ms' }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: material.hex ?? '#bcb7ae',
          backgroundImage: isPlainColour || grainOnly ? undefined : `url(${tile})`,
          backgroundSize: isPlainColour || grainOnly ? undefined : `${scale}%`,
          backgroundRepeat: 'repeat',
        }}
      />
      {grainOnly && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${tile})`,
            backgroundSize: `${scale}%`,
            backgroundRepeat: 'repeat',
            filter: 'grayscale(1)',
            mixBlendMode: 'overlay',
            opacity: 0.5,
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${base})`,
          backgroundSize: '100% 100%',
          filter: 'grayscale(1) contrast(1.15)',
          mixBlendMode: 'overlay',
          opacity: 0.6,
        }}
      />
    </div>
  );
}

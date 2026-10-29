'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Download,
  Palette,
  Scale,
  Sparkles,
} from 'lucide-react';

import { Container, Section } from '@/components/layout';
import { CtaBand, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge, Chip } from '@/components/ui/display';
import { Checkbox, SimpleSelect, Slider, Switch } from '@/components/ui/form-controls';
import { Field, Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { getMaterial, indoreLocalities, nearbyCities } from '@/data/demo';
import { getAdapters } from '@/lib/adapters';
import {
  defaultInput,
  estimate,
  estimateAllTiers,
  formatWeeks,
  FULL_HOME_ROOMS,
  labelRoom,
  TYPICAL_CARPET_SQFT,
} from '@/lib/pricing';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { cn, downloadBlob, formatInr, formatInrCompact, formatNumber, uid } from '@/lib/utils';
import { messages } from '@/lib/whatsapp';
import type { Bhk, PropertyType, Tier } from '@/types/content';
import type { EstimateCategory, EstimateInput, EstimateResult } from '@/types/local';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const BHKS: Bhk[] = ['1BHK', '2BHK', '3BHK', '4BHK+'];
const TIERS: { value: Tier; label: string; blurb: string }[] = [
  { value: 'ESSENTIAL', label: 'Essential', blurb: 'Laminate, basic hardware, clean lines' },
  { value: 'STANDARD', label: 'Standard', blurb: 'Soft-close, better veneers, false ceiling' },
  { value: 'PREMIUM', label: 'Premium', blurb: 'PU / acrylic, quartz tops, layered lighting' },
  { value: 'LUXURY', label: 'Luxury', blurb: 'Natural stone, bespoke joinery, automation' },
];
const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'VILLA', label: 'Villa / bungalow' },
  { value: 'DUPLEX', label: 'Duplex / penthouse' },
  { value: 'FARMHOUSE', label: 'Farmhouse' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'CLINIC', label: 'Clinic' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'RESTAURANT', label: 'Restaurant / café' },
];
const ALL_ROOMS = [
  'living',
  'dining',
  'kitchen',
  'master-bedroom',
  'bedroom',
  'kids-room',
  'parents-room',
  'guest-room',
  'study',
  'pooja',
  'foyer',
  'bathroom',
  'balcony',
  'utility',
];
const KITCHEN_LAYOUTS: NonNullable<EstimateInput['kitchen']>['layout'][] = [
  'STRAIGHT',
  'L',
  'U',
  'PARALLEL',
  'ISLAND',
];
const CATEGORY_LABELS: Record<EstimateCategory, string> = {
  MODULAR: 'Modular (kitchen, wardrobes, units)',
  LOOSE_FURNITURE: 'Loose furniture',
  FALSE_CEILING: 'False ceiling',
  PAINTING: 'Painting',
  ELECTRICAL: 'Electrical & lighting',
  CIVIL: 'Civil & plumbing',
  DECOR: 'Décor & soft furnishing',
  DESIGN_FEE: 'Design fee',
  EXECUTION: 'Execution & site management',
};
const STEPS = ['Your home', 'Rooms', 'Kitchen & wardrobes', 'Extras & finish'] as const;

/* ------------------------------------------------------------------ */
/* Prefill from URL                                                    */
/* ------------------------------------------------------------------ */

function inputFromParams(params: URLSearchParams): EstimateInput {
  const bhkParam = params.get('bhk');
  const bhk = BHKS.includes(bhkParam as Bhk) ? (bhkParam as Bhk) : '2BHK';
  const tierParam = params.get('tier');
  const tier = TIERS.some((t) => t.value === tierParam) ? (tierParam as Tier) : 'STANDARD';
  const sqft = Number(params.get('sqft'));
  const locality = params.get('locality') ?? '';
  const roomsParam = params.get('rooms');
  const rooms = roomsParam ? roomsParam.split(',').filter((r) => ALL_ROOMS.includes(r)) : undefined;
  const materialsParam = params.get('materials');
  const visualiserMaterialSlugs = materialsParam
    ? materialsParam.split(',').filter(Boolean).slice(0, 32)
    : undefined;

  return defaultInput({
    bhk,
    tier,
    locality,
    carpetAreaSqft: sqft >= 200 && sqft <= 20000 ? Math.round(sqft) : TYPICAL_CARPET_SQFT[bhk],
    ...(rooms && rooms.length ? { rooms, fullHome: false } : {}),
    ...(visualiserMaterialSlugs ? { visualiserMaterialSlugs } : {}),
  });
}

/* ------------------------------------------------------------------ */
/* Wizard                                                              */
/* ------------------------------------------------------------------ */

export function EstimateWizard() {
  const params = useSearchParams();
  const { toast } = useToast();
  const [input, setInput] = React.useState<EstimateInput>(() => inputFromParams(params));
  const [step, setStep] = React.useState(0);
  const [compare, setCompare] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const result = React.useMemo(() => estimate(input), [input]);
  const [pdfBusy, setPdfBusy] = React.useState(false);
  const [linesOpen, setLinesOpen] = React.useState(false);
  /** Line ids whose price moved on the last change, with the direction (+1 up, -1 down). */
  const [changed, setChanged] = React.useState<Record<string, 1 | -1>>({});
  const prevResult = React.useRef<EstimateResult>(result);
  React.useEffect(() => {
    const before = new Map(prevResult.current.lines.map((l) => [l.id, l]));
    const moved: Record<string, 1 | -1> = {};
    for (const l of result.lines) {
      const old = before.get(l.id);
      if (!old) moved[l.id] = 1;
      else if (l.high !== old.high || l.low !== old.low) moved[l.id] = l.high > old.high ? 1 : -1;
    }
    prevResult.current = result;
    setChanged(moved);
    if (Object.keys(moved).length > 0) setLinesOpen(true);
  }, [result]);
  const tiers = React.useMemo(() => (compare ? estimateAllTiers(input) : null), [compare, input]);

  const update = (patch: Partial<EstimateInput>) => {
    setSaved(false);
    setInput((prev) => ({ ...prev, ...patch }));
  };

  const setBhk = (bhk: Bhk) => {
    const fresh = defaultInput({
      bhk,
      tier: input.tier,
      locality: input.locality,
      nature: input.nature,
    });
    update({
      bhk,
      carpetAreaSqft: TYPICAL_CARPET_SQFT[bhk],
      rooms: FULL_HOME_ROOMS[bhk],
      fullHome: true,
      bathrooms: fresh.bathrooms,
      wardrobes: fresh.wardrobes,
      kitchen: fresh.kitchen,
      extras: { ...input.extras, falseCeilingSqft: fresh.extras.falseCeilingSqft },
    });
  };

  const toggleRoom = (room: string) => {
    const has = input.rooms.includes(room);
    const rooms = has ? input.rooms.filter((r) => r !== room) : [...input.rooms, room];
    const full = FULL_HOME_ROOMS[input.bhk].every((r) => rooms.includes(r));
    update({ rooms, fullHome: full });
  };

  const save = async () => {
    try {
      await getAdapters().user.saveEstimate({
        id: uid('est_'),
        name: `${input.bhk} · ${TIERS.find((t) => t.value === input.tier)?.label} · ${formatNumber(input.carpetAreaSqft)} sq ft`,
        input,
        result,
        priceBookVersion: result.priceBookVersion,
        createdAt: Date.now(),
      });
      setSaved(true);
      toast({
        title: 'Estimate saved',
        description: 'Find it any time under My dashboard.',
        tone: 'success',
      });
    } catch {
      toast({
        title: 'Could not save',
        description: 'Your browser blocked local storage.',
        tone: 'danger',
      });
    }
  };

  const tierLabel = TIERS.find((t) => t.value === input.tier)?.label ?? input.tier;
  const consultHref = `/consultation/?bhk=${encodeURIComponent(input.bhk)}&note=${encodeURIComponent(
    `Estimate ${formatInrCompact(result.total.low)}-${formatInrCompact(result.total.high)} (${tierLabel}, ${formatNumber(input.carpetAreaSqft)} sq ft)`,
  )}`;

  const downloadPdf = async () => {
    setPdfBusy(true);
    try {
      const [{ pdf }, { EstimatePdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./estimate-pdf'),
      ]);
      const blob = await pdf(
        <EstimatePdf input={input} result={result} tierLabel={tierLabel} />,
      ).toBlob();
      downloadBlob(blob, `estimate-${input.bhk.toLowerCase()}-${tierLabel.toLowerCase()}.pdf`);
    } catch {
      toast({
        title: 'Could not create the PDF',
        description: 'Try again, or send the range to us on WhatsApp.',
        tone: 'danger',
      });
    } finally {
      setPdfBusy(false);
    }
  };

  const localityOptions = [
    { value: '__none', label: 'Not sure yet / other' },
    ...indoreLocalities.map((l) => ({ value: l.slug, label: l.name })),
    ...nearbyCities.map((l) => ({ value: l.slug, label: `${l.name} (city)` })),
  ];

  const waMessage = messages.estimate({
    low: formatInrCompact(result.total.low),
    high: formatInrCompact(result.total.high),
    bhk: input.bhk,
    sqft: input.carpetAreaSqft,
    tier: input.tier,
  });

  const pickedMaterials = (input.visualiserMaterialSlugs ?? [])
    .map((s) => getMaterial(s))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Cost estimator', href: '/estimate/' },
        ])}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Cost estimator' }]}
        overline="Cost estimator"
        title="An honest range for your home, in about three minutes"
        description="Built on our Indore price book. Change anything and the number updates instantly — nothing is sent anywhere until you choose to share it."
        className="pb-6 md:pb-8"
      />

      <Section className="pt-0 md:pt-0">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* ---------------------------- Wizard ---------------------------- */}
          <div className="rounded-lg border border-line bg-surface p-5 sm:p-7">
            <ol className="mb-6 flex flex-wrap gap-2" aria-label="Steps">
              {STEPS.map((label, i) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    aria-current={step === i ? 'step' : undefined}
                    className={cn(
                      'inline-flex h-8 items-center gap-2 rounded-full border px-3 text-caption font-medium transition-colors',
                      step === i
                        ? 'border-ink bg-ink text-canvas'
                        : i < step
                          ? 'border-forest/40 bg-forest/10 text-forest'
                          : 'border-line text-ink-muted hover:bg-surface-sunk',
                    )}
                  >
                    <span className="tabular">{i + 1}</span> {label}
                    {i < step && <Check className="size-3.5" aria-hidden />}
                  </button>
                </li>
              ))}
            </ol>

            {step === 0 && (
              <div className="grid gap-6">
                <fieldset className="grid gap-2">
                  <legend className="text-body-s font-medium text-ink">Home size</legend>
                  <div className="flex flex-wrap gap-2">
                    {BHKS.map((b) => (
                      <Chip key={b} selected={input.bhk === b} onClick={() => setBhk(b)}>
                        {b}
                      </Chip>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-2">
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="est-area" className="text-body-s font-medium text-ink">
                      Carpet area
                    </label>
                    <span className="tabular text-body-s text-ink-muted">
                      {formatNumber(input.carpetAreaSqft)} sq ft
                    </span>
                  </div>
                  <Slider
                    id="est-area"
                    thumbLabels={['Carpet area in square feet']}
                    min={300}
                    max={6000}
                    step={25}
                    value={[input.carpetAreaSqft]}
                    onValueChange={([v]) => v !== undefined && update({ carpetAreaSqft: v })}
                    formatValue={(v) => `${formatNumber(v)} sq ft`}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="est-type" label="Property type">
                    {(a) => (
                      <SimpleSelect
                        {...a}
                        value={input.propertyType}
                        onValueChange={(v) => update({ propertyType: v as PropertyType })}
                        options={PROPERTY_TYPES}
                      />
                    )}
                  </Field>
                  <Field
                    id="est-locality"
                    label="Locality"
                    hint="Adjusts for labour and logistics in your area."
                  >
                    {(a) => (
                      <SimpleSelect
                        {...a}
                        value={input.locality || '__none'}
                        onValueChange={(v) => update({ locality: v === '__none' ? '' : v })}
                        options={localityOptions}
                      />
                    )}
                  </Field>
                </div>

                <fieldset className="grid gap-2">
                  <legend className="text-body-s font-medium text-ink">Nature of work</legend>
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      selected={input.nature === 'NEW'}
                      onClick={() => update({ nature: 'NEW' })}
                    >
                      New / bare-shell
                    </Chip>
                    <Chip
                      selected={input.nature === 'RENOVATION'}
                      onClick={() => update({ nature: 'RENOVATION' })}
                    >
                      Renovation
                    </Chip>
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="est-baths" label="Bathrooms">
                    {(a) => (
                      <Input
                        {...a}
                        type="number"
                        min={0}
                        max={10}
                        value={input.bathrooms}
                        onChange={(e) =>
                          update({ bathrooms: clamp(Number(e.target.value), 0, 10) })
                        }
                      />
                    )}
                  </Field>
                  <Field id="est-balconies" label="Balconies">
                    {(a) => (
                      <Input
                        {...a}
                        type="number"
                        min={0}
                        max={6}
                        value={input.balconies}
                        onChange={(e) => update({ balconies: clamp(Number(e.target.value), 0, 6) })}
                      />
                    )}
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-6">
                <div className="flex items-center justify-between gap-4 rounded-md bg-surface-sunk p-4">
                  <div>
                    <p className="font-medium text-ink">Full-home scope</p>
                    <p className="text-caption text-ink-muted">
                      Everything typical for a {input.bhk}. Switch off to pick rooms.
                    </p>
                  </div>
                  <Switch
                    checked={input.fullHome}
                    onCheckedChange={(on) =>
                      update(
                        on
                          ? { fullHome: true, rooms: FULL_HOME_ROOMS[input.bhk] }
                          : { fullHome: false },
                      )
                    }
                    aria-label="Full-home scope"
                  />
                </div>
                <fieldset className="grid gap-2">
                  <legend className="text-body-s font-medium text-ink">Rooms in scope</legend>
                  <div className="flex flex-wrap gap-2">
                    {ALL_ROOMS.map((room) => (
                      <Chip
                        key={room}
                        selected={input.rooms.includes(room)}
                        onClick={() => toggleRoom(room)}
                      >
                        {labelRoom(room)}
                      </Chip>
                    ))}
                  </div>
                  {input.rooms.length === 0 && (
                    <p className="text-caption text-danger">Pick at least one room to estimate.</p>
                  )}
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-8">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-h3 text-ink">Modular kitchen</h3>
                    <Switch
                      checked={Boolean(input.kitchen)}
                      onCheckedChange={(on) =>
                        update({
                          kitchen: on ? defaultInput({ bhk: input.bhk }).kitchen : undefined,
                        })
                      }
                      aria-label="Include modular kitchen"
                    />
                  </div>
                  {input.kitchen && (
                    <>
                      <fieldset className="grid gap-2">
                        <legend className="text-body-s font-medium text-ink">Layout</legend>
                        <div className="flex flex-wrap gap-2">
                          {KITCHEN_LAYOUTS.map((l) => (
                            <Chip
                              key={l}
                              size="sm"
                              selected={input.kitchen?.layout === l}
                              onClick={() => update({ kitchen: { ...input.kitchen!, layout: l } })}
                            >
                              {l === 'L' || l === 'U'
                                ? `${l}-shaped`
                                : l.charAt(0) + l.slice(1).toLowerCase()}
                            </Chip>
                          ))}
                        </div>
                      </fieldset>
                      <div className="grid gap-2">
                        <div className="flex items-baseline justify-between">
                          <label htmlFor="est-krft" className="text-body-s font-medium text-ink">
                            Counter length
                          </label>
                          <span className="tabular text-body-s text-ink-muted">
                            {input.kitchen.runningFeet} running ft
                          </span>
                        </div>
                        <Slider
                          id="est-krft"
                          thumbLabels={['Kitchen counter length in running feet']}
                          min={6}
                          max={30}
                          step={1}
                          value={[input.kitchen.runningFeet]}
                          onValueChange={([v]) =>
                            v !== undefined &&
                            update({ kitchen: { ...input.kitchen!, runningFeet: v } })
                          }
                          formatValue={(v) => `${v} rft`}
                        />
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <CheckRow
                          id="est-chimney"
                          label="Chimney & hob"
                          checked={input.kitchen.chimneyHob}
                          onChange={(v) =>
                            update({ kitchen: { ...input.kitchen!, chimneyHob: v } })
                          }
                        />
                        <CheckRow
                          id="est-tall"
                          label="Tall / pantry unit"
                          checked={input.kitchen.tallUnit}
                          onChange={(v) => update({ kitchen: { ...input.kitchen!, tallUnit: v } })}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="grid gap-4">
                  <h3 className="font-display text-h3 text-ink">Wardrobes</h3>
                  {input.wardrobes.length === 0 && (
                    <p className="text-body-s text-ink-muted">No wardrobes in scope.</p>
                  )}
                  <ul className="grid gap-3">
                    {input.wardrobes.map((w, i) => (
                      <li
                        key={`${w.bedroom}-${i}`}
                        className="grid gap-3 rounded-md border border-line p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                      >
                        <div>
                          <p className="font-medium text-ink">{labelRoom(w.bedroom)}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <label htmlFor={`est-w-${i}`} className="text-caption text-ink-muted">
                              Width
                            </label>
                            <Input
                              id={`est-w-${i}`}
                              type="number"
                              min={3}
                              max={20}
                              className="h-9 w-24"
                              value={w.runningFeet}
                              onChange={(e) => {
                                const next = [...input.wardrobes];
                                next[i] = {
                                  ...w,
                                  runningFeet: clamp(Number(e.target.value), 3, 20),
                                };
                                update({ wardrobes: next });
                              }}
                            />
                            <span className="text-caption text-ink-muted">rft</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Chip
                            size="sm"
                            selected={w.type === 'OPENABLE'}
                            onClick={() => {
                              const next = [...input.wardrobes];
                              next[i] = { ...w, type: 'OPENABLE' };
                              update({ wardrobes: next });
                            }}
                          >
                            Openable
                          </Chip>
                          <Chip
                            size="sm"
                            selected={w.type === 'SLIDING'}
                            onClick={() => {
                              const next = [...input.wardrobes];
                              next[i] = { ...w, type: 'SLIDING' };
                              update({ wardrobes: next });
                            }}
                          >
                            Sliding
                          </Chip>
                        </div>
                        <CheckRow
                          id={`est-loft-${i}`}
                          label="Loft"
                          checked={w.loft}
                          onChange={(v) => {
                            const next = [...input.wardrobes];
                            next[i] = { ...w, loft: v };
                            update({ wardrobes: next });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="sm:col-span-3 sm:justify-self-end"
                          onClick={() =>
                            update({ wardrobes: input.wardrobes.filter((_, j) => j !== i) })
                          }
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        update({
                          wardrobes: [
                            ...input.wardrobes,
                            {
                              bedroom: 'bedroom',
                              runningFeet: 6,
                              type: 'OPENABLE',
                              finish: 'laminate',
                              loft: true,
                            },
                          ],
                        })
                      }
                    >
                      Add a wardrobe
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-8">
                <div className="grid gap-3">
                  <h3 className="font-display text-h3 text-ink">Extras</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ['tvUnit', 'TV unit'],
                        ['crockeryUnit', 'Crockery unit'],
                        ['poojaUnit', 'Pooja unit'],
                        ['sofa', 'Sofa (loose)'],
                        ['dining', 'Dining set (loose)'],
                        ['painting', 'Painting (whole scope)'],
                        ['electrical', 'Electrical & lighting'],
                        ['plumbing', 'Plumbing changes'],
                        ['civil', 'Civil / wall changes'],
                      ] as const
                    ).map(([key, label]) => (
                      <CheckRow
                        key={key}
                        id={`est-x-${key}`}
                        label={label}
                        checked={input.extras[key]}
                        onChange={(v) => update({ extras: { ...input.extras, [key]: v } })}
                      />
                    ))}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="est-ceiling"
                      label="False ceiling area"
                      hint="sq ft — roughly 40% of carpet area is typical"
                    >
                      {(a) => (
                        <Input
                          {...a}
                          type="number"
                          min={0}
                          max={input.carpetAreaSqft}
                          value={input.extras.falseCeilingSqft}
                          onChange={(e) =>
                            update({
                              extras: {
                                ...input.extras,
                                falseCeilingSqft: clamp(
                                  Number(e.target.value),
                                  0,
                                  input.carpetAreaSqft,
                                ),
                              },
                            })
                          }
                        />
                      )}
                    </Field>
                    <Field id="est-beds" label="Beds (loose)">
                      {(a) => (
                        <Input
                          {...a}
                          type="number"
                          min={0}
                          max={8}
                          value={input.extras.beds}
                          onChange={(e) =>
                            update({
                              extras: {
                                ...input.extras,
                                beds: clamp(Number(e.target.value), 0, 8),
                              },
                            })
                          }
                        />
                      )}
                    </Field>
                  </div>
                </div>

                <fieldset className="grid gap-3">
                  <legend className="font-display text-h3 text-ink">Finish tier</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {TIERS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => update({ tier: t.value })}
                        aria-pressed={input.tier === t.value}
                        className={cn(
                          'rounded-md border p-4 text-left transition-colors',
                          input.tier === t.value
                            ? 'border-ink bg-ink text-canvas'
                            : 'border-line bg-surface hover:bg-surface-sunk',
                        )}
                      >
                        <p className="font-medium">{t.label}</p>
                        <p
                          className={cn(
                            'mt-1 text-caption',
                            input.tier === t.value ? 'text-canvas/80' : 'text-ink-muted',
                          )}
                        >
                          {t.blurb}
                        </p>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="grid gap-2">
                  <legend className="text-body-s font-medium text-ink">Vastu alignment</legend>
                  <div className="flex flex-wrap gap-2">
                    {(['NONE', 'BASIC', 'STRICT'] as const).map((v) => (
                      <Chip
                        key={v}
                        size="sm"
                        selected={input.vastu === v}
                        onClick={() => update({ vastu: v })}
                      >
                        {v === 'NONE' ? 'Not needed' : v.charAt(0) + v.slice(1).toLowerCase()}
                      </Chip>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="size-4" aria-hidden /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
                  Next <ArrowRight className="size-4" aria-hidden />
                </Button>
              ) : (
                <Button onClick={save} disabled={saved}>
                  <Bookmark className="size-4" aria-hidden />{' '}
                  {saved ? 'Saved' : 'Save this estimate'}
                </Button>
              )}
            </div>
          </div>

          {/* ---------------------------- Result ---------------------------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-line bg-surface p-5 sm:p-7" aria-live="polite">
              <p className="overline">Your range, incl. GST</p>
              <p className="tabular mt-2 font-display text-h1 text-ink sm:text-display-l">
                {formatInrCompact(result.total.low)} – {formatInrCompact(result.total.high)}
              </p>
              <p className="mt-2 text-body-s text-ink-muted">
                {input.bhk} · {formatNumber(input.carpetAreaSqft)} sq ft ·{' '}
                {TIERS.find((t) => t.value === input.tier)?.label} · {input.rooms.length} room
                {input.rooms.length === 1 ? '' : 's'}
                {result.localityMultiplier !== 1 &&
                  ` · locality ×${result.localityMultiplier.toFixed(2)}`}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-4 rounded-md bg-surface-sunk p-4 text-body-s">
                <div>
                  <dt className="text-ink-muted">Timeline</dt>
                  <dd className="font-medium text-ink">{formatWeeks(result.timelineWeeks)}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">EMI (36 mo)</dt>
                  <dd className="tabular font-medium text-ink">
                    {formatInrCompact(result.emi.find((e) => e.months === 36)?.low ?? 0)}–
                    {formatInrCompact(result.emi.find((e) => e.months === 36)?.high ?? 0)}/mo
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Subtotal</dt>
                  <dd className="tabular font-medium text-ink">
                    {formatInrCompact(result.subtotal.low)}–{formatInrCompact(result.subtotal.high)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted">GST</dt>
                  <dd className="tabular font-medium text-ink">
                    {formatInrCompact(result.gst.low)}–{formatInrCompact(result.gst.high)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <WhatsAppButton message={waMessage} label="Discuss on WhatsApp" />
                <Button
                  variant="outline"
                  onClick={() => setCompare((c) => !c)}
                  aria-pressed={compare}
                >
                  <Scale className="size-4" aria-hidden />{' '}
                  {compare ? 'Hide tiers' : 'Compare tiers'}
                </Button>
                <Button variant="outline" onClick={downloadPdf} loading={pdfBusy}>
                  <Download className="size-4" aria-hidden /> Download PDF
                </Button>
                <Button asChild variant="ghost">
                  <Link href={consultHref}>Book a consultation</Link>
                </Button>
              </div>

              {tiers && (
                <div className="mt-5 grid gap-2">
                  {TIERS.map((t) => {
                    const r = tiers[t.value];
                    const active = t.value === input.tier;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => update({ tier: t.value })}
                        className={cn(
                          'flex items-center justify-between rounded-md border px-3 py-2 text-left text-body-s transition-colors',
                          active
                            ? 'border-ink bg-ink text-canvas'
                            : 'border-line hover:bg-surface-sunk',
                        )}
                      >
                        <span>{t.label}</span>
                        <span className="tabular">
                          {formatInrCompact(r.total.low)} – {formatInrCompact(r.total.high)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <details className="group mt-4 rounded-lg border border-line bg-surface">
              <summary className="cursor-pointer list-none px-5 py-4 font-medium text-ink marker:content-none">
                By category
                <span className="float-right text-ink-muted transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <ul className="grid gap-2 border-t border-line px-5 py-4 text-body-s">
                {result.byCategory
                  .filter((c) => c.high > 0)
                  .map((c) => {
                    const pct = result.subtotal.high
                      ? Math.round((c.high / result.subtotal.high) * 100)
                      : 0;
                    return (
                      <li key={c.category} className="grid gap-1">
                        <div className="flex justify-between gap-3">
                          <span className="text-ink">{CATEGORY_LABELS[c.category]}</span>
                          <span className="tabular text-ink-muted">
                            {formatInrCompact(c.low)}–{formatInrCompact(c.high)}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunk">
                          <div
                            className="h-full rounded-full bg-accent transition-[width] duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </details>

            <details className="group mt-3 rounded-lg border border-line bg-surface">
              <summary className="cursor-pointer list-none px-5 py-4 font-medium text-ink marker:content-none">
                By room
                <span className="float-right text-ink-muted transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <ul className="grid gap-2 border-t border-line px-5 py-4 text-body-s">
                {result.byRoom.map((r) => (
                  <li key={r.room} className="flex justify-between gap-3">
                    <span className="text-ink">{labelRoom(r.room)}</span>
                    <span className="tabular text-ink-muted">
                      {formatInrCompact(r.low)}–{formatInrCompact(r.high)}
                    </span>
                  </li>
                ))}
              </ul>
            </details>

            <details
              className="group mt-3 rounded-lg border border-line bg-surface"
              open={linesOpen}
              onToggle={(e) => setLinesOpen(e.currentTarget.open)}
            >
              <summary className="cursor-pointer list-none px-5 py-4 font-medium text-ink marker:content-none">
                Line items ({result.lines.length})
                {Object.keys(changed).length > 0 && (
                  <span className="ml-2 text-caption font-normal text-accent">
                    {Object.keys(changed).length} changed
                  </span>
                )}
                <span className="float-right text-ink-muted transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <ul className="grid gap-1.5 border-t border-line px-5 py-4 text-caption">
                {result.lines.map((l) => (
                  <li
                    key={l.id}
                    className={cn(
                      'flex justify-between gap-3 rounded-sm px-1.5 py-0.5 transition-colors',
                      changed[l.id] && 'bg-accent-soft/50',
                    )}
                  >
                    <span className="text-ink">
                      {changed[l.id] && (
                        <span
                          className="mr-1 text-accent"
                          aria-label={changed[l.id] === 1 ? 'increased' : 'decreased'}
                        >
                          {changed[l.id] === 1 ? '▲' : '▼'}
                        </span>
                      )}
                      {l.label}
                      {l.qty !== undefined && l.unit && (
                        <span className="text-ink-subtle">
                          {' '}
                          · {formatNumber(l.qty)} {l.unit}
                        </span>
                      )}
                    </span>
                    <span className="tabular whitespace-nowrap text-ink-muted">
                      {formatInr(l.low)}–{formatInr(l.high)}
                    </span>
                  </li>
                ))}
              </ul>
            </details>

            {result.upgrades.length > 0 && (
              <div className="mt-4 rounded-lg border border-line bg-surface p-5">
                <p className="overline">Worth considering</p>
                <ul className="mt-3 grid gap-3">
                  {result.upgrades.slice(0, 4).map((u) => (
                    <li key={u.id} className="flex items-start justify-between gap-3 text-body-s">
                      <div>
                        <p className="font-medium text-ink">{u.label}</p>
                        <p className="text-caption text-ink-muted">{u.description}</p>
                      </div>
                      <Badge tone={u.delta >= 0 ? 'gold' : 'forest'} className="tabular shrink-0">
                        {u.delta >= 0 ? '+' : '−'}
                        {formatInrCompact(Math.abs(u.delta))}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pickedMaterials.length > 0 && (
              <div className="mt-4 rounded-lg border border-line bg-surface p-5">
                <p className="overline">
                  <Palette className="mr-1 inline size-3.5" aria-hidden /> From your visualiser
                  design
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pickedMaterials.map((m) => (
                    <Badge key={m.slug} tone="outline">
                      {m.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.exclusions.length > 0 && (
              <p className="mt-4 text-caption text-ink-subtle">
                Not included: {result.exclusions.join('; ')}. Price book {result.priceBookVersion}.
              </p>
            )}
          </aside>
        </Container>
      </Section>

      <CtaBand
        title="Want this range turned into a real quote?"
        description="A designer will walk your plan with you, confirm measurements and hand you a line-item proposal — the first consultation is free."
        whatsappMessage={waMessage}
        primary={{ label: 'Book a consultation', href: '/consultation/' }}
        secondary={{ label: 'Try the room visualiser', href: '/visualiser/' }}
      />
      <Section className="pt-0 md:pt-0">
        <Container className="text-center">
          <Button asChild variant="link">
            <Link href="/quiz/">
              <Sparkles className="size-4" aria-hidden /> Not sure about the finish? Take the style
              quiz
            </Link>
          </Button>
        </Container>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */

function CheckRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-body-s text-ink">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      {label}
    </label>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;
}

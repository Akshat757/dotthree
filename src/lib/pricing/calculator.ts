/**
 * Pure cost calculator — EstimateInput → EstimateResult (SRS FR-H, App 16.3).
 *
 * No React, no IO. All rates come from the price book; the only constants here
 * are scope heuristics (room weights by BHK, paintable-area factor) which are
 * documented inline. Every figure is rounded to the nearest ₹100.
 */
import type { Bhk, PriceBook, PropertyType, Tier } from '@/types/content';
import type { EstimateCategory, EstimateInput, EstimateLine, EstimateResult } from '@/types/local';

import { emiSchedule } from './emi';
import { timelineFor } from './timeline';

/** Wall + ceiling paintable area ≈ 3× carpet area (industry rule of thumb). */
export const PAINT_AREA_FACTOR = 3;

/** Rooms covered by a full-home scope, per BHK. Order = display order. */
export const FULL_HOME_ROOMS: Record<Bhk, string[]> = {
  '1BHK': ['living', 'kitchen', 'master-bedroom', 'bathroom'],
  '2BHK': ['living', 'dining', 'kitchen', 'master-bedroom', 'bedroom', 'bathroom'],
  '3BHK': [
    'living',
    'dining',
    'kitchen',
    'master-bedroom',
    'bedroom',
    'kids-room',
    'pooja',
    'foyer',
    'bathroom',
  ],
  '4BHK+': [
    'living',
    'dining',
    'kitchen',
    'master-bedroom',
    'bedroom',
    'kids-room',
    'study',
    'pooja',
    'foyer',
    'bathroom',
    'utility',
  ],
};

/** Typical carpet areas used when the user has not measured (sq ft). */
export const TYPICAL_CARPET_SQFT: Record<Bhk, number> = {
  '1BHK': 600,
  '2BHK': 950,
  '3BHK': 1400,
  '4BHK+': 2200,
};

const COMMERCIAL_TYPES: PropertyType[] = ['OFFICE', 'CLINIC', 'RETAIL', 'RESTAURANT'];
export const isCommercialType = (t: PropertyType) => COMMERCIAL_TYPES.includes(t);

/** Rooms that are "a bedroom" for weighting purposes. */
const BEDROOM_LIKE = new Set(['parents-room', 'guest-room']);

const r100 = (n: number) => Math.round(n / 100) * 100;

export interface CalcOptions {
  priceBook: PriceBook;
  /** Resolved from the locality name/slug by the caller (keeps this module pure). */
  localityMultiplier?: number;
}

function roomWeight(pb: PriceBook, room: string): number {
  const w = pb.rates.roomWeights;
  if (w[room] !== undefined) return w[room];
  if (BEDROOM_LIKE.has(room)) return w['bedroom'] ?? 0.12;
  return 0.08; // unknown / commercial sub-room
}

/* ------------------------------------------------------------------------ */

export function calculateEstimate(input: EstimateInput, opts: CalcOptions): EstimateResult {
  const pb = opts.priceBook;
  const { rates } = pb;
  const tier: Tier = input.tier;
  const area = Math.max(0, input.carpetAreaSqft || 0);
  const mult = opts.localityMultiplier ?? 1;
  const uplift = input.nature === 'RENOVATION' ? 1 + rates.renovationUplift : 1;
  const commercial = isCommercialType(input.propertyType);
  /** Item rate for the chosen tier; missing price-book items price at 0 (line is skipped). */
  const item = (key: string): number => rates.items[key]?.[tier] ?? 0;

  const works: EstimateLine[] = [];
  const push = (
    id: string,
    label: string,
    category: EstimateCategory,
    base: number,
    extra: Partial<Pick<EstimateLine, 'room' | 'qty' | 'unit'>> = {},
  ) => {
    if (base <= 0) return;
    const adj = base * mult * uplift;
    works.push({
      id,
      label,
      category,
      low: r100(adj * rates.rangeSpread.low),
      high: r100(adj * rates.rangeSpread.high),
      ...extra,
    });
  };

  /* ---- 1. Room base interiors (fixed furniture + finishes allowance) ---- */
  const fullSet = commercial ? [] : FULL_HOME_ROOMS[input.bhk];
  const selected = input.fullHome ? fullSet : dedupe(input.rooms);
  const fullWeight = fullSet.reduce((s, r) => s + roomWeight(pb, r), 0) || 1;
  const perSqft = rates.fullHomePerSqft[tier];

  if (commercial) {
    push('fitout', 'Commercial fit-out (per sq ft)', 'MODULAR', perSqft * area, {
      qty: area,
      unit: 'sq ft',
    });
  } else {
    for (const room of selected) {
      if (room === 'kitchen' && input.kitchen) continue; // specified separately
      if (room === 'balcony') continue; // priced per balcony below
      const share = roomWeight(pb, room) / fullWeight;
      push(`room-${room}`, `${labelRoom(room)} interiors`, 'MODULAR', perSqft * area * share, {
        room,
      });
    }
  }

  /* ---- 2. Modular kitchen ---------------------------------------------- */
  if (input.kitchen) {
    const k = input.kitchen;
    push(
      'kitchen-modular',
      `Modular kitchen (${k.layout}, ${k.runningFeet} rft)`,
      'MODULAR',
      rates.kitchenPerRft[tier] * k.runningFeet,
      {
        room: 'kitchen',
        qty: k.runningFeet,
        unit: 'rft',
      },
    );
    if (k.chimneyHob)
      push('kitchen-chimney', 'Chimney & hob installation', 'MODULAR', item('chimneyHobInstall'), {
        room: 'kitchen',
      });
    if (k.tallUnit)
      push('kitchen-tall', 'Tall unit / pantry', 'MODULAR', item('tallUnit'), { room: 'kitchen' });
  }

  /* ---- 3. Wardrobes ------------------------------------------------------ */
  input.wardrobes.forEach((w, i) => {
    const rate =
      w.type === 'SLIDING' ? rates.wardrobeSlidePerRft[tier] : rates.wardrobeOpenPerRft[tier];
    push(
      `wardrobe-${i}`,
      `${labelRoom(w.bedroom)} wardrobe (${w.type === 'SLIDING' ? 'sliding' : 'openable'}, ${w.runningFeet} rft)`,
      'MODULAR',
      rate * w.runningFeet,
      {
        room: w.bedroom,
        qty: w.runningFeet,
        unit: 'rft',
      },
    );
    if (w.loft)
      push(
        `wardrobe-${i}-loft`,
        `${labelRoom(w.bedroom)} loft`,
        'MODULAR',
        item('loftPerRft') * w.runningFeet,
        {
          room: w.bedroom,
          qty: w.runningFeet,
          unit: 'rft',
        },
      );
  });

  /* ---- 4. Extras --------------------------------------------------------- */
  const x = input.extras;
  if (x.falseCeilingSqft > 0)
    push(
      'false-ceiling',
      `False ceiling (${x.falseCeilingSqft} sq ft)`,
      'FALSE_CEILING',
      rates.falseCeilingPerSqft[tier] * x.falseCeilingSqft,
      {
        qty: x.falseCeilingSqft,
        unit: 'sq ft',
      },
    );
  if (x.tvUnit) push('tv-unit', 'TV unit', 'MODULAR', item('tvUnit'), { room: 'living' });
  if (x.crockeryUnit)
    push('crockery', 'Crockery unit', 'MODULAR', item('crockeryUnit'), { room: 'dining' });
  if (x.poojaUnit)
    push('pooja-unit', 'Pooja unit', 'MODULAR', item('poojaUnit'), { room: 'pooja' });
  if (x.studyTable > 0)
    push(
      'study-table',
      `Study table × ${x.studyTable}`,
      'MODULAR',
      item('studyTable') * x.studyTable,
      {
        room: 'study',
        qty: x.studyTable,
      },
    );
  if (x.beds > 0)
    push('beds', `Beds × ${x.beds}`, 'LOOSE_FURNITURE', item('bed') * x.beds, { qty: x.beds });
  if (x.sofa) push('sofa', 'Sofa set', 'LOOSE_FURNITURE', item('sofa'), { room: 'living' });
  if (x.dining)
    push('dining', 'Dining table & chairs', 'LOOSE_FURNITURE', item('dining'), { room: 'dining' });
  if (x.painting)
    push(
      'painting',
      'Painting (walls & ceiling)',
      'PAINTING',
      rates.paintingPerSqft[tier] * area * PAINT_AREA_FACTOR,
      {
        qty: area * PAINT_AREA_FACTOR,
        unit: 'sq ft',
      },
    );
  if (x.electrical)
    push(
      'electrical',
      'Electrical & lighting points',
      'ELECTRICAL',
      item('electricalPerSqft') * area,
      {
        qty: area,
        unit: 'sq ft',
      },
    );
  if (x.plumbing && input.bathrooms > 0)
    push(
      'plumbing',
      `Bathroom plumbing & fittings × ${input.bathrooms}`,
      'CIVIL',
      item('plumbingPerBathroom') * input.bathrooms,
      {
        room: 'bathroom',
        qty: input.bathrooms,
      },
    );
  if (x.civil)
    push(
      'civil',
      'Civil work (flooring, tiling, minor masonry)',
      'CIVIL',
      item('civilPerSqft') * area,
      {
        qty: area,
        unit: 'sq ft',
      },
    );
  if (input.balconies > 0 && (input.fullHome || selected.includes('balcony')))
    push(
      'balconies',
      `Balcony finishing × ${input.balconies}`,
      'DECOR',
      item('balconyEach') * input.balconies,
      {
        room: 'balcony',
        qty: input.balconies,
      },
    );
  if (input.fullHome && !commercial)
    push(
      'decor',
      'Soft décor allowance (lighting, curtains, accessories)',
      'DECOR',
      item('decorPerSqft') * area,
      {
        qty: area,
        unit: 'sq ft',
      },
    );

  /* ---- 5. Fees ---------------------------------------------------------- */
  const worksLow = sum(works, 'low');
  const worksHigh = sum(works, 'high');
  const fees: EstimateLine[] = [];
  const feePct = rates.designFeePct[tier];
  const execPct = rates.executionPct[tier];
  if (feePct > 0)
    fees.push({
      id: 'design-fee',
      label: `Design fee (${feePct}%)`,
      category: 'DESIGN_FEE',
      low: r100((worksLow * feePct) / 100),
      high: r100((worksHigh * feePct) / 100),
    });
  if (execPct > 0)
    fees.push({
      id: 'execution',
      label: `Project management & execution (${execPct}%)`,
      category: 'EXECUTION',
      low: r100((worksLow * execPct) / 100),
      high: r100((worksHigh * execPct) / 100),
    });

  const lines = [...works, ...fees];
  const subtotal = { low: sum(lines, 'low'), high: sum(lines, 'high') };
  const gst = {
    low: r100((subtotal.low * rates.gstPct) / 100),
    high: r100((subtotal.high * rates.gstPct) / 100),
  };
  const total = { low: subtotal.low + gst.low, high: subtotal.high + gst.high };

  /* ---- 6. Breakdowns ---------------------------------------------------- */
  const byRoom = groupBy(works, (l) => l.room ?? 'whole-home');
  const byCategory = groupBy(lines, (l) => l.category).map((g) => ({
    category: g.key as EstimateCategory,
    low: g.low,
    high: g.high,
  }));

  /* ---- 7. Timeline, EMI, upgrades -------------------------------------- */
  const scopeRatio = commercial
    ? 1
    : Math.min(1.25, selected.reduce((s, r) => s + roomWeight(pb, r), 0) / fullWeight);
  const timelineWeeks = timelineFor(pb, {
    bhk: input.bhk,
    commercial,
    renovation: input.nature === 'RENOVATION',
    scopeRatio,
  });

  const emi = emiSchedule(total, rates.emiAnnualRatePct);

  const upgrades = pb.upgrades
    .filter((u) => u.delta[tier] > 0 && upgradeApplies(u.id, input, selected))
    .map((u) => ({
      id: u.id,
      label: u.label,
      description: u.description,
      delta: r100(u.delta[tier] * mult),
    }));

  return {
    priceBookVersion: pb.version,
    tier,
    lines,
    subtotal,
    gst,
    total,
    byRoom: byRoom.map((g) => ({ room: g.key, low: g.low, high: g.high })),
    byCategory,
    timelineWeeks,
    emi,
    upgrades,
    exclusions: pb.exclusions,
    localityMultiplier: mult,
  };
}

/** Same input at every tier — for the "compare tiers" toggle. */
export function compareTiers(
  input: EstimateInput,
  opts: CalcOptions,
  tiers: Tier[] = ['ESSENTIAL', 'STANDARD', 'PREMIUM', 'LUXURY'],
): Record<Tier, EstimateResult> {
  const out = {} as Record<Tier, EstimateResult>;
  for (const t of tiers) out[t] = calculateEstimate({ ...input, tier: t }, opts);
  return out;
}

/* ------------------------------------------------------------------------ */

function upgradeApplies(id: string, input: EstimateInput, rooms: string[]): boolean {
  switch (id) {
    case 'quartz-countertop':
    case 'pu-shutters':
      return !!input.kitchen || rooms.includes('kitchen');
    case 'wooden-flooring-master':
      return rooms.includes('master-bedroom');
    case 'veneer-tv-wall':
      return rooms.includes('living') || input.extras.tvUnit;
    case 'profile-lighting':
      return input.extras.falseCeilingSqft > 0 || input.fullHome;
    default:
      return true;
  }
}

function sum(lines: EstimateLine[], k: 'low' | 'high') {
  return lines.reduce((s, l) => s + l[k], 0);
}

function groupBy(lines: EstimateLine[], key: (l: EstimateLine) => string) {
  const m = new Map<string, { key: string; low: number; high: number }>();
  for (const l of lines) {
    const k = key(l);
    const g = m.get(k) ?? { key: k, low: 0, high: 0 };
    g.low += l.low;
    g.high += l.high;
    m.set(k, g);
  }
  return [...m.values()].sort((a, b) => b.high - a.high);
}

function dedupe<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}

export function labelRoom(room: string): string {
  return room
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace('Tv ', 'TV ');
}

// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { priceBook202609 } from '@/data/pricebook/2026.09';
import type { Tier } from '@/types/content';

import {
  calculateEstimate,
  compareTiers,
  defaultInput,
  emi,
  emiSchedule,
  estimate,
  estimateAllTiers,
  FULL_HOME_ROOMS,
  labelRoom,
  optionsFor,
  PAINT_AREA_FACTOR,
  quickEstimate,
  timelineFor,
  formatWeeks,
} from './index';

const pb = priceBook202609;
const opts = { priceBook: pb };
const TIERS: Tier[] = ['ESSENTIAL', 'STANDARD', 'PREMIUM', 'LUXURY'];

describe('calculateEstimate — invariants', () => {
  const input = defaultInput({ bhk: '3BHK' });
  const res = calculateEstimate(input, opts);

  it('all lines are ₹100-rounded, positive, low ≤ high', () => {
    expect(res.lines.length).toBeGreaterThan(5);
    for (const l of res.lines) {
      expect(l.low % 100).toBe(0);
      expect(l.high % 100).toBe(0);
      expect(l.low).toBeGreaterThan(0);
      expect(l.low).toBeLessThanOrEqual(l.high);
    }
  });

  it('subtotal = Σ lines; gst = 18%; total = subtotal + gst', () => {
    const low = res.lines.reduce((s, l) => s + l.low, 0);
    const high = res.lines.reduce((s, l) => s + l.high, 0);
    expect(res.subtotal).toEqual({ low, high });
    expect(res.gst.low).toBeCloseTo((low * 18) / 100, -2);
    expect(res.total.low).toBe(low + res.gst.low);
    expect(res.total.high).toBe(high + res.gst.high);
  });

  it('byRoom and byCategory sum back to their sources', () => {
    const works = res.lines.filter(
      (l) => l.category !== 'DESIGN_FEE' && l.category !== 'EXECUTION',
    );
    expect(res.byRoom.reduce((s, r) => s + r.low, 0)).toBe(works.reduce((s, l) => s + l.low, 0));
    expect(res.byCategory.reduce((s, c) => s + c.high, 0)).toBe(res.subtotal.high);
    // sorted by high desc
    for (let i = 1; i < res.byCategory.length; i++)
      expect(res.byCategory[i - 1]!.high).toBeGreaterThanOrEqual(res.byCategory[i]!.high);
  });

  it('fees are a percentage of works', () => {
    const works = res.lines.filter((l) => !['DESIGN_FEE', 'EXECUTION'].includes(l.category));
    const worksLow = works.reduce((s, l) => s + l.low, 0);
    const fee = res.lines.find((l) => l.category === 'DESIGN_FEE')!;
    expect(fee.low).toBeCloseTo((worksLow * pb.rates.designFeePct.STANDARD) / 100, -2);
    const exec = res.lines.find((l) => l.category === 'EXECUTION')!;
    expect(exec.low).toBeCloseTo((worksLow * pb.rates.executionPct.STANDARD) / 100, -2);
  });

  it('ESSENTIAL tier has no design-fee line', () => {
    const r = calculateEstimate({ ...input, tier: 'ESSENTIAL' }, opts);
    expect(r.lines.some((l) => l.category === 'DESIGN_FEE')).toBe(false);
  });

  it('carries price-book version, exclusions and multiplier', () => {
    expect(res.priceBookVersion).toBe('2026.09');
    expect(res.exclusions).toBe(pb.exclusions);
    expect(res.localityMultiplier).toBe(1);
  });

  it('a 3BHK standard full home lands in a plausible Indore range (₹12L–₹40L)', () => {
    expect(res.total.low).toBeGreaterThan(1_200_000);
    expect(res.total.high).toBeLessThan(4_000_000);
  });
});

describe('calculateEstimate — behaviour', () => {
  it('tiers are strictly increasing in total', () => {
    const r = compareTiers(defaultInput({ bhk: '2BHK' }), opts);
    for (let i = 1; i < TIERS.length; i++)
      expect(r[TIERS[i]!].total.high).toBeGreaterThan(r[TIERS[i - 1]!].total.high);
  });

  it('renovation uplifts works by 20% but not fee percentages', () => {
    const base = defaultInput({ bhk: '2BHK' });
    const a = calculateEstimate(base, opts);
    const b = calculateEstimate({ ...base, nature: 'RENOVATION' }, opts);
    const w = (r: typeof a) => r.lines.find((l) => l.id === 'painting')!;
    expect(w(b).high / w(a).high).toBeCloseTo(1.2, 1);
    expect(b.total.high).toBeGreaterThan(a.total.high);
  });

  it('locality multiplier scales every works line', () => {
    const base = defaultInput({ bhk: '2BHK' });
    const a = calculateEstimate(base, opts);
    const b = calculateEstimate(base, { ...opts, localityMultiplier: 1.1 });
    expect(b.localityMultiplier).toBe(1.1);
    const tv = (r: typeof a) => r.lines.find((l) => l.id === 'tv-unit')!;
    expect(tv(b).low / tv(a).low).toBeCloseTo(1.1, 1);
    expect(b.upgrades[0]!.delta).toBeGreaterThan(a.upgrades[0]!.delta);
  });

  it('partial scope (just a kitchen) is far cheaper than full home and has no décor allowance', () => {
    const full = calculateEstimate(defaultInput({ bhk: '3BHK' }), opts);
    const kitchenOnly = calculateEstimate(
      defaultInput({
        bhk: '3BHK',
        fullHome: false,
        rooms: ['kitchen'],
        wardrobes: [],
        extras: {
          falseCeilingSqft: 0,
          tvUnit: false,
          crockeryUnit: false,
          poojaUnit: false,
          studyTable: 0,
          beds: 0,
          sofa: false,
          dining: false,
          painting: false,
          electrical: false,
          plumbing: false,
          civil: false,
        },
      }),
      opts,
    );
    expect(kitchenOnly.total.high).toBeLessThan(full.total.high / 3);
    expect(kitchenOnly.lines.some((l) => l.id === 'decor')).toBe(false);
    expect(kitchenOnly.lines.some((l) => l.id === 'room-kitchen')).toBe(false); // spec'd kitchen replaces allowance
    expect(kitchenOnly.byRoom.map((r) => r.room)).toEqual(['kitchen']);
    expect(kitchenOnly.timelineWeeks[0]).toBeGreaterThanOrEqual(3);
    expect(kitchenOnly.timelineWeeks[1]).toBeLessThan(full.timelineWeeks[1]);
  });

  it('rooms without a kitchen spec get a kitchen allowance line instead', () => {
    const r = calculateEstimate(
      defaultInput({
        bhk: '2BHK',
        fullHome: false,
        rooms: ['kitchen', 'living'],
        kitchen: undefined,
        wardrobes: [],
      }),
      opts,
    );
    expect(r.lines.some((l) => l.id === 'room-kitchen')).toBe(true);
    expect(r.lines.some((l) => l.id === 'kitchen-modular')).toBe(false);
  });

  it('sliding wardrobes cost more than openable; loft adds a line', () => {
    const base = defaultInput({ bhk: '1BHK' });
    const open = calculateEstimate(base, opts);
    const slide = calculateEstimate(
      { ...base, wardrobes: [{ ...base.wardrobes[0]!, type: 'SLIDING', loft: false }] },
      opts,
    );
    expect(slide.lines.find((l) => l.id === 'wardrobe-0')!.high).toBeGreaterThan(
      open.lines.find((l) => l.id === 'wardrobe-0')!.high,
    );
    expect(open.lines.some((l) => l.id === 'wardrobe-0-loft')).toBe(true);
    expect(slide.lines.some((l) => l.id === 'wardrobe-0-loft')).toBe(false);
  });

  it('painting uses the paintable-area factor', () => {
    const input = defaultInput({ bhk: '2BHK', carpetAreaSqft: 1000 });
    const r = calculateEstimate(input, opts);
    const p = r.lines.find((l) => l.id === 'painting')!;
    expect(p.qty).toBe(1000 * PAINT_AREA_FACTOR);
    expect(p.high).toBe(Math.round((pb.rates.paintingPerSqft.STANDARD * 3000 * 1.12) / 100) * 100);
  });

  it('commercial property prices as a single fit-out line with a commercial timeline', () => {
    const r = calculateEstimate(
      defaultInput({
        propertyType: 'OFFICE',
        fullHome: true,
        carpetAreaSqft: 1800,
        kitchen: undefined,
        wardrobes: [],
      }),
      opts,
    );
    expect(r.lines.find((l) => l.id === 'fitout')!.qty).toBe(1800);
    expect(r.lines.some((l) => l.id.startsWith('room-'))).toBe(false);
    expect(r.timelineWeeks).toEqual(pb.rates.timelineWeeks.COMMERCIAL);
  });

  it('zero area still produces a finite, consistent result', () => {
    const r = calculateEstimate(
      defaultInput({ carpetAreaSqft: 0, wardrobes: [], kitchen: undefined }),
      opts,
    );
    expect(Number.isFinite(r.total.high)).toBe(true);
    expect(r.total.low).toBeGreaterThanOrEqual(0);
  });

  it('upgrades are tier- and scope-aware', () => {
    const lux = calculateEstimate(defaultInput({ tier: 'LUXURY' }), opts);
    expect(lux.upgrades.every((u) => u.delta > 0)).toBe(true);
    expect(lux.upgrades.map((u) => u.id)).not.toContain('pu-shutters');
    const noKitchen = calculateEstimate(
      defaultInput({ fullHome: false, rooms: ['living'], kitchen: undefined, wardrobes: [] }),
      opts,
    );
    expect(noKitchen.upgrades.map((u) => u.id)).not.toContain('quartz-countertop');
    expect(noKitchen.upgrades.map((u) => u.id)).not.toContain('wooden-flooring-master');
    expect(noKitchen.upgrades.map((u) => u.id)).toContain('veneer-tv-wall');
  });

  it('balconies priced only when in scope', () => {
    const a = calculateEstimate(defaultInput({ balconies: 2 }), opts);
    const b = calculateEstimate(
      defaultInput({ balconies: 2, fullHome: false, rooms: ['living'] }),
      opts,
    );
    expect(a.lines.some((l) => l.id === 'balconies')).toBe(true);
    expect(b.lines.some((l) => l.id === 'balconies')).toBe(false);
  });
});

describe('emi', () => {
  it('matches the amortisation formula', () => {
    // ₹10,00,000 @ 11.5% for 12 months ≈ ₹88,615
    expect(emi(1_000_000, 11.5, 12)).toBeCloseTo(88615, -1);
  });
  it('handles zero rate and degenerate inputs', () => {
    expect(emi(120_000, 0, 12)).toBe(10_000);
    expect(emi(0, 11.5, 12)).toBe(0);
    expect(emi(1000, 11.5, 0)).toBe(0);
  });
  it('schedule covers 12/24/36 and longer tenures have smaller instalments', () => {
    const s = emiSchedule({ low: 1_000_000, high: 1_200_000 }, 11.5);
    expect(s.map((e) => e.months)).toEqual([12, 24, 36]);
    expect(s[0]!.low).toBeGreaterThan(s[1]!.low);
    expect(s[1]!.low).toBeGreaterThan(s[2]!.low);
    expect(s[0]!.high).toBeGreaterThan(s[0]!.low);
  });
});

describe('timeline', () => {
  it('full home = price-book band', () => {
    expect(
      timelineFor(pb, { bhk: '2BHK', commercial: false, renovation: false, scopeRatio: 1 }),
    ).toEqual([8, 11]);
  });
  it('renovation adds ~20%; partial scope shrinks but respects the floor', () => {
    expect(
      timelineFor(pb, { bhk: '2BHK', commercial: false, renovation: true, scopeRatio: 1 }),
    ).toEqual([10, 13]);
    const [lo, hi] = timelineFor(pb, {
      bhk: '4BHK+',
      commercial: false,
      renovation: false,
      scopeRatio: 0.05,
    });
    expect(lo).toBe(Math.max(3, Math.round(16 * 0.35)));
    expect(hi).toBeGreaterThan(lo);
  });
  it('formats ranges', () => {
    expect(formatWeeks([8, 11])).toBe('8–11 weeks');
    expect(formatWeeks([6, 6])).toBe('6 weeks');
  });
});

describe('index helpers', () => {
  it('defaultInput is complete for every BHK and respects overrides', () => {
    for (const bhk of ['1BHK', '2BHK', '3BHK', '4BHK+'] as const) {
      const d = defaultInput({ bhk });
      expect(d.rooms).toEqual(FULL_HOME_ROOMS[bhk]);
      expect(d.wardrobes.length).toBeGreaterThan(0);
      expect(d.kitchen).toBeDefined();
    }
    expect(defaultInput({ tier: 'LUXURY', locality: 'Vijay Nagar' }).tier).toBe('LUXURY');
  });

  it('optionsFor resolves locality multipliers by name or slug and falls back to 1', () => {
    expect(optionsFor({ locality: 'Vijay Nagar', city: 'Indore' }).localityMultiplier).toBe(1.05);
    expect(optionsFor({ locality: 'rau', city: 'Indore' }).localityMultiplier).toBe(0.95);
    expect(optionsFor({ locality: '', city: 'Indore' }).localityMultiplier).toBe(1);
    expect(optionsFor({ locality: 'Nowhere', city: 'Indore' }).localityMultiplier).toBe(1);
    expect(optionsFor({ locality: '', city: 'Indore' }, 'nope').priceBook.version).toBe('2026.09');
  });

  it('estimate / estimateAllTiers / quickEstimate agree with calculateEstimate', () => {
    const input = defaultInput({ bhk: '2BHK', locality: 'Vijay Nagar' });
    expect(estimate(input)).toEqual(
      calculateEstimate(input, { priceBook: pb, localityMultiplier: 1.05 }),
    );
    expect(Object.keys(estimateAllTiers(input))).toEqual(TIERS);
    const q = quickEstimate({ bhk: '2BHK', tier: 'STANDARD', locality: 'Vijay Nagar' });
    expect(q.total).toEqual(estimate(input).total);
    expect(quickEstimate({ bhk: '1BHK', tier: 'ESSENTIAL' }).total.low).toBeLessThan(q.total.low);
  });

  it('labelRoom', () => {
    expect(labelRoom('master-bedroom')).toBe('Master Bedroom');
    expect(labelRoom('tv-unit')).toBe('TV Unit');
  });
});

import type { Bhk, Tier } from '@/types/content';
import type { EstimateInput, EstimateResult } from '@/types/local';
import { localityMultiplier, priceBook202609, priceBooks } from '@/data/demo';

import {
  calculateEstimate,
  compareTiers,
  FULL_HOME_ROOMS,
  TYPICAL_CARPET_SQFT,
  type CalcOptions,
} from './calculator';

export * from './calculator';
export * from './emi';
export * from './timeline';

/** Build calc options from an input's locality + optional price-book version. */
export function optionsFor(
  input: Pick<EstimateInput, 'locality' | 'city'>,
  version?: string,
): CalcOptions {
  const priceBook = (version && priceBooks[version]) || priceBook202609;
  const key = input.locality || input.city;
  return { priceBook, localityMultiplier: localityMultiplier(key) };
}

/** Convenience: estimate with the current price book and locality lookup. */
export function estimate(input: EstimateInput): EstimateResult {
  return calculateEstimate(input, optionsFor(input));
}

export function estimateAllTiers(input: EstimateInput): Record<Tier, EstimateResult> {
  return compareTiers(input, optionsFor(input));
}

/** A complete, sensible full-home input — the wizard starts from this. */
export function defaultInput(overrides: Partial<EstimateInput> = {}): EstimateInput {
  const bhk: Bhk = overrides.bhk ?? '2BHK';
  const base: EstimateInput = {
    city: 'Indore',
    locality: '',
    propertyType: 'APARTMENT',
    nature: 'NEW',
    bhk,
    carpetAreaSqft: TYPICAL_CARPET_SQFT[bhk],
    bathrooms: bhk === '1BHK' ? 1 : bhk === '4BHK+' ? 4 : bhk === '3BHK' ? 3 : 2,
    balconies: bhk === '1BHK' ? 1 : 2,
    fullHome: true,
    rooms: FULL_HOME_ROOMS[bhk],
    kitchen: {
      layout: bhk === '1BHK' ? 'STRAIGHT' : 'L',
      runningFeet: bhk === '1BHK' ? 8 : bhk === '4BHK+' ? 16 : 12,
      shutter: 'laminate',
      countertop: 'granite',
      chimneyHob: true,
      tallUnit: bhk !== '1BHK',
    },
    wardrobes: defaultWardrobes(bhk),
    extras: {
      falseCeilingSqft: Math.round(TYPICAL_CARPET_SQFT[bhk] * 0.4),
      tvUnit: true,
      crockeryUnit: bhk !== '1BHK',
      poojaUnit: bhk === '3BHK' || bhk === '4BHK+',
      studyTable: bhk === '4BHK+' ? 1 : 0,
      beds: 0,
      sofa: false,
      dining: false,
      painting: true,
      electrical: true,
      plumbing: false,
      civil: false,
    },
    tier: 'STANDARD',
    vastu: 'NONE',
  };
  return { ...base, ...overrides };
}

function defaultWardrobes(bhk: Bhk): EstimateInput['wardrobes'] {
  const w = (bedroom: string, runningFeet: number): EstimateInput['wardrobes'][number] => ({
    bedroom,
    runningFeet,
    type: 'OPENABLE',
    finish: 'laminate',
    loft: true,
  });
  switch (bhk) {
    case '1BHK':
      return [w('master-bedroom', 7)];
    case '2BHK':
      return [w('master-bedroom', 8), w('bedroom', 6)];
    case '3BHK':
      return [w('master-bedroom', 8), w('bedroom', 6), w('kids-room', 6)];
    case '4BHK+':
      return [w('master-bedroom', 10), w('bedroom', 7), w('kids-room', 6), w('guest-room', 6)];
  }
}

/** Homepage mini-estimator: BHK + area + tier (+ locality) → range. */
export function quickEstimate(q: {
  bhk: Bhk;
  carpetAreaSqft?: number;
  tier: Tier;
  locality?: string;
  nature?: EstimateInput['nature'];
}): EstimateResult {
  const input = defaultInput({
    bhk: q.bhk,
    carpetAreaSqft: q.carpetAreaSqft ?? TYPICAL_CARPET_SQFT[q.bhk],
    tier: q.tier,
    locality: q.locality ?? '',
    nature: q.nature ?? 'NEW',
  });
  return estimate(input);
}

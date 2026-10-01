// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { projects } from '@/data/demo';

import {
  applyFilters,
  parseFilters,
  relatedProjects,
  relaxFilters,
  serialiseFilters,
} from './filters';

describe('project filters', () => {
  it('parses and ignores unknown values', () => {
    const f = parseFilters(
      new URLSearchParams('propertyType=VILLA&bhk=9BHK&sort=bogus&style=japandi'),
    );
    expect(f.propertyType).toBe('VILLA');
    expect(f.bhk).toBeUndefined();
    expect(f.sort).toBe('featured');
    expect(f.style).toBe('japandi');
  });

  it('round-trips through the query string', () => {
    const f = parseFilters(new URLSearchParams('nature=RENOVATION&budget=L7_15&sort=newest'));
    expect(serialiseFilters(f)).toBe('nature=RENOVATION&budget=L7_15&sort=newest');
    expect(serialiseFilters(parseFilters(new URLSearchParams('')))).toBe('');
  });

  it('filters and sorts', () => {
    const renos = applyFilters(projects, parseFilters(new URLSearchParams('nature=RENOVATION')));
    expect(renos.length).toBeGreaterThan(0);
    expect(renos.every((p) => p.nature === 'RENOVATION')).toBe(true);

    const byBudget = applyFilters(projects, parseFilters(new URLSearchParams('sort=budget-asc')));
    for (let i = 1; i < byBudget.length; i++) {
      expect(byBudget[i]!.budgetInr ?? 0).toBeGreaterThanOrEqual(byBudget[i - 1]!.budgetInr ?? 0);
    }
    expect(applyFilters(projects, parseFilters(new URLSearchParams('')))[0]!.featured).toBe(true);
  });

  it('relaxes impossible combinations until something matches', () => {
    const f = parseFilters(new URLSearchParams('segment=COMMERCIAL&bhk=1BHK&budget=UNDER_3L'));
    expect(applyFilters(projects, f)).toHaveLength(0);
    const r = relaxFilters(projects, f);
    expect(r.results.length).toBeGreaterThan(0);
    expect(r.dropped.length).toBeGreaterThan(0);
  });

  it('finds related projects excluding self', () => {
    const p = projects[0]!;
    const rel = relatedProjects(projects, p, 3);
    expect(rel).toHaveLength(3);
    expect(rel.some((x) => x.slug === p.slug)).toBe(false);
  });
});

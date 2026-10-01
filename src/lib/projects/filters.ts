import type { BudgetBand, Nature, Project, PropertyType, Segment } from '@/types/content';
import { BUDGET_BANDS, PROPERTY_TYPES } from '@/types/content';

export type SortKey = 'featured' | 'newest' | 'budget-asc' | 'budget-desc' | 'area-desc';

export interface ProjectFilters {
  propertyType?: PropertyType;
  bhk?: string;
  segment?: Segment;
  nature?: Nature;
  special?: 'vastu' | 'compact' | 'joint';
  style?: string;
  room?: string;
  budget?: BudgetBand;
  sort: SortKey;
}

export const FILTER_KEYS = [
  'propertyType',
  'bhk',
  'segment',
  'nature',
  'special',
  'style',
  'room',
  'budget',
] as const satisfies readonly (keyof Omit<ProjectFilters, 'sort'>)[];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured first' },
  { value: 'newest', label: 'Most recent' },
  { value: 'budget-asc', label: 'Budget: low to high' },
  { value: 'budget-desc', label: 'Budget: high to low' },
  { value: 'area-desc', label: 'Largest first' },
];

export const SPECIAL_LABEL: Record<NonNullable<ProjectFilters['special']>, string> = {
  vastu: 'Vastu-aligned',
  compact: 'Compact homes',
  joint: 'Joint families',
};

const BHKS = new Set(['1BHK', '2BHK', '3BHK', '4BHK+']);

function oneOf<T extends string>(v: string | null, allowed: readonly T[]): T | undefined {
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
}

export function parseFilters(sp: URLSearchParams): ProjectFilters {
  const bhk = sp.get('bhk');
  return {
    propertyType: oneOf(sp.get('propertyType'), PROPERTY_TYPES),
    bhk: bhk && BHKS.has(bhk) ? bhk : undefined,
    segment: oneOf(sp.get('segment'), ['RESIDENTIAL', 'COMMERCIAL'] as const),
    nature: oneOf(sp.get('nature'), ['NEW', 'RENOVATION'] as const),
    special: oneOf(sp.get('special'), ['vastu', 'compact', 'joint'] as const),
    style: sp.get('style') ?? undefined,
    room: sp.get('room') ?? undefined,
    budget: oneOf(sp.get('budget'), BUDGET_BANDS),
    sort:
      oneOf(
        sp.get('sort'),
        SORT_OPTIONS.map((o) => o.value),
      ) ?? 'featured',
  };
}

export function serialiseFilters(f: ProjectFilters): string {
  const u = new URLSearchParams();
  for (const k of FILTER_KEYS) {
    const v = f[k];
    if (v) u.set(k, v);
  }
  if (f.sort !== 'featured') u.set('sort', f.sort);
  return u.toString();
}

export function activeFilterCount(f: ProjectFilters): number {
  return FILTER_KEYS.filter((k) => Boolean(f[k])).length;
}

export function matches(p: Project, f: ProjectFilters): boolean {
  if (f.propertyType && p.propertyType !== f.propertyType) return false;
  if (f.bhk && p.bhk !== f.bhk) return false;
  if (f.segment && p.segment !== f.segment) return false;
  if (f.nature && p.nature !== f.nature) return false;
  if (f.special === 'vastu' && !p.vastuAligned) return false;
  if (f.special === 'compact' && !p.compactHome) return false;
  if (f.special === 'joint' && !p.jointFamily) return false;
  if (f.style && !p.styles.includes(f.style)) return false;
  if (f.room && !p.roomTypes.includes(f.room)) return false;
  if (f.budget && p.budgetBand !== f.budget) return false;
  return true;
}

export function sortProjects(list: Project[], sort: SortKey): Project[] {
  const out = [...list];
  switch (sort) {
    case 'newest':
      out.sort((a, b) => (b.completedOn ?? '').localeCompare(a.completedOn ?? ''));
      break;
    case 'budget-asc':
      out.sort((a, b) => (a.budgetInr ?? 0) - (b.budgetInr ?? 0));
      break;
    case 'budget-desc':
      out.sort((a, b) => (b.budgetInr ?? 0) - (a.budgetInr ?? 0));
      break;
    case 'area-desc':
      out.sort((a, b) => (b.carpetAreaSqft ?? 0) - (a.carpetAreaSqft ?? 0));
      break;
    default:
      out.sort((a, b) => Number(b.featured) - Number(a.featured) || a.orderIndex - b.orderIndex);
  }
  return out;
}

export function applyFilters(projects: Project[], f: ProjectFilters): Project[] {
  return sortProjects(
    projects.filter((p) => matches(p, f)),
    f.sort,
  );
}

/**
 * Zero-result relaxation: drop one filter at a time (least important first) until something
 * matches. Returns the relaxed filters and which keys were dropped.
 */
export function relaxFilters(
  projects: Project[],
  f: ProjectFilters,
): { filters: ProjectFilters; dropped: (typeof FILTER_KEYS)[number][]; results: Project[] } {
  const order: (typeof FILTER_KEYS)[number][] = [
    'budget',
    'room',
    'style',
    'special',
    'bhk',
    'nature',
    'propertyType',
    'segment',
  ];
  let cur = { ...f };
  const dropped: (typeof FILTER_KEYS)[number][] = [];
  for (const k of order) {
    if (!cur[k]) continue;
    cur = { ...cur, [k]: undefined };
    dropped.push(k);
    const r = applyFilters(projects, cur);
    if (r.length) return { filters: cur, dropped, results: r };
  }
  return { filters: cur, dropped, results: applyFilters(projects, cur) };
}

/** Related projects: shared style/room/property type, excluding self. */
export function relatedProjects(all: Project[], p: Project, n = 3): Project[] {
  return all
    .filter((x) => x.slug !== p.slug)
    .map((x) => {
      let score = 0;
      if (x.propertyType === p.propertyType) score += 2;
      if (x.bhk && x.bhk === p.bhk) score += 2;
      score += x.styles.filter((s) => p.styles.includes(s)).length * 3;
      score += x.roomTypes.filter((r) => p.roomTypes.includes(r)).length;
      if (x.budgetBand === p.budgetBand) score += 1;
      if (x.locality && x.locality === p.locality) score += 1;
      return { x, score };
    })
    .sort((a, b) => b.score - a.score || a.x.orderIndex - b.x.orderIndex)
    .slice(0, n)
    .map((r) => r.x);
}

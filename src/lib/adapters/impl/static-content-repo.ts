import MiniSearch from 'minisearch';

import * as demo from '@/data/demo';
import { JOURNAL_DOCS } from '@/data/journal.generated';
import type {
  Designer,
  Material,
  PriceBook,
  Project,
  RoomTemplate,
  Testimonial,
} from '@/types/content';

import type {
  ContentRepo,
  MaterialFilter,
  ProjectFilter,
  SearchHit,
  SearchScope,
} from '../contracts';

const AREA_BANDS: [string, number, number][] = [
  ['<800', 0, 800],
  ['800-1200', 800, 1200],
  ['1200-1800', 1200, 1800],
  ['1800-2500', 1800, 2500],
  ['2500+', 2500, Infinity],
];

export function areaBandOf(sqft: number | undefined): string | undefined {
  if (sqft === undefined) return undefined;
  return AREA_BANDS.find(([, lo, hi]) => sqft >= lo && sqft < hi)?.[0];
}

const anyOf = (values: string[] | undefined, candidate: string | undefined | string[]): boolean => {
  if (!values || values.length === 0) return true;
  if (candidate === undefined) return false;
  const c = Array.isArray(candidate) ? candidate : [candidate];
  return c.some((x) => values.includes(x));
};

export function filterProjects(list: Project[], f?: ProjectFilter): Project[] {
  if (!f) return list;
  return list.filter((p) => {
    if (f.featured !== undefined && p.featured !== f.featured) return false;
    if (!anyOf(f.locality, p.locality)) return false;
    if (!anyOf(f.city, p.city)) return false;
    if (!anyOf(f.propertyType, p.propertyType)) return false;
    if (!anyOf(f.bhk, p.bhk)) return false;
    if (!anyOf(f.areaBand, areaBandOf(p.carpetAreaSqft))) return false;
    if (!anyOf(f.roomType, p.roomTypes)) return false;
    if (!anyOf(f.style, p.styles)) return false;
    if (!anyOf(f.budgetBand, p.budgetBand)) return false;
    if (!anyOf(f.nature, p.nature)) return false;
    if (!anyOf(f.segment, p.segment)) return false;
    if (f.special && f.special.length > 0) {
      const flags: string[] = [];
      if (p.vastuAligned) flags.push('vastu');
      if (p.compactHome) flags.push('compact');
      if (p.jointFamily) flags.push('joint-family');
      if (!f.special.some((s) => flags.includes(s))) return false;
    }
    return true;
  });
}

export function filterMaterials(list: Material[], f?: MaterialFilter): Material[] {
  if (!f) return list;
  return list.filter((m) => {
    if (!anyOf(f.category, m.category)) return false;
    if (!anyOf(f.colorFamily, m.colorFamily)) return false;
    if (!anyOf(f.finish, m.finish)) return false;
    if (!anyOf(f.tier, m.tier)) return false;
    if (!anyOf(f.room, m.usageRooms)) return false;
    if (!anyOf(f.surface, m.usageSurfaces)) return false;
    if (!anyOf(f.brand, m.brand)) return false;
    if (!anyOf(f.maintenance, m.maintenance)) return false;
    if (!anyOf(f.availability, m.availability)) return false;
    if (!anyOf(f.tonality, m.tonality)) return false;
    if (f.maxPricePerUnit !== undefined && m.price && m.price.min > f.maxPricePerUnit) return false;
    return true;
  });
}

interface Doc {
  id: string;
  scope: SearchScope;
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  tags: string;
  href: string;
  image?: string;
}

/** Journal docs ship as a generated static module so the browser-side index can include them. */
let extraDocs: Doc[] = toJournalDocs(JOURNAL_DOCS);
export function registerJournalDocs(
  docs: { slug: string; title: string; excerpt: string; tags: string[]; image?: string }[],
) {
  extraDocs = toJournalDocs(docs);
  index = null;
}

function toJournalDocs(
  docs: { slug: string; title: string; excerpt: string; tags: string[]; image?: string }[],
): Doc[] {
  return docs.map((d) => ({
    id: `journal:${d.slug}`,
    scope: 'journal',
    slug: d.slug,
    title: d.title,
    subtitle: d.tags.join(', '),
    body: d.excerpt,
    tags: d.tags.join(' '),
    href: `/journal/${d.slug}/`,
    image: d.image,
  }));
}

let index: MiniSearch<Doc> | null = null;

function buildDocs(): Doc[] {
  const docs: Doc[] = [];
  for (const p of demo.projects) {
    docs.push({
      id: `projects:${p.slug}`,
      scope: 'projects',
      slug: p.slug,
      title: p.title,
      subtitle: [p.locality ?? p.city, p.bhk, p.propertyType].filter(Boolean).join(' · '),
      body: `${p.brief} ${p.challenge} ${p.solution}`,
      tags: [...p.styles, ...p.roomTypes, p.locality ?? '', p.city, p.budgetBand].join(' '),
      href: `/projects/${p.slug}/`,
      image: p.heroImage.src,
    });
  }
  for (const m of demo.materials) {
    docs.push({
      id: `materials:${m.slug}`,
      scope: 'materials',
      slug: m.slug,
      title: m.name,
      subtitle: [m.brand, m.category.replace(/_/g, ' ').toLowerCase()].filter(Boolean).join(' · '),
      body: m.description ?? '',
      tags: [
        m.category,
        m.colorFamily ?? '',
        m.finish ?? '',
        m.tonality ?? '',
        ...m.usageRooms,
        m.tier,
      ].join(' '),
      href: `/materials/${m.slug}/`,
      image: m.swatch.src,
    });
  }
  for (const s of demo.services) {
    docs.push({
      id: `services:${s.slug}`,
      scope: 'services',
      slug: s.slug,
      title: s.name,
      subtitle: s.tagline,
      body: `${s.description} ${s.inclusions.join(' ')}`,
      tags: s.slug.replace(/-/g, ' '),
      href: `/services/${s.slug}/`,
      image: s.heroImage.src,
    });
  }
  for (const s of demo.styles) {
    docs.push({
      id: `styles:${s.slug}`,
      scope: 'styles',
      slug: s.slug,
      title: s.name,
      subtitle: s.tagline,
      body: `${s.description} ${s.characteristics.join(' ')}`,
      tags: s.slug.replace(/-/g, ' '),
      href: `/styles/${s.slug}/`,
      image: s.heroImage.src,
    });
  }
  for (const r of demo.roomGuides) {
    docs.push({
      id: `rooms:${r.slug}`,
      scope: 'rooms',
      slug: r.slug,
      title: r.name,
      subtitle: r.tagline,
      body: `${r.description} ${r.considerations.join(' ')}`,
      tags: `${r.slug.replace(/-/g, ' ')} ${r.roomType}`,
      href: `/rooms/${r.slug}/`,
      image: r.heroImage.src,
    });
  }
  return docs.concat(extraDocs);
}

function getIndex(): MiniSearch<Doc> {
  if (index) return index;
  index = new MiniSearch<Doc>({
    fields: ['title', 'subtitle', 'body', 'tags'],
    storeFields: ['scope', 'slug', 'title', 'subtitle', 'href', 'image'],
    searchOptions: {
      boost: { title: 3, tags: 2, subtitle: 1.5 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: 'AND',
    },
  });
  index.addAll(buildDocs());
  return index;
}

export class StaticContentRepo implements ContentRepo {
  async getProjects(filter?: ProjectFilter): Promise<Project[]> {
    return filterProjects(demo.projects, filter);
  }
  async getProject(slug: string): Promise<Project | null> {
    return demo.getProject(slug) ?? null;
  }
  async getMaterials(filter?: MaterialFilter): Promise<Material[]> {
    return filterMaterials(demo.materials, filter);
  }
  async getMaterial(slug: string): Promise<Material | null> {
    return demo.getMaterial(slug) ?? null;
  }
  async getRoomTemplates(): Promise<RoomTemplate[]> {
    return demo.roomTemplates;
  }
  async getRoomTemplate(slug: string): Promise<RoomTemplate | null> {
    return demo.getRoomTemplate(slug) ?? null;
  }
  async getDesigners(): Promise<Designer[]> {
    return demo.designers;
  }
  async getDesigner(slug: string): Promise<Designer | null> {
    return demo.getDesigner(slug) ?? null;
  }
  async getTestimonials(): Promise<Testimonial[]> {
    return demo.testimonials;
  }
  async getPriceBook(version?: string): Promise<PriceBook> {
    const v = version ?? demo.CURRENT_PRICEBOOK_VERSION;
    const pb = demo.priceBooks[v];
    if (!pb) throw new Error(`Unknown price book version: ${v}`);
    return pb;
  }
  async search(query: string, scopes?: SearchScope[]): Promise<SearchHit[]> {
    const q = query.trim();
    if (q.length < 2) return [];
    const results = getIndex().search(
      q,
      scopes ? { filter: (r) => scopes.includes(r['scope'] as SearchScope) } : undefined,
    );
    return results.slice(0, 40).map((r) => ({
      scope: r['scope'] as SearchScope,
      slug: r['slug'] as string,
      title: r['title'] as string,
      subtitle: r['subtitle'] as string | undefined,
      href: r['href'] as string,
      score: r.score,
      image: r['image'] as string | undefined,
    }));
  }
}

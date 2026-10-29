/**
 * Referential integrity for the demo dataset (SRS §11 / Todo 12).
 * Every slug referenced from one entity must resolve to a real entity; every
 * image must carry a credit; styles must be coherent; the price book must be
 * well-formed. These run in CI so a typo in a data file fails the build.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import * as demo from '@/data/demo';
import { JOURNAL_DOCS } from '@/data/journal.generated';
import { TEXTURE_PROVENANCE } from '@/data/textures.generated';
import type { ImageRef, Tier } from '@/types/content';

const TIERS: Tier[] = ['ESSENTIAL', 'STANDARD', 'PREMIUM', 'LUXURY'];

const slugs = {
  projects: new Set(demo.projects.map((p) => p.slug)),
  materials: new Set(demo.materials.map((m) => m.slug)),
  designers: new Set(demo.designers.map((d) => d.slug)),
  styles: new Set(demo.styles.map((s) => s.slug)),
  rooms: new Set(demo.roomGuides.map((r) => r.slug)),
  /** Room-type keys: guide roomTypes plus the shorthand keys used by projects/materials (e.g. 'bedroom'). */
  roomTypes: new Set([...demo.roomGuides.map((r) => r.roomType), ...Object.keys(demo.ROOM_LABELS)]),
  services: new Set(demo.services.map((s) => s.slug)),
  templates: new Set(demo.roomTemplates.map((t) => t.slug)),
  testimonials: new Set(demo.testimonials.map((t) => t.id)),
  localities: new Set(demo.localities.map((l) => l.slug)),
  localityNames: new Set(demo.localities.map((l) => l.name)),
  textures: new Set(TEXTURE_PROVENANCE.map((t) => t.slug)),
};

const unique = <T>(arr: T[]) => new Set(arr).size === arr.length;
const missing = (refs: Iterable<string>, pool: Set<string>) =>
  [...refs].filter((r) => !pool.has(r));

/* ------------------------------------------------------------------------ */

describe('image refs', () => {
  const all = demo.allImages();

  it('manifest is non-empty and ids are unique', () => {
    expect(all.length).toBeGreaterThan(300);
    expect(unique(all.map((i) => i.id))).toBe(true);
  });

  it('every image has a credit with a licence (§11.8)', () => {
    for (const i of all) {
      expect(i.credit, i.id).toBeDefined();
      expect(['unsplash', 'pexels', 'cc0', 'owned']).toContain(i.credit.licence);
      expect(['unsplash', 'pexels', 'ambientcg', 'polyhaven', 'original']).toContain(
        i.credit.source,
      );
    }
  });

  it('every image has dimensions, blurhash, alt text', () => {
    for (const i of all) {
      expect(i.width, i.id).toBeGreaterThan(0);
      expect(i.height, i.id).toBeGreaterThan(0);
      expect(i.blurHash.length, i.id).toBeGreaterThanOrEqual(6);
      expect(i.alt.trim().length, i.id).toBeGreaterThan(3);
      expect(i.src.startsWith('/demo/') || i.src.startsWith('/dot3/'), i.id).toBe(true);
    }
  });

  it('every entity hero/swatch/photo resolves to a manifest image', () => {
    const check = (ref: ImageRef, ctx: string) => {
      expect(demo.hasImage(ref.id), `${ctx} → ${ref.id}`).toBe(true);
    };
    demo.projects.forEach((p) => {
      check(p.heroImage, p.slug);
      p.images.forEach((i) => check(i, p.slug));
    });
    demo.materials.forEach((m) => check(m.swatch, m.slug));
    demo.designers.forEach((d) => check(d.photo, d.slug));
    demo.styles.forEach((s) => check(s.heroImage, s.slug));
    demo.roomGuides.forEach((r) => check(r.heroImage, r.slug));
    demo.services.forEach((s) => check(s.heroImage, s.slug));
    demo.roomTemplates.forEach((t) => check(t.baseImage, t.slug));
    demo.quizProfiles.forEach((q) => check(q.heroImage, q.id));
    demo.quizQuestions.forEach((q) => q.options.forEach((o) => check(o.image, `${q.id}/${o.id}`)));
    JOURNAL_DOCS.forEach((j) => expect(demo.hasImage(j.image), j.slug).toBe(true));
  });
});

/* ------------------------------------------------------------------------ */

describe('projects', () => {
  it('has the SRS counts: ≥24 total, ≥6 featured, ≥5 commercial, ≥10 with before/after', () => {
    expect(demo.projects.length).toBeGreaterThanOrEqual(24);
    expect(demo.projects.filter((p) => p.featured).length).toBeGreaterThanOrEqual(6);
    expect(demo.projects.filter((p) => p.segment === 'COMMERCIAL').length).toBeGreaterThanOrEqual(
      5,
    );
    expect(demo.projects.filter((p) => p.beforeAfters.length > 0).length).toBeGreaterThanOrEqual(
      10,
    );
  });

  it('slugs and orderIndex are unique', () => {
    expect(unique(demo.projects.map((p) => p.slug))).toBe(true);
    expect(unique(demo.projects.map((p) => p.orderIndex))).toBe(true);
  });

  it('references resolve (materials, designers, styles, room types, testimonials, templates, localities)', () => {
    for (const p of demo.projects) {
      expect(missing(p.materialSlugs, slugs.materials), `${p.slug} materials`).toEqual([]);
      expect(missing(p.designerSlugs, slugs.designers), `${p.slug} designers`).toEqual([]);
      expect(missing(p.styles, slugs.styles), `${p.slug} styles`).toEqual([]);
      expect(missing(p.roomTypes, slugs.roomTypes), `${p.slug} roomTypes`).toEqual([]);
      if (p.testimonialId)
        expect(slugs.testimonials.has(p.testimonialId), `${p.slug} testimonial`).toBe(true);
      if (p.roomTemplateSlug)
        expect(slugs.templates.has(p.roomTemplateSlug), `${p.slug} template`).toBe(true);
      // Indore projects must sit in a known locality; out-of-town projects (Ujjain, etc.) name a city-level entry.
      if (p.city === 'Indore')
        expect(slugs.localityNames.has(p.locality ?? ''), `${p.slug} locality ${p.locality}`).toBe(
          true,
        );
      else expect(slugs.localityNames.has(p.city), `${p.slug} city ${p.city}`).toBe(true);
      if (p.palette) {
        expect(
          missing(Object.values(p.palette).filter(Boolean) as string[], slugs.materials),
          `${p.slug} palette`,
        ).toEqual([]);
      }
      p.beforeAfters.forEach((ba) => {
        expect(demo.hasImage(ba.before.id), `${p.slug} before`).toBe(true);
        expect(demo.hasImage(ba.after.id), `${p.slug} after`).toBe(true);
        expect(ba.before.synthetic, `${p.slug} before should be flagged synthetic`).toBe(true);
      });
    }
  });

  it('style coherence: hero image styleBucket matches one of the project styles', () => {
    for (const p of demo.projects) {
      if (!p.heroImage.styleBucket) continue;
      expect(p.styles, `${p.slug} hero bucket ${p.heroImage.styleBucket}`).toContain(
        p.heroImage.styleBucket,
      );
    }
  });

  it('budget band is consistent with budgetInr', () => {
    for (const p of demo.projects) {
      if (p.budgetInr === undefined) continue;
      expect(demo.budgetBandOf(p.budgetInr), p.slug).toBe(p.budgetBand);
    }
  });
});

/* ------------------------------------------------------------------------ */

describe('materials', () => {
  it('≥120 materials, ≥3 per category, unique slugs', () => {
    expect(demo.materials.length).toBeGreaterThanOrEqual(120);
    expect(unique(demo.materials.map((m) => m.slug))).toBe(true);
    const byCat = new Map<string, number>();
    demo.materials.forEach((m) => byCat.set(m.category, (byCat.get(m.category) ?? 0) + 1));
    for (const [cat, n] of byCat) expect(n, cat).toBeGreaterThanOrEqual(3);
  });

  it('substitute chains resolve, are cheaper-or-equal tier, and are acyclic', () => {
    const tierRank = (t: Tier) => TIERS.indexOf(t);
    let chains = 0;
    for (const m of demo.materials) {
      if (!m.substituteForSlug) continue;
      chains++;
      const target = demo.getMaterial(m.substituteForSlug);
      expect(target, `${m.slug} → ${m.substituteForSlug}`).toBeDefined();
      expect(tierRank(m.tier), `${m.slug} should be ≤ tier of ${target!.slug}`).toBeLessThanOrEqual(
        tierRank(target!.tier),
      );
      // Cross-category substitutes (laminate for veneer) are intended; they must share at least one surface.
      expect(
        m.usageSurfaces.some((s) => target!.usageSurfaces.includes(s)),
        `${m.slug} shares no surface with ${target!.slug}`,
      ).toBe(true);
      const chain = demo.substituteChain(target!.slug);
      expect(chain.length).toBeLessThan(10);
    }
    expect(chains).toBeGreaterThanOrEqual(12);
  });

  it('textured materials point at a provenance-tracked texture set (≥40)', () => {
    const textured = demo.materials.filter((m) => m.texture);
    expect(textured.length).toBeGreaterThanOrEqual(40);
    for (const m of textured) {
      const set = m.texture!.albedo.split('/').filter(Boolean)[1];
      expect(set && slugs.textures.has(set), `${m.slug} texture ${m.texture!.albedo}`).toBe(true);
      expect(m.texture!.scaleCm).toBeGreaterThan(0);
      expect(m.texture!.credit.licence).toBe('cc0');
    }
  });

  it('hex colours are valid when present; usageRooms resolve', () => {
    for (const m of demo.materials) {
      if (m.hex) expect(m.hex, m.slug).toMatch(/^#[0-9a-f]{6}$/i);
      expect(missing(m.usageRooms, slugs.roomTypes), `${m.slug} usageRooms`).toEqual([]);
      if (m.price) expect(m.price.min, m.slug).toBeLessThanOrEqual(m.price.max);
    }
  });
});

/* ------------------------------------------------------------------------ */

describe('texture provenance', () => {
  it('every set has a source, licence and (for downloads) a URL and hash', () => {
    expect(TEXTURE_PROVENANCE.length).toBeGreaterThanOrEqual(40);
    expect(unique(TEXTURE_PROVENANCE.map((t) => t.slug))).toBe(true);
    for (const t of TEXTURE_PROVENANCE) {
      expect(t.licence).toBe('cc0');
      expect(['ambientcg', 'procedural']).toContain(t.source);
      if (t.source === 'ambientcg') {
        expect(t.url, t.slug).toMatch(/^https:\/\/ambientcg\.com\/a\//);
        expect(t.sha256, t.slug).toMatch(/^[0-9a-f]{64}$/);
      }
    }
  });
});

/* ------------------------------------------------------------------------ */

describe('designers, testimonials, services, styles, rooms', () => {
  it('designers: 6, unique, projects resolve, availability has 7 weekdays', () => {
    expect(demo.designers.length).toBe(6);
    for (const d of demo.designers) {
      expect(missing(d.projectSlugs, slugs.projects), d.slug).toEqual([]);
      expect(missing(d.styles, slugs.styles), `${d.slug} styles`).toEqual([]);
      expect(Object.keys(d.availability.slots).sort()).toEqual([
        'fri',
        'mon',
        'sat',
        'sun',
        'thu',
        'tue',
        'wed',
      ]);
      expect(d.photo.id).toBeTruthy();
    }
  });

  it('testimonials: ≥18, ratings in range, project/designer refs resolve', () => {
    expect(demo.testimonials.length).toBeGreaterThanOrEqual(18);
    expect(unique(demo.testimonials.map((t) => t.id))).toBe(true);
    for (const t of demo.testimonials) {
      expect(t.rating).toBeGreaterThanOrEqual(1);
      expect(t.rating).toBeLessThanOrEqual(5);
      if (t.projectSlug) expect(slugs.projects.has(t.projectSlug), t.id).toBe(true);
      if (t.designerSlug) expect(slugs.designers.has(t.designerSlug), t.id).toBe(true);
      expect(t.quote.length).toBeGreaterThan(40);
    }
  });

  it('services: 12, refs resolve, cost bands sane', () => {
    expect(demo.services.length).toBe(12);
    for (const s of demo.services) {
      expect(missing(s.projectSlugs, slugs.projects), s.slug).toEqual([]);
      expect(missing(s.materialSlugs, slugs.materials), s.slug).toEqual([]);
      expect(s.costBand.min).toBeLessThanOrEqual(s.costBand.max);
      expect(s.timelineWeeks[0]).toBeLessThanOrEqual(s.timelineWeeks[1]);
      expect(s.faqs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('styles: 16, refs resolve, hero image bucket matches', () => {
    expect(demo.styles.length).toBe(16);
    for (const s of demo.styles) {
      expect(missing(s.projectSlugs, slugs.projects), s.slug).toEqual([]);
      expect(missing(s.typicalMaterialSlugs, slugs.materials), s.slug).toEqual([]);
      expect(missing(s.paletteMaterialSlugs, slugs.materials), `${s.slug} palette`).toEqual([]);
      expect(missing(s.bestRooms, slugs.roomTypes), `${s.slug} bestRooms`).toEqual([]);
      if (s.heroImage.styleBucket) expect(s.heroImage.styleBucket, s.slug).toBe(s.styleBucket);
    }
  });

  it('room guides: 18, refs resolve', () => {
    expect(demo.roomGuides.length).toBe(18);
    for (const r of demo.roomGuides) {
      expect(missing(r.projectSlugs, slugs.projects), r.slug).toEqual([]);
      expect(missing(r.materialSlugs, slugs.materials), r.slug).toEqual([]);
      expect(r.costBand.min).toBeLessThanOrEqual(r.costBand.max);
      expect(r.estimatorScope.length).toBeGreaterThan(0);
    }
  });
});

/* ------------------------------------------------------------------------ */

describe('room templates (visualiser)', () => {
  it('6 templates with ≥3 surfaces each, masks named by surface id, quads are 4 points, default materials resolve', () => {
    expect(demo.roomTemplates.length).toBe(6);
    for (const t of demo.roomTemplates) {
      expect(t.surfaces.length, t.slug).toBeGreaterThanOrEqual(3);
      expect(unique(t.surfaces.map((s) => s.id)), `${t.slug} surface ids`).toBe(true);
      expect(Math.hypot(...t.lightDirection)).toBeGreaterThan(0);
      for (const s of t.surfaces) {
        expect(s.maskSrc, `${t.slug}/${s.id}`).toBe(`/demo/templates/${t.slug}/mask-${s.id}.png`);
        if (s.perspectiveQuad) {
          expect(s.perspectiveQuad).toHaveLength(4);
          // Quads may overshoot the frame a little: a floor plane extrapolated past the crop edge.
          const mx = t.baseImage.width * 0.25;
          const my = t.baseImage.height * 0.25;
          s.perspectiveQuad.forEach(([x, y]) => {
            expect(x).toBeGreaterThanOrEqual(-mx);
            expect(y).toBeGreaterThanOrEqual(-my);
            expect(x).toBeLessThanOrEqual(t.baseImage.width + mx);
            expect(y).toBeLessThanOrEqual(t.baseImage.height + my);
          });
        }
        if (s.defaultMaterialSlug) {
          const m = demo.getMaterial(s.defaultMaterialSlug);
          expect(m, `${t.slug}/${s.id} default ${s.defaultMaterialSlug}`).toBeDefined();
          expect(
            m!.usageSurfaces,
            `${t.slug}/${s.id} ${m!.slug} not usable on ${s.surfaceType}`,
          ).toContain(s.surfaceType);
        }
      }
    }
  });
});

/* ------------------------------------------------------------------------ */

describe('quiz', () => {
  it('8 questions × ≥3 options; 8 profiles; refs resolve; vectors in [-1, 1]', () => {
    expect(demo.quizQuestions.length).toBe(8);
    expect(demo.quizProfiles.length).toBe(8);
    expect(unique(demo.quizQuestions.map((q) => q.id))).toBe(true);
    for (const q of demo.quizQuestions) {
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(3);
      expect(unique(q.options.map((o) => o.id)), q.id).toBe(true);
      q.options.forEach((o) =>
        Object.values(o.vector).forEach((v) => {
          expect(v).toBeGreaterThanOrEqual(-1);
          expect(v).toBeLessThanOrEqual(1);
        }),
      );
    }
    for (const p of demo.quizProfiles) {
      expect(slugs.styles.has(p.styleSlug), `${p.id} style`).toBe(true);
      expect(missing(p.projectSlugs, slugs.projects), p.id).toEqual([]);
      expect(missing(p.materialSlugs, slugs.materials), p.id).toEqual([]);
      expect(missing(p.paletteMaterialSlugs, slugs.materials), `${p.id} palette`).toEqual([]);
      expect(Object.keys(p.vector)).toHaveLength(8);
    }
  });
});

/* ------------------------------------------------------------------------ */

describe('price book', () => {
  const pb = demo.priceBook202609;

  it('is the current version and has all tiers for every rate, strictly increasing by tier', () => {
    expect(demo.CURRENT_PRICEBOOK_VERSION).toBe(pb.version);
    expect(demo.priceBooks[pb.version]).toBe(pb);
    expect(pb.currency).toBe('INR');
    const tables: Record<string, Record<Tier, number>> = {
      fullHomePerSqft: pb.rates.fullHomePerSqft,
      kitchenPerRft: pb.rates.kitchenPerRft,
      wardrobeOpenPerRft: pb.rates.wardrobeOpenPerRft,
      wardrobeSlidePerRft: pb.rates.wardrobeSlidePerRft,
      falseCeilingPerSqft: pb.rates.falseCeilingPerSqft,
      paintingPerSqft: pb.rates.paintingPerSqft,
      ...pb.rates.items,
    };
    for (const [name, row] of Object.entries(tables)) {
      let prev = 0;
      for (const tier of TIERS) {
        expect(row[tier], `${name}.${tier}`).toBeGreaterThan(prev);
        prev = row[tier];
      }
    }
  });

  it('sliding wardrobes cost more than openable at every tier', () => {
    for (const t of TIERS)
      expect(pb.rates.wardrobeSlidePerRft[t]).toBeGreaterThan(pb.rates.wardrobeOpenPerRft[t]);
  });
});

/* ------------------------------------------------------------------------ */

describe('localities & shades', () => {
  it('≥24 localities with unique slugs, valid Indore-area coordinates and multipliers near 1', () => {
    expect(demo.localities.length).toBeGreaterThanOrEqual(24);
    expect(unique(demo.localities.map((l) => l.slug))).toBe(true);
    for (const l of demo.localities) {
      expect(l.lat).toBeGreaterThan(21.5);
      expect(l.lat).toBeLessThan(24.5);
      expect(l.lng).toBeGreaterThan(74.5);
      expect(l.lng).toBeLessThan(78.5);
      expect(l.multiplier).toBeGreaterThan(0.8);
      expect(l.multiplier).toBeLessThan(1.4);
      l.pincodes.forEach((p) => expect(p, l.slug).toMatch(/^4\d{5}$/));
    }
    expect(demo.isServiceablePin('452010').serviceable).toBe(true);
  });

  it('240 shades with unique codes and valid hex', () => {
    expect(demo.shades.length).toBe(240);
    expect(unique(demo.shades.map((s) => s.code))).toBe(true);
    expect(unique(demo.shades.map((s) => s.slug))).toBe(true);
    demo.shades.forEach((s) => expect(s.hex).toMatch(/^#[0-9a-f]{6}$/i));
  });
});

/* ------------------------------------------------------------------------ */

describe('journal', () => {
  it('12 posts, unique slugs, authors resolve, dates descending', () => {
    expect(JOURNAL_DOCS.length).toBe(12);
    expect(unique(JOURNAL_DOCS.map((j) => j.slug))).toBe(true);
    for (const j of JOURNAL_DOCS)
      expect(slugs.designers.has(j.author), `${j.slug} author`).toBe(true);
    const dates = JOURNAL_DOCS.map((j) => j.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});

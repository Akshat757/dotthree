/**
 * Build-time demo asset generator (SRS §11.3, Zero-Cost Edition).
 *
 * Walks the typed demo dataset, renders a deterministic synthetic image for every
 * referenced ImageRef id, encodes AVIF/WebP derivatives into public/demo/** and
 * writes the manifest src/data/demo/images.generated.ts. Real photos placed at
 * public/demo/originals/<id>.jpg take precedence over the synthetic renderer.
 *
 *   npm run assets:images                 # everything, skipping existing outputs
 *   npm run assets:images -- --force      # re-render all
 *   npm run assets:images -- --only proj- # id prefix filter
 *   npm run assets:images -- --limit 20   # quick smoke run
 *   npm run assets:images -- --room living --force   # re-render one room type
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import sharp from 'sharp';

import {
  designers,
  materials,
  projects,
  quizProfiles,
  quizQuestions,
  roomGuides,
  sceneTemplates,
  services,
  styles,
} from '../src/data/demo';
import type { ImageRef } from '../src/types/content';

import {
  blurhashOf,
  encodeMask,
  encodeSvg,
  ensureDir,
  outputsExist,
  paletteOf,
  WIDTHS,
  writeText,
} from './lib/encode';
import { STYLE_KEYS } from './lib/palette';
import { rng } from './lib/prng';
import { renderMaskSvg, renderRoomScene, renderTemplateScene } from './lib/scene';
import { renderPortrait, renderSwatch } from './lib/swatch';

const ROOT = process.cwd();
const PUBLIC = resolve(ROOT, 'public');
const ORIGINALS = resolve(PUBLIC, 'demo/originals');
const MANIFEST = resolve(ROOT, 'src/data/demo/images.generated.ts');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY = args.includes('--only') ? (args[args.indexOf('--only') + 1] ?? '') : '';
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1] ?? 0) : 0;
const ROOM = args.includes('--room') ? (args[args.indexOf('--room') + 1] ?? '') : '';
const CONCURRENCY = Number(process.env.ASSET_CONCURRENCY ?? 4);

interface Job {
  id: string;
  /** public path without extension/width, e.g. /demo/projects/slug/01 */
  src: string;
  alt: string;
  roomType?: string;
  styleBucket?: string;
  render: () => string;
  before?: boolean;
  square?: boolean;
  caption?: string;
}

const jobs: Job[] = [];
const seen = new Set<string>();
function add(j: Job) {
  if (seen.has(j.id)) return;
  seen.add(j.id);
  jobs.push(j);
}

const ROOM_ALT: Record<string, string> = {
  living: 'living room',
  dining: 'dining area',
  kitchen: 'modular kitchen',
  'master-bedroom': 'master bedroom',
  bedroom: 'bedroom',
  'kids-room': "kids' room",
  'parents-room': "parents' bedroom",
  'guest-room': 'guest bedroom',
  study: 'study',
  pooja: 'pooja room',
  foyer: 'foyer',
  balcony: 'balcony',
  bathroom: 'bathroom',
  utility: 'utility area',
  office: 'office',
  clinic: 'clinic',
  retail: 'retail floor',
  restaurant: 'restaurant',
  reception: 'reception',
  terrace: 'terrace',
  courtyard: 'courtyard',
};
const styleName = (s: string) => s.replace(/-/g, ' ');

/* ----------------------------- projects ---------------------------------- */
for (const p of projects) {
  p.images.forEach((im, i) => {
    add({
      id: im.id,
      src: `/demo/projects/${p.slug}/${String(i + 1).padStart(2, '0')}`,
      roomType: im.roomType,
      styleBucket: im.styleBucket,
      alt: `${p.title} — ${ROOM_ALT[im.roomType ?? ''] ?? im.roomType} in ${styleName(p.styles[0] ?? 'contemporary')} style (illustrative render)`,
      render: () =>
        renderRoomScene({
          id: im.id,
          roomType: im.roomType ?? 'living',
          style: p.styles[0] ?? 'contemporary',
          variant: i,
        }),
    });
  });
  for (const ba of p.beforeAfters) {
    add({
      id: ba.before.id,
      src: `/demo/projects/${p.slug}/${ba.before.id.replace(`proj-${p.slug}-`, '')}`,
      roomType: ba.after.roomType,
      styleBucket: p.styles[0],
      before: true,
      alt: `${p.title} — ${ROOM_ALT[ba.after.roomType ?? ''] ?? 'room'} before renovation (illustrative)`,
      render: () =>
        renderRoomScene({
          id: ba.before.id,
          roomType: ba.after.roomType ?? 'living',
          style: p.styles[0] ?? 'contemporary',
          before: true,
        }),
    });
  }
}

/* ----------------------------- materials --------------------------------- */
for (const m of materials) {
  add({
    id: m.swatch.id,
    src: `/demo/materials/${m.slug}`,
    square: true,
    alt: `${m.name} — ${m.category.toLowerCase().replace(/_/g, ' ')} swatch${m.finish ? `, ${m.finish.toLowerCase().replace(/_/g, ' ')} finish` : ''}`,
    render: () =>
      renderSwatch({
        id: m.swatch.id,
        category: m.category,
        hex: m.hex,
        finish: m.finish,
        pattern: m.pattern,
        name: m.name,
        tier: m.tier,
      }),
  });
}

/* ----------------------------- designers --------------------------------- */
const ACCENTS = ['#B9705B', '#3E5B57', '#7A4E7A', '#1F4E4A', '#C97B4B', '#4B3B5A'];
designers.forEach((d, i) => {
  add({
    id: d.photo.id,
    src: `/demo/designers/${d.slug}`,
    square: true,
    alt: `Illustrated portrait placeholder for ${d.name}, ${d.role}`,
    render: () => renderPortrait(d.photo.id, d.name, ACCENTS[i % ACCENTS.length]!),
  });
});

/* ----------------------------- styles / rooms / services ------------------ */
const STYLE_ROOMS = ['living', 'living', 'master-bedroom', 'dining', 'kitchen'];
for (const s of styles) {
  const r = rng(`style-room:${s.slug}`);
  const room = r.pick(STYLE_ROOMS);
  add({
    id: s.heroImage.id,
    src: `/demo/styles/${s.slug}`,
    roomType: room,
    styleBucket: s.styleBucket,
    alt: `${s.name} style — ${ROOM_ALT[room]} concept (illustrative render)`,
    render: () =>
      renderRoomScene({ id: s.heroImage.id, roomType: room, style: s.styleBucket, hero: true }),
  });
}
const NICE_STYLES = [
  'modern-indian',
  'contemporary',
  'japandi',
  'scandinavian',
  'luxury',
  'indo-modern-fusion',
  'minimal',
];
for (const g of roomGuides) {
  const r = rng(`room-style:${g.slug}`);
  const style = r.pick(NICE_STYLES);
  add({
    id: g.heroImage.id,
    src: `/demo/rooms/${g.slug}`,
    roomType: g.roomType,
    styleBucket: style,
    alt: `${g.name} — ${styleName(style)} concept (illustrative render)`,
    render: () => renderRoomScene({ id: g.heroImage.id, roomType: g.roomType, style, hero: true }),
  });
}
const SERVICE_ROOM: Record<string, [string, string]> = {
  'full-home-interiors': ['living', 'modern-indian'],
  'modular-kitchen': ['kitchen', 'contemporary'],
  'wardrobes-storage': ['master-bedroom', 'minimal'],
  'living-room': ['living', 'contemporary'],
  bedroom: ['master-bedroom', 'japandi'],
  'pooja-room': ['pooja', 'traditional-indian'],
  'false-ceiling-lighting': ['living', 'luxury'],
  'home-renovation': ['dining', 'indo-modern-fusion'],
  'turnkey-execution': ['kitchen', 'modern-indian'],
  'design-consultation': ['study', 'scandinavian'],
  'office-interiors': ['office', 'contemporary'],
  'retail-restaurant': ['restaurant', 'industrial'],
};
for (const s of services) {
  const [room, style] = SERVICE_ROOM[s.slug] ?? ['living', 'contemporary'];
  add({
    id: s.heroImage.id,
    src: `/demo/services/${s.slug}`,
    roomType: room,
    styleBucket: style,
    alt: `${s.name} — ${ROOM_ALT[room]} in ${styleName(style)} style (illustrative render)`,
    render: () => renderRoomScene({ id: s.heroImage.id, roomType: room, style, hero: true }),
  });
}

/* ----------------------------- quiz --------------------------------------- */
const QUIZ: Record<string, { room: string; styles: string[] }> = {
  q1: { room: 'living', styles: ['modern-indian', 'industrial', 'scandinavian', 'luxury'] },
  q2: { room: 'kitchen', styles: ['contemporary', 'minimal', 'rustic', 'luxury'] },
  q3: { room: 'master-bedroom', styles: ['minimal', 'scandinavian', 'japandi', 'bohemian'] },
  q4: { room: 'master-bedroom', styles: ['minimal', 'industrial', 'traditional-indian', 'luxury'] },
  q5: { room: 'dining', styles: ['contemporary', 'modern-indian', 'bohemian', 'luxury'] },
  q6: { room: 'living', styles: ['coastal', 'contemporary', 'art-deco', 'japandi'] },
  q7: {
    room: 'living',
    styles: ['minimal', 'indo-modern-fusion', 'traditional-indian', 'bohemian'],
  },
  q8: { room: 'living', styles: ['budget-apartment', 'contemporary', 'premium-villa', 'luxury'] },
};
for (const q of quizQuestions) {
  const cfg = QUIZ[q.id] ?? { room: 'living', styles: STYLE_KEYS };
  q.options.forEach((o, i) => {
    const style = cfg.styles[i % cfg.styles.length]!;
    add({
      id: o.image.id,
      src: `/demo/quiz/${q.id}-${o.id}`,
      roomType: cfg.room,
      styleBucket: style,
      alt: `${o.label} — ${ROOM_ALT[cfg.room]} (illustrative render)`,
      render: () => renderRoomScene({ id: o.image.id, roomType: cfg.room, style, variant: i }),
    });
  });
}
for (const pr of quizProfiles) {
  add({
    id: pr.heroImage.id,
    src: `/demo/quiz/profile-${pr.id}`,
    roomType: 'living',
    styleBucket: pr.styleSlug,
    alt: `${pr.name} — living room concept (illustrative render)`,
    render: () =>
      renderRoomScene({ id: pr.heroImage.id, roomType: 'living', style: pr.styleSlug, hero: true }),
  });
}

/* ----------------------------- homepage heroes ---------------------------- */
[
  ['living', 'modern-indian'],
  ['kitchen', 'contemporary'],
  ['master-bedroom', 'luxury'],
].forEach(([room, style], i) => {
  const id = `hero-${String(i + 1).padStart(2, '0')}`;
  add({
    id,
    src: `/demo/hero/${id}`,
    roomType: room,
    styleBucket: style,
    alt: `${ROOM_ALT[room!]} in ${styleName(style!)} style (illustrative render)`,
    render: () => renderRoomScene({ id, roomType: room!, style: style!, hero: true }),
  });
});

/* ----------------------------- journal (MDX frontmatter) ------------------ */
const JOURNAL_DIR = resolve(ROOT, 'content/journal');
if (existsSync(JOURNAL_DIR)) {
  for (const file of readdirSync(JOURNAL_DIR).filter((f) => f.endsWith('.mdx'))) {
    const fm = readFileSync(resolve(JOURNAL_DIR, file), 'utf8').split('---')[1] ?? '';
    const get = (k: string) =>
      fm.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]+)["']?`, 'm'))?.[1]?.trim();
    const id = get('image');
    if (!id) continue;
    const room = get('imageRoom') ?? 'living';
    const style = get('imageStyle') ?? 'contemporary';
    add({
      id,
      src: `/demo/journal/${id}`,
      roomType: room,
      styleBucket: style,
      alt: `${get('title') ?? id} — ${ROOM_ALT[room] ?? room} (illustrative render)`,
      render: () => renderRoomScene({ id, roomType: room, style, hero: true }),
    });
  }
}

/* ----------------------------- templates ---------------------------------- */
for (const t of sceneTemplates) {
  add({
    id: `template-${t.slug}`,
    src: `/demo/templates/${t.slug}/base`,
    roomType: t.roomType,
    styleBucket: t.style,
    alt: t.alt,
    render: () => renderTemplateScene(t),
  });
}

/* ----------------------------- run ---------------------------------------- */

async function processJob(j: Job): Promise<ImageRef> {
  const basePath = resolve(PUBLIC, `.${j.src}`);
  const original = ['jpg', 'jpeg', 'png', 'webp']
    .map((e) => resolve(ORIGINALS, `${j.id}.${e}`))
    .find((p) => existsSync(p));
  let width: number;
  let height: number;
  let blurHash: string;
  let palette: string[];
  const widths = j.square ? WIDTHS.filter((w) => w <= 1200) : WIDTHS;

  if (original) {
    const master = await sharp(original)
      .rotate()
      .resize({ width: 2000, withoutEnlargement: true })
      .png()
      .toBuffer();
    const meta = await sharp(master).metadata();
    width = meta.width ?? 2000;
    height = meta.height ?? 1333;
    if (FORCE || !outputsExist(basePath, widths)) {
      ensureDir(basePath);
      await Promise.all(
        widths.flatMap((w) => [
          sharp(master)
            .resize({ width: w, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(`${basePath}-${w}.webp`),
          sharp(master)
            .resize({ width: w, withoutEnlargement: true })
            .avif({ quality: 55, effort: 3 })
            .toFile(`${basePath}-${w}.avif`),
        ]),
      );
    }
    [blurHash, palette] = await Promise.all([blurhashOf(master), paletteOf(master)]);
  } else if (!FORCE && outputsExist(basePath, widths) && cache[j.id]) {
    return { ...cache[j.id]!, alt: j.alt, roomType: j.roomType, styleBucket: j.styleBucket };
  } else {
    const svg = j.render();
    const res = await encodeSvg(svg, basePath, { before: j.before, widths, skipExisting: !FORCE });
    ({ width, height, blurHash, palette } = res);
  }
  return {
    id: j.id,
    src: j.src,
    width,
    height,
    blurHash,
    alt: j.alt,
    roomType: j.roomType,
    styleBucket: j.styleBucket,
    credit: original
      ? { source: 'original', licence: 'owned' }
      : { source: 'original', licence: 'owned' },
    synthetic: !original,
    palette,
  };
}

/** Existing manifest entries so unchanged files keep their blurhash without re-rendering. */
let cache: Record<string, ImageRef> = {};
try {
  const txt = readFileSync(MANIFEST, 'utf8');
  const json = txt.slice(txt.indexOf('= ') + 2, txt.lastIndexOf(';'));
  if (json.trim().startsWith('{')) cache = JSON.parse(json) as Record<string, ImageRef>;
} catch {
  cache = {};
}

async function generateTemplateMasks() {
  for (const t of sceneTemplates) {
    for (const s of t.surfaces) {
      const out = resolve(PUBLIC, `./demo/templates/${t.slug}/mask-${s.id}.png`);
      if (!FORCE && existsSync(out)) continue;
      await encodeMask(renderMaskSvg(s.polygon), out, 1.2);
    }
  }
}

async function main() {
  let list = ONLY ? jobs.filter((j) => j.id.startsWith(ONLY) || j.src.includes(ONLY)) : jobs;
  if (ROOM) list = list.filter((j) => j.roomType === ROOM);
  if (LIMIT) list = list.slice(0, LIMIT);
  console.log(
    `Rendering ${list.length}/${jobs.length} images (concurrency ${CONCURRENCY}${FORCE ? ', force' : ''})…`,
  );
  const t0 = Date.now();
  const results: Record<string, ImageRef> = { ...cache };
  let done = 0;
  let idx = 0;
  const worker = async () => {
    while (idx < list.length) {
      const j = list[idx++]!;
      try {
        results[j.id] = await processJob(j);
      } catch (e) {
        console.error(`\n✖ ${j.id}:`, (e as Error).message);
        throw e;
      }
      done++;
      if (done % 10 === 0 || done === list.length)
        process.stdout.write(
          `\r  ${done}/${list.length}  ${((Date.now() - t0) / 1000).toFixed(0)}s   `,
        );
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log();

  if (!ONLY || ONLY.startsWith('template')) {
    await generateTemplateMasks();
    console.log(`Masks written for ${sceneTemplates.length} templates.`);
  }

  // Drop manifest entries that no longer have a job (only when doing a full run)
  const final: Record<string, ImageRef> = {};
  const keep = ONLY || LIMIT || ROOM ? Object.keys(results) : jobs.map((j) => j.id);
  for (const id of keep.sort()) if (results[id]) final[id] = results[id]!;

  const body = `/* AUTO-GENERATED by scripts/fetch-demo-assets.ts — do not edit by hand. */\nimport type { ImageRef } from '@/types/content';\n\nexport const GENERATED_IMAGES: Record<string, ImageRef> = ${JSON.stringify(final, null, 2)};\n`;
  writeText(MANIFEST, body);
  console.log(
    `✔ Manifest: ${Object.keys(final).length} images → src/data/demo/images.generated.ts (${((Date.now() - t0) / 1000).toFixed(0)}s)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

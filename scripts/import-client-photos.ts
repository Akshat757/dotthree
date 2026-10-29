/**
 * Imports the client's own renders from ./dot3_photos into the site:
 *   public/dot3/<id>-{400,800,1200,2000}.{avif,webp}
 *   src/data/client/photos.generated.ts   (typed ImageRef manifest — do not edit by hand)
 *   public/brand/*                         (transparent logo variants)
 *
 * Edit the PHOTOS table below to rename, re-caption or add pictures, then run:
 *   npm run assets:client
 *
 * Duplicates in the source folder (WhatsApp re-sends of the same render) are skipped on purpose.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { blurhashOf, paletteOf, WIDTHS } from './lib/encode';

const ROOT = process.cwd();
const SRC = join(ROOT, 'dot3_photos');
const OUT = join(ROOT, 'public', 'dot3');

type Category = 'exterior' | 'outdoor' | 'bedroom' | 'bathroom' | 'interior';

interface PhotoSpec {
  /** Path relative to dot3_photos */
  file: string;
  id: string;
  category: Category;
  alt: string;
  caption: string;
  /** Strip the black letterbox bars WhatsApp added */
  trimBars?: boolean;
}

const PHOTOS: PhotoSpec[] = [
  {
    file: '01.PNG',
    id: 'dot3-villa-front-day',
    category: 'exterior',
    alt: 'Two-storey villa with a curved terracotta-lined balcony, stone cladding, a thatched porch roof and tall timber gates',
    caption: 'Villa frontage with a stone-clad curved balcony and thatched entrance canopy',
  },
  {
    file: 'RENDER.png',
    id: 'dot3-evara-elevation-dusk',
    category: 'exterior',
    alt: 'Three-storey contemporary home at sunset with a timber soffit, stone feature wall, planted terraces and a lit nameplate',
    caption: 'Contemporary three-storey residence at dusk',
  },
  {
    file: 'RENDER 1.png',
    id: 'dot3-evara-corner-dusk',
    category: 'exterior',
    alt: 'Corner view of a contemporary three-storey home at twilight with warm wall lights and a timber-clad boundary wall',
    caption: 'Corner view of the same residence at twilight',
  },
  {
    file: 'Final render .jpg.jpeg',
    id: 'dot3-curved-balcony-night',
    category: 'exterior',
    alt: 'Night view of a house with sweeping curved balconies, planted edges, timber soffits and a slatted gate',
    caption: 'Curved-balcony residence with layered lighting at night',
  },
  {
    file: 'WhatsApp Image 2026-10-06 at 5.56.29 PM.jpeg',
    id: 'dot3-apartment-block-night',
    category: 'exterior',
    alt: 'Five-storey apartment building at night with warm-lit balconies, planter ledges and a city skyline behind',
    caption: 'Five-storey apartment building at night',
  },
  {
    file: '12.png',
    id: 'dot3-villa-entry-courtyard',
    category: 'exterior',
    alt: 'Villa entrance courtyard with arched stone walls, a floating curved balcony with a round window and crazy-paved flooring',
    caption: 'Entrance courtyard with arched stone walls and a floating balcony',
  },
  {
    file: 'WhatsApp Image 2026-10-06 at 5.51.03 PM.jpeg',
    id: 'dot3-villa-rear-garden',
    category: 'outdoor',
    alt: 'Rear garden of a villa with a lawn, planted beds, wicker chairs and a sliding glass door into the living room',
    caption: 'Rear lawn and sit-out opening into the living room',
  },
  {
    file: 'WhatsApp Unknown 2026-10-25 at 4.38.44 PM/WhatsApp Image 2026-10-06 at 5.51.03 PM.jpeg',
    id: 'dot3-courtyard-aerial',
    category: 'outdoor',
    alt: 'Aerial view of a walled courtyard garden with a plunge pool, spa, thatched pavilion, stone-paved paths and a roof terrace',
    caption: 'Courtyard garden with plunge pool, pavilion and roof terrace, seen from above',
  },
  {
    file: '9.png',
    id: 'dot3-pool-sunset',
    category: 'outdoor',
    alt: 'Garden pool with a waterfall spout beside a textured plaster house, a stone feature wall and sculpted face reliefs at sunset',
    caption: 'Plunge pool with a water feature and sculpted wall art at sunset',
  },
  {
    file: '14.png',
    id: 'dot3-pool-bar',
    category: 'outdoor',
    alt: 'Outdoor bar with a black granite counter beside a pool, under a thatched roof, with arched stone niches in the garden wall',
    caption: 'Poolside bar under a thatched canopy',
  },
  {
    file: '10.png',
    id: 'dot3-roof-terrace',
    category: 'outdoor',
    alt: 'Roof terrace with a timber pergola, built-in terracotta seating with warm underlighting, stone niches with planting and a timber door',
    caption: 'Roof terrace with built-in seating and a timber pergola',
  },
  {
    file: '15.png',
    id: 'dot3-master-bedroom-warm',
    category: 'bedroom',
    alt: 'Spacious master bedroom with a timber ceiling and cove lighting, textured plaster walls, a upholstered bed and two lounge chairs',
    caption: 'Master bedroom with cove-lit timber ceiling and textured walls',
  },
  {
    file: 'WhatsApp Unknown 2026-10-25 at 4.39.01 PM/WhatsApp Image 2026-10-06 at 5.53.14 PM.jpeg',
    id: 'dot3-twin-bedroom-rose',
    category: 'bedroom',
    alt: 'Twin bedroom in dusty rose with a floral wall mural, timber headboard panels, pendant lights and sheer curtains',
    caption: 'Twin bedroom in rose and timber with a hand-painted style mural',
    trimBars: true,
  },
  {
    file: 'WhatsApp Unknown 2026-10-25 at 4.39.01 PM/WhatsApp Image 2026-10-06 at 5.53.15 PM (1).jpeg',
    id: 'dot3-stair-atrium',
    category: 'interior',
    alt: 'Double-height entrance hall with a floating stone staircase, glass balustrade, a backlit perforated feature wall and planting',
    caption: 'Entrance hall with a floating stair and a backlit perforated wall',
  },
  {
    file: 'WhatsApp Unknown 2026-10-25 at 4.39.01 PM/WhatsApp Image 2026-10-06 at 5.53.15 PM.jpeg',
    id: 'dot3-powder-room-mirrors',
    category: 'bathroom',
    alt: 'Powder room with two backlit pebble-shaped mirrors, a floating vanity, brass taps and a floral mosaic wall',
    caption: 'Powder room with backlit mirrors and a floral stone mosaic',
  },
  {
    file: 'WhatsApp Unknown 2026-10-25 at 4.39.01 PM/WhatsApp Image 2026-10-06 at 5.53.15 PM (2).jpeg',
    id: 'dot3-bathroom-mosaic-shower',
    category: 'bathroom',
    alt: 'Bathroom with a floral mosaic feature wall, a backlit onyx-look shower panel, brass fittings and a timber door',
    caption: 'Bathroom with a mosaic feature wall and a backlit stone shower panel',
    trimBars: true,
  },
  {
    file: 'WhatsApp Unknown 2026-10-25 at 4.39.01 PM/WhatsApp Image 2026-10-06 at 5.53.16 PM.jpeg',
    id: 'dot3-bathroom-spa-tub',
    category: 'bathroom',
    alt: 'Spa bathroom with a built-in tub on a stone plinth, a deep red tile panel, brass taps and cove lighting',
    caption: 'Spa bathroom with a plinth-mounted tub and a deep red tile niche',
  },
  {
    file: 'WhatsApp Unknown 2026-10-25 at 4.39.01 PM/WhatsApp Image 2026-10-06 at 5.53.16 PM (1).jpeg',
    id: 'dot3-bathroom-red-arches',
    category: 'bathroom',
    alt: 'Bathroom with arched red scalloped-tile niches, an organic-shaped mirror, a floating timber vanity and a ribbed-glass shower',
    caption: 'Bathroom with arched red tile niches and a ribbed-glass shower',
  },
];

const FORMATS = ['avif', 'webp'] as const;

async function importPhotos() {
  mkdirSync(OUT, { recursive: true });
  const entries: string[] = [];

  for (const p of PHOTOS) {
    let pipeline = sharp(join(SRC, p.file)).rotate();
    if (p.trimBars)
      pipeline = sharp(await pipeline.trim({ background: '#000000', threshold: 24 }).toBuffer());
    const master = await pipeline.toBuffer();
    const meta = await sharp(master).metadata();
    const width = meta.width ?? 1600;
    const height = meta.height ?? 900;

    for (const w of WIDTHS) {
      // Sources are ~1600px: never enlarge, so the 2000 file is simply the full-size picture.
      const target = Math.min(w, width);
      for (const fmt of FORMATS) {
        const img = sharp(master).resize({ width: target, withoutEnlargement: true });
        const dest = join(OUT, `${p.id}-${w}.${fmt}`);
        if (fmt === 'avif') await img.avif({ quality: 55, effort: 4 }).toFile(dest);
        else await img.webp({ quality: 80 }).toFile(dest);
      }
    }

    const blurHash = await blurhashOf(master);
    const palette = await paletteOf(master, 5);
    entries.push(`  {
    ref: {
      id: ${JSON.stringify(p.id)},
      src: ${JSON.stringify(`/dot3/${p.id}`)},
      width: ${width},
      height: ${height},
      blurHash: ${JSON.stringify(blurHash)},
      alt: ${JSON.stringify(p.alt)},
      caption: ${JSON.stringify(p.caption)},
      roomType: ${JSON.stringify(p.category)},
      credit: { source: 'original', licence: 'owned' },
      palette: ${JSON.stringify(palette)},
    },
    category: ${JSON.stringify(p.category)},
  }`);
    console.log(`  ✔ ${p.id} (${width}×${height})`);
  }

  const out = `/* AUTO-GENERATED by scripts/import-client-photos.ts — do not edit by hand. */
import type { ImageRef } from '@/types/content';

export type PortfolioCategory = 'exterior' | 'outdoor' | 'bedroom' | 'bathroom' | 'interior';

export interface PortfolioPhoto {
  ref: ImageRef;
  category: PortfolioCategory;
}

export const PORTFOLIO_PHOTOS: PortfolioPhoto[] = [
${entries.join(',\n')},
];
`;
  mkdirSync(join(ROOT, 'src', 'data', 'client'), { recursive: true });
  writeFileSync(join(ROOT, 'src', 'data', 'client', 'photos.generated.ts'), out, 'utf8');
}

/** White-background logo → transparent PNG; black strokes either kept (for light pages) or turned white (dark pages). */
async function logoVariant(
  file: string,
  name: string,
  invertBlack: boolean,
  crop?: { left: number; top: number; width: number; height: number },
) {
  let src = sharp(readFileSync(join(SRC, file)));
  if (crop) src = sharp(await src.extract(crop).toBuffer());
  const { data, info } = await src.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3]!;
    const g = data[i * 3 + 1]!;
    const b = data[i * 3 + 2]!;
    const alpha = 255 - Math.min(r, g, b);
    const isRed = r - Math.max(g, b) > 60;
    const [or, og, ob] = isRed ? [237, 28, 36] : invertBlack ? [255, 255, 255] : [0, 0, 0];
    rgba[i * 4] = or;
    rgba[i * 4 + 1] = og;
    rgba[i * 4 + 2] = ob;
    rgba[i * 4 + 3] = alpha;
  }
  const trimmed = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 8 })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const meta = await sharp(trimmed).metadata();
  mkdirSync(join(ROOT, 'public', 'brand'), { recursive: true });
  writeFileSync(join(ROOT, 'public', 'brand', `${name}.png`), trimmed);
  console.log(`  ✔ brand/${name}.png (${meta.width}×${meta.height})`);
}

async function importLogo() {
  // LOGO.jpg.jpeg (2535×1117): mark + wordmark + discipline line
  await logoVariant('LOGO.jpg.jpeg', 'logo-full', false);
  await logoVariant('LOGO.jpg.jpeg', 'logo-full-light', true);
  // Wordmark only (no discipline line), from the 2535-wide file's upper area
  await logoVariant('LOGO.jpg.jpeg', 'logo-lockup', false, {
    left: 0,
    top: 0,
    width: 2535,
    height: 820,
  });
  await logoVariant('LOGO.jpg.jpeg', 'logo-lockup-light', true, {
    left: 0,
    top: 0,
    width: 2535,
    height: 820,
  });
}

async function main() {
  console.log('Importing photos…');
  await importPhotos();
  console.log('Importing logo…');
  await importLogo();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

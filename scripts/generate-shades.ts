/**
 * Generates 240 original paint shades in OKLCH — SRS §11.5.
 * Deterministic (seeded), legally clean (no brand names), committed as
 * src/data/shades/shades.generated.ts. Run: npm run assets:shades
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { formatHex, oklch, wcagLuminance } from 'culori';

type Tier = 'ESSENTIAL' | 'STANDARD' | 'PREMIUM' | 'LUXURY';
type Tonality = 'warm' | 'cool' | 'neutral' | 'bold' | 'pastel' | 'earthy' | 'jewel';

interface Family {
  key: string;
  label: string;
  hue: [number, number];
  l: [number, number];
  c: [number, number];
  count: number;
  rooms: string[];
  first: string[];
  second: string[];
}

// Curated hue families weighted toward the muted, liveable range Indian homes use.
const FAMILIES: Family[] = [
  {
    key: 'off-white',
    label: 'Off-whites',
    hue: [60, 95],
    l: [0.93, 0.985],
    c: [0.004, 0.025],
    count: 30,
    rooms: ['living', 'bedroom', 'kitchen', 'pooja', 'kids-room', 'study', 'ceiling'],
    first: [
      'Ivory',
      'Milk',
      'Cotton',
      'Chalk',
      'Linen',
      'Rice',
      'Pearl',
      'Muslin',
      'Salt',
      'Jasmine',
      'Kaolin',
      'Paper',
      'Bone',
      'Coconut',
      'Moonlit',
    ],
    second: ['Mist', 'Light', 'Whisper', 'Veil', 'Hush', 'Morning', 'Drift', 'Glow', 'Air', 'Dawn'],
  },
  {
    key: 'warm-neutral',
    label: 'Warm neutrals',
    hue: [55, 85],
    l: [0.72, 0.92],
    c: [0.02, 0.06],
    count: 36,
    rooms: ['living', 'bedroom', 'dining', 'foyer', 'study'],
    first: [
      'Sand',
      'Oat',
      'Wheat',
      'Biscuit',
      'Almond',
      'Khadi',
      'Jute',
      'Malwa',
      'Dune',
      'Barley',
      'Cane',
      'Camel',
      'Fawn',
      'Chikki',
      'Sesame',
      'Toast',
      'Halwa',
      'Cashew',
    ],
    second: [
      'Stone',
      'Clay',
      'Dust',
      'Weave',
      'Field',
      'Shade',
      'Warmth',
      'Loam',
      'Path',
      'Hearth',
    ],
  },
  {
    key: 'cool-neutral',
    label: 'Cool neutrals',
    hue: [220, 270],
    l: [0.7, 0.93],
    c: [0.005, 0.03],
    count: 24,
    rooms: ['living', 'bedroom', 'bathroom', 'study', 'office'],
    first: [
      'Monsoon',
      'Slate',
      'Dove',
      'Pebble',
      'Fog',
      'Ash',
      'Silver',
      'Cloud',
      'River',
      'Steel',
      'Frost',
      'Quarry',
    ],
    second: ['Grey', 'Veil', 'Haze', 'Stone', 'Shadow', 'Calm', 'Wash', 'Hush'],
  },
  {
    key: 'grey',
    label: 'Greys',
    hue: [40, 90],
    l: [0.45, 0.75],
    c: [0.004, 0.02],
    count: 18,
    rooms: ['living', 'study', 'office', 'kitchen', 'accent'],
    first: [
      'Basalt',
      'Granite',
      'Charcoal',
      'Smoke',
      'Flint',
      'Graphite',
      'Storm',
      'Mica',
      'Iron',
      'Cinder',
    ],
    second: ['Grey', 'Dusk', 'Depth', 'Edge', 'Shade', 'Night'],
  },
  {
    key: 'green',
    label: 'Greens',
    hue: [120, 165],
    l: [0.45, 0.9],
    c: [0.03, 0.11],
    count: 30,
    rooms: ['living', 'bedroom', 'study', 'balcony', 'pooja'],
    first: [
      'Sage',
      'Neem',
      'Tulsi',
      'Fern',
      'Moss',
      'Olive',
      'Betel',
      'Pista',
      'Banyan',
      'Cardamom',
      'Mint',
      'Peepal',
      'Vetiver',
      'Lichen',
      'Bamboo',
    ],
    second: [
      'Whisper',
      'Leaf',
      'Grove',
      'Shade',
      'Field',
      'Hollow',
      'Morning',
      'Deep',
      'Light',
      'Calm',
    ],
  },
  {
    key: 'terracotta',
    label: 'Terracottas',
    hue: [30, 55],
    l: [0.45, 0.8],
    c: [0.06, 0.15],
    count: 30,
    rooms: ['living', 'dining', 'foyer', 'accent', 'balcony'],
    first: [
      'Rajwada',
      'Malwa',
      'Kiln',
      'Sindoor',
      'Brick',
      'Laterite',
      'Mandu',
      'Kumhar',
      'Ochre',
      'Ember',
      'Chai',
      'Copper',
      'Gulal',
      'Kesar',
      'Rust',
    ],
    second: ['Clay', 'Rose', 'Glow', 'Earth', 'Dusk', 'Warmth', 'Kiln', 'Blush', 'Sun', 'Hearth'],
  },
  {
    key: 'ochre',
    label: 'Ochres & yellows',
    hue: [70, 100],
    l: [0.6, 0.9],
    c: [0.05, 0.14],
    count: 22,
    rooms: ['kitchen', 'pooja', 'kids-room', 'dining', 'accent'],
    first: [
      'Turmeric',
      'Marigold',
      'Mustard',
      'Honey',
      'Ghee',
      'Sunlit',
      'Amber',
      'Haldi',
      'Lantern',
      'Besan',
      'Straw',
    ],
    second: ['Light', 'Glow', 'Field', 'Gold', 'Morning', 'Warmth', 'Dust', 'Haze'],
  },
  {
    key: 'blue',
    label: 'Blues',
    hue: [220, 260],
    l: [0.4, 0.9],
    c: [0.04, 0.13],
    count: 26,
    rooms: ['bedroom', 'bathroom', 'kids-room', 'study', 'pooja'],
    first: [
      'Indigo',
      'Neel',
      'Narmada',
      'Peacock',
      'Denim',
      'Lapis',
      'Harbour',
      'Shipra',
      'Twilight',
      'Cobalt',
      'Sapphire',
      'Powder',
      'Ink',
    ],
    second: ['Blue', 'Night', 'Depth', 'Mist', 'Calm', 'Wash', 'Tide', 'Dusk', 'Hush'],
  },
  {
    key: 'pink',
    label: 'Roses & blush',
    hue: [0, 30],
    l: [0.7, 0.93],
    c: [0.025, 0.08],
    count: 14,
    rooms: ['bedroom', 'kids-room', 'pooja', 'accent'],
    first: ['Rajwada', 'Gulab', 'Lotus', 'Blush', 'Petal', 'Quartz', 'Rosewater', 'Dawn'],
    second: ['Rose', 'Blush', 'Veil', 'Light', 'Mist', 'Bloom'],
  },
  {
    key: 'brown',
    label: 'Browns',
    hue: [45, 75],
    l: [0.3, 0.6],
    c: [0.03, 0.09],
    count: 10,
    rooms: ['living', 'study', 'accent', 'foyer'],
    first: ['Teak', 'Walnut', 'Cocoa', 'Sheesham', 'Jaggery', 'Umber', 'Coffee', 'Bark'],
    second: ['Brown', 'Depth', 'Shade', 'Night', 'Earth'],
  },
];

// Small deterministic PRNG (mulberry32)
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Words that must never appear (brand shade names or trademarks we know of)
const BLOCKLIST = new Set([
  'royale',
  'apex',
  'tractor',
  'weathershield',
  'velvet touch',
  'silk',
  'easy clean',
]);

function tonalityOf(l: number, c: number, h: number): Tonality {
  if (c < 0.02) return 'neutral';
  if (l > 0.86 && c < 0.07) return 'pastel';
  if (c > 0.11 && l < 0.6) return 'jewel';
  if (c > 0.1) return 'bold';
  if (h >= 30 && h <= 100 && l < 0.8) return 'earthy';
  if (h >= 200 || h <= 20) return 'cool';
  return 'warm';
}

function tierOf(i: number, c: number): Tier {
  // Deep, saturated shades cost more (more pigment); spread the rest.
  if (c > 0.11) return i % 3 === 0 ? 'LUXURY' : 'PREMIUM';
  const r = i % 10;
  if (r < 4) return 'ESSENTIAL';
  if (r < 7) return 'STANDARD';
  if (r < 9) return 'PREMIUM';
  return 'LUXURY';
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function main() {
  const rand = rng(20260901);
  const usedNames = new Set<string>();
  const usedSlugs = new Set<string>();
  const out: string[] = [];
  let code = 1001;
  let index = 0;

  for (const fam of FAMILIES) {
    for (let k = 0; k < fam.count; k++) {
      // Stratified sampling across lightness so each family spans light → deep
      const t = (k + 0.5) / fam.count;
      const l = fam.l[0] + (fam.l[1] - fam.l[0]) * (1 - t) + (rand() - 0.5) * 0.02;
      const c = fam.c[0] + (fam.c[1] - fam.c[0]) * (0.35 + 0.65 * rand());
      const h = fam.hue[0] + (fam.hue[1] - fam.hue[0]) * rand();
      const color = oklch({ mode: 'oklch', l, c, h });
      const hex = formatHex(color)!.toUpperCase();

      let name = '';
      for (let tries = 0; tries < 50; tries++) {
        const a = fam.first[Math.floor(rand() * fam.first.length)]!;
        const b = fam.second[Math.floor(rand() * fam.second.length)]!;
        const cand = `${a} ${b}`;
        if (!usedNames.has(cand) && !BLOCKLIST.has(cand.toLowerCase())) {
          name = cand;
          break;
        }
      }
      if (!name) name = `${fam.first[k % fam.first.length]} ${code}`;
      usedNames.add(name);
      let slug = slugify(name);
      if (usedSlugs.has(slug)) slug = `${slug}-${code}`;
      usedSlugs.add(slug);

      const lrv = Math.round(wcagLuminance(color) * 100);
      const shade = {
        code: `AG-${code}`,
        slug,
        name,
        hex,
        oklch: { l: +l.toFixed(4), c: +c.toFixed(4), h: +h.toFixed(1) },
        family: fam.key,
        tonality: tonalityOf(l, c, h),
        lrv,
        rooms: fam.rooms,
        tier: tierOf(index, c),
      };
      out.push(JSON.stringify(shade));
      code++;
      index++;
    }
  }

  const file = `/* AUTO-GENERATED by scripts/generate-shades.ts — do not edit by hand. ${out.length} shades. */
import type { Shade } from '@/types/content';

export const SHADE_FAMILIES = ${JSON.stringify(
    FAMILIES.map((f) => ({ key: f.key, label: f.label })),
    null,
    2,
  )} as const;

export const shades: Shade[] = [
${out.map((s) => `  ${s},`).join('\n')}
];
`;
  const dir = resolve(process.cwd(), 'src/data/shades');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'shades.generated.ts'), file);
  console.log(`Wrote ${out.length} shades → src/data/shades/shades.generated.ts`);
}

main();

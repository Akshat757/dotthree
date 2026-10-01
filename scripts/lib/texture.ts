/**
 * Procedural, tileable PBR texture fallbacks (albedo SVG + derived normal/roughness).
 * Used when ambientCG downloads are unavailable so the visualiser always has textures.
 */
import sharp from 'sharp';

import { mix, shade, withAlpha } from './color';
import { rng, type Rng } from './prng';

export const TEX = 1024;

export type TexKind =
  | 'wood'
  | 'wood-fluted'
  | 'marble'
  | 'granite'
  | 'tile-subway'
  | 'tile-zellige'
  | 'tile-fishscale'
  | 'tile-athangudi'
  | 'fabric'
  | 'fabric-velvet'
  | 'fabric-boucle'
  | 'fabric-ikat'
  | 'fabric-sheer'
  | 'wallpaper-blockprint'
  | 'wallpaper-botanical'
  | 'wallpaper-clouds'
  | 'wallpaper-grasscloth'
  | 'wallpaper-jaali'
  | 'plaster'
  | 'plaster-rough'
  | 'plaster-metallic'
  | 'metal'
  | 'stone'
  | 'terrazzo'
  | 'concrete'
  | 'cane'
  | 'leather'
  | 'laminate';

export interface TexSpec {
  slug: string;
  kind: TexKind;
  base: string;
  accent?: string;
  /** 0 = mirror-like, 1 = fully rough */
  roughness: number;
  /** Normal map strength multiplier */
  bump: number;
}

const f = (n: number) => Math.round(n * 10) / 10;

/* Tileable helpers: shapes are drawn with wrapped copies so edges match. */

/** Draw a shape and its 8 wrapped copies so edges tile seamlessly. */
function wrapped(shape: (dx: number, dy: number) => string, size: number): string {
  let out = '';
  for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) out += shape(dx, dy);
  return out;
}

function grain(slope = 0.08, freq = 0.9): string {
  return `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" stitchTiles="stitch" seed="7"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="${slope}"/></feComponentTransfer></filter>`;
}

export function albedoSvg(spec: TexSpec): string {
  const r = rng(`tex:${spec.slug}`);
  const b = spec.base;
  const a = spec.accent ?? shade(b, -0.18);
  const defs: string[] = [
    grain(spec.kind.startsWith('plaster') || spec.kind === 'concrete' ? 0.16 : 0.07),
  ];
  const body: string[] = [`<rect width="${TEX}" height="${TEX}" fill="${b}"/>`];
  const S = TEX;

  const stroke = (color: string, w: number, d: string, op = 0.7) =>
    `<path d="${d}" stroke="${color}" stroke-width="${f(w)}" fill="none" opacity="${f(op)}" stroke-linecap="round"/>`;
  const circle = (x: number, y: number, rad: number, fill: string, op = 1) =>
    `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" fill="${fill}" opacity="${f(op)}"/>`;

  const woodGrain = (vertical: boolean, n = 36) => {
    // tileable: curves run the full length and start/end at the same offset
    for (let i = 0; i < n; i++) {
      const pos = (i / n) * S + r.range(-10, 10);
      const wob = r.range(6, 30);
      const col = shade(b, -0.05 - r.next() * 0.1);
      const w = r.range(1.2, 5);
      const d = vertical
        ? `M${f(pos)} 0 C ${f(pos + wob)} ${S * 0.3}, ${f(pos - wob)} ${S * 0.6}, ${f(pos)} ${S}`
        : `M0 ${f(pos)} C ${S * 0.3} ${f(pos + wob)}, ${S * 0.6} ${f(pos - wob)}, ${S} ${f(pos)}`;
      body.push(stroke(col, w, d, r.range(0.35, 0.8)));
    }
  };
  const speckle = (colors: string[], n: number, size: [number, number], size2 = S) => {
    for (let i = 0; i < n; i++) {
      const x = r.range(0, size2),
        y = r.range(0, size2),
        rad = r.range(size[0], size[1]),
        c = r.pick(colors),
        op = r.range(0.4, 0.9);
      body.push(
        wrapped(
          (dx, dy) =>
            x + dx < -rad || x + dx > S + rad || y + dy < -rad || y + dy > S + rad
              ? ''
              : circle(x + dx, y + dy, rad, c, op),
          size2,
        ),
      );
    }
  };
  const grid = (
    cell: number,
    grout: string,
    gw: number,
    offsetRows = false,
    cellFill?: (x: number, y: number) => string,
  ) => {
    body.push(`<rect width="${S}" height="${S}" fill="${grout}"/>`);
    for (let y = 0; y < S; y += cell) {
      const off = offsetRows && (y / cell) % 2 ? cell / 2 : 0;
      for (let x = -cell; x < S + cell; x += cell) {
        body.push(
          `<rect x="${f(x + off + gw / 2)}" y="${f(y + gw / 2)}" width="${f(cell - gw)}" height="${f(cell - gw)}" rx="2" fill="${cellFill ? cellFill(x, y) : shade(b, r.jitter(0.02))}"/>`,
        );
      }
    }
  };
  const weave = (spacing: number, w: number, c1 = shade(b, -0.06), c2 = shade(b, 0.06)) => {
    for (let x = 0; x < S; x += spacing) body.push(stroke(c1, w, `M${x} 0 V ${S}`, 0.55));
    for (let y = 0; y < S; y += spacing) body.push(stroke(c2, w, `M0 ${y} H ${S}`, 0.55));
  };
  const veins = (color: string, n: number) => {
    for (let i = 0; i < n; i++) {
      const y0 = r.range(0, S);
      // a horizontal-ish vein spanning the tile; ends at the same y so it wraps horizontally,
      // and a copy shifted by ±S makes it wrap vertically.
      const d = `M0 ${f(y0)} c ${f(r.range(150, 350))} ${f(r.range(-180, 180))}, ${f(r.range(500, 800))} ${f(r.range(-150, 250))}, ${S} ${f(y0)}`;
      const w = r.range(1.5, 7);
      const op = r.range(0.3, 0.75);
      for (const dy of [-S, 0, S])
        body.push(
          `<path d="${d}" stroke="${color}" stroke-width="${f(w)}" fill="none" opacity="${f(op)}" stroke-linecap="round" transform="translate(0 ${dy})"/>`,
        );
    }
  };

  switch (spec.kind) {
    case 'wood':
    case 'laminate':
      woodGrain(true, spec.kind === 'laminate' ? 22 : 36);
      if (spec.kind === 'wood' && r.chance(0.5))
        body.push(
          `<ellipse cx="${f(r.range(200, 800))}" cy="${f(r.range(200, 800))}" rx="${f(r.range(14, 36))}" ry="${f(r.range(8, 20))}" fill="${shade(b, -0.22)}" opacity="0.55"/>`,
        );
      break;
    case 'wood-fluted': {
      const w = 64;
      for (let x = 0; x < S; x += w) {
        body.push(
          `<rect x="${x}" y="0" width="${w / 2}" height="${S}" fill="${shade(b, 0.06)}"/><rect x="${x + w / 2}" y="0" width="${w / 2}" height="${S}" fill="${shade(b, -0.07)}"/><rect x="${x + w - 4}" y="0" width="4" height="${S}" fill="${shade(b, -0.18)}"/>`,
        );
      }
      woodGrain(true, 20);
      break;
    }
    case 'marble':
      veins(a, 7);
      defs.push(
        `<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${withAlpha('#fff', 0.12)}"/><stop offset="1" stop-color="${withAlpha('#000', 0.06)}"/></linearGradient>`,
      );
      body.push(`<rect width="${S}" height="${S}" fill="url(#sheen)"/>`);
      break;
    case 'granite':
      speckle([shade(b, 0.25), shade(b, 0.12), shade(b, -0.12), a], 1800, [1.5, 6]);
      break;
    case 'stone':
      speckle([shade(b, 0.08), shade(b, -0.08)], 900, [2, 8]);
      veins(shade(b, -0.1), 3);
      break;
    case 'terrazzo':
      speckle([a, shade(b, -0.3), '#C9B27F', '#7A8A9A', '#FFFFFF'], 260, [6, 26]);
      break;
    case 'concrete':
      speckle([shade(b, -0.05), shade(b, 0.05)], 1600, [1, 5]);
      for (let i = 0; i < 12; i++)
        body.push(
          stroke(
            shade(b, -0.1),
            r.range(1, 2.5),
            `M${f(r.range(0, S))} ${f(r.range(0, S))} l ${f(r.range(-180, 180))} ${f(r.range(-100, 100))}`,
            0.3,
          ),
        );
      break;
    case 'tile-subway':
      grid(128, shade(b, -0.14), 6, true);
      break;
    case 'tile-zellige':
      grid(128, shade(b, -0.2), 5, false, () => mix(b, a, r.range(0, 0.45)));
      break;
    case 'tile-fishscale': {
      body.push(`<rect width="${S}" height="${S}" fill="${shade(b, -0.18)}"/>`);
      const rad = 64;
      for (let y = 0; y <= S + rad; y += rad)
        for (let x = -rad; x <= S + rad; x += rad * 2)
          body.push(circle(x + ((y / rad) % 2) * rad, y, rad - 2, shade(b, r.jitter(0.03))));
      break;
    }
    case 'tile-athangudi':
      grid(256, shade(b, -0.14), 5, false);
      for (let y = 0; y < S; y += 256)
        for (let x = 0; x < S; x += 256) {
          body.push(
            `<polygon points="${x + 128},${y + 22} ${x + 234},${y + 128} ${x + 128},${y + 234} ${x + 22},${y + 128}" fill="${a}" opacity="0.85"/><circle cx="${x + 128}" cy="${y + 128}" r="34" fill="${b}"/><circle cx="${x + 128}" cy="${y + 128}" r="14" fill="${shade(a, -0.2)}"/>`,
          );
        }
      break;
    case 'fabric':
      weave(8, 1.6);
      break;
    case 'fabric-velvet':
      defs.push(
        `<linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(b, 0.1)}"/><stop offset="0.5" stop-color="${b}"/><stop offset="1" stop-color="${shade(b, 0.1)}"/></linearGradient>`,
      );
      body.push(`<rect width="${S}" height="${S}" fill="url(#lg)"/>`);
      weave(4, 0.8, shade(b, -0.03), shade(b, 0.03));
      break;
    case 'fabric-boucle':
      speckle([shade(b, 0.08), shade(b, -0.06)], 1400, [4, 11]);
      break;
    case 'fabric-ikat':
      weave(8, 1.4);
      for (let y = 0; y < S; y += 128)
        for (let x = 0; x < S; x += 128)
          body.push(
            `<polygon points="${x + 64},${y + 12} ${x + 116},${y + 64} ${x + 64},${y + 116} ${x + 12},${y + 64}" fill="${a}" opacity="0.8"/>`,
          );
      break;
    case 'fabric-sheer':
      body.push(`<rect width="${S}" height="${S}" fill="#F7F6F2"/>`);
      weave(10, 1, '#E8E6E0', '#FFFFFF');
      for (let x = 0; x < S; x += 128)
        body.push(`<rect x="${x}" width="64" height="${S}" fill="${withAlpha('#fff', 0.5)}"/>`);
      break;
    case 'wallpaper-blockprint':
      for (let y = 0; y < S; y += 128)
        for (let x = 0; x < S; x += 128) {
          const cx = x + 64 + ((y / 128) % 2) * 0;
          body.push(
            `<path d="M${cx} ${y + 20} c 24 20 24 60 0 88 c -24 -28 -24 -68 0 -88 Z" fill="${a}" opacity="0.8"/><circle cx="${cx}" cy="${y + 64}" r="6" fill="${b}"/>`,
          );
        }
      break;
    case 'wallpaper-botanical':
      for (let i = 0; i < 48; i++) {
        const x = r.range(0, S),
          y = r.range(0, S),
          ang = r.range(0, 360);
        body.push(
          wrapped(
            (dx, dy) =>
              `<path d="M${f(x + dx)} ${f(y + dy)} c 36 -62 90 -54 80 10 c -46 36 -90 26 -80 -10 Z" fill="${a}" opacity="0.72" transform="rotate(${f(ang)} ${f(x + dx)} ${f(y + dy)})"/>`,
            S,
          ),
        );
      }
      break;
    case 'wallpaper-clouds':
      for (let i = 0; i < 16; i++) {
        const x = r.range(0, S),
          y = r.range(0, S);
        body.push(
          wrapped(
            (dx, dy) =>
              [0, 1, 2]
                .map(
                  (k) =>
                    `<ellipse cx="${f(x + dx + k * 36 - 36)}" cy="${f(y + dy + (k === 1 ? -12 : 0))}" rx="${f(38 + k * 4)}" ry="24" fill="${withAlpha('#fff', 0.85)}"/>`,
                )
                .join(''),
            S,
          ),
        );
      }
      break;
    case 'wallpaper-grasscloth':
      weave(6, 1.5);
      for (let y = 0; y < S; y += 3)
        body.push(
          `<rect y="${y}" width="${S}" height="1" fill="${shade(b, r.jitter(0.05))}" opacity="0.5"/>`,
        );
      break;
    case 'wallpaper-jaali':
      for (let y = 0; y < S; y += 128)
        for (let x = 0; x < S; x += 128)
          body.push(
            `<path d="M${x + 64} ${y + 10} L${x + 118} ${y + 64} L${x + 64} ${y + 118} L${x + 10} ${y + 64} Z" fill="none" stroke="${a}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="10" fill="${a}"/>`,
          );
      break;
    case 'plaster':
      speckle([shade(b, -0.04), shade(b, 0.04)], 2200, [1, 4]);
      break;
    case 'plaster-rough':
      speckle([shade(b, -0.07), shade(b, 0.06)], 2600, [1, 6]);
      for (let i = 0; i < 40; i++)
        body.push(
          stroke(
            shade(b, -0.1),
            r.range(1, 3),
            `M${f(r.range(0, S))} ${f(r.range(0, S))} q ${f(r.range(-80, 80))} ${f(r.range(-40, 40))} ${f(r.range(-160, 160))} ${f(r.range(-100, 100))}`,
            0.35,
          ),
        );
      break;
    case 'plaster-metallic':
      speckle([shade(b, -0.05), shade(b, 0.08)], 2000, [1, 4]);
      defs.push(
        `<linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${withAlpha('#fff', 0.25)}"/><stop offset="0.5" stop-color="${withAlpha('#fff', 0)}"/><stop offset="1" stop-color="${withAlpha('#fff', 0.25)}"/></linearGradient>`,
      );
      body.push(`<rect width="${S}" height="${S}" fill="url(#lg)"/>`);
      break;
    case 'metal':
      for (let y = 0; y < S; y += 2)
        body.push(
          `<rect y="${y}" width="${S}" height="1" fill="${shade(b, r.jitter(0.04))}" opacity="0.6"/>`,
        );
      break;
    case 'cane': {
      body.push(`<rect width="${S}" height="${S}" fill="${shade(b, -0.35)}"/>`);
      const c = 64;
      for (let y = 0; y < S; y += c)
        for (let x = 0; x < S; x += c) {
          body.push(
            `<rect x="${x + 4}" y="${y}" width="18" height="${c}" fill="${b}"/><rect x="${x + 36}" y="${y}" width="18" height="${c}" fill="${shade(b, -0.05)}"/><rect x="${x}" y="${y + 4}" width="${c}" height="18" fill="${shade(b, 0.04)}"/><rect x="${x}" y="${y + 36}" width="${c}" height="18" fill="${shade(b, -0.02)}"/>`,
          );
        }
      break;
    }
    case 'leather':
      speckle([shade(b, -0.06)], 900, [1, 3]);
      for (let i = 0; i < 26; i++)
        body.push(
          stroke(
            shade(b, -0.12),
            1.6,
            `M${f(r.range(0, S))} ${f(r.range(0, S))} q ${f(r.range(-80, 80))} ${f(r.range(-50, 50))} ${f(r.range(-180, 180))} ${f(r.range(-100, 100))}`,
            0.4,
          ),
        );
      break;
  }

  body.push(`<rect width="${S}" height="${S}" filter="url(#grain)"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs>${defs.join('')}</defs>${body.join('')}</svg>`;
}

/** Sobel normal map (OpenGL convention, +Y up) from a greyscale heightfield. */
export async function normalFromHeight(albedoPng: Buffer, strength: number): Promise<Buffer> {
  const { data, info } = await sharp(albedoPng)
    .greyscale()
    .blur(0.6)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width,
    H = info.height;
  const out = Buffer.alloc(W * H * 3);
  const h = (x: number, y: number) => data[((y + H) % H) * W + ((x + W) % W)]! / 255;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx =
        (h(x + 1, y - 1) +
          2 * h(x + 1, y) +
          h(x + 1, y + 1) -
          h(x - 1, y - 1) -
          2 * h(x - 1, y) -
          h(x - 1, y + 1)) *
        strength;
      const dy =
        (h(x - 1, y + 1) +
          2 * h(x, y + 1) +
          h(x + 1, y + 1) -
          h(x - 1, y - 1) -
          2 * h(x, y - 1) -
          h(x + 1, y - 1)) *
        strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * W + x) * 3;
      out[i] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      out[i + 1] = Math.round(((dy / len) * 0.5 + 0.5) * 255); // +Y up (GL)
      out[i + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
    }
  }
  return sharp(out, { raw: { width: W, height: H, channels: 3 } })
    .png()
    .toBuffer();
}

/** Roughness: base value modulated by albedo luminance variance. */
export async function roughnessFrom(albedoPng: Buffer, base: number): Promise<Buffer> {
  const { data, info } = await sharp(albedoPng)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    const v = base * 255 + (data[i]! - 128) * 0.15;
    out[i] = Math.max(0, Math.min(255, Math.round(v)));
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer();
}

export function specFor(slug: string, r: Rng = rng(slug)): TexSpec {
  const pick = (
    kind: TexKind,
    base: string,
    roughness: number,
    bump: number,
    accent?: string,
  ): TexSpec => ({ slug, kind, base, accent, roughness, bump });
  void r;
  const woods: Record<string, string> = {
    'wood-ash': '#D9CDB8',
    'wood-bamboo': '#D9B98A',
    'wood-oak-dark': '#8A5E3C',
    'wood-oak-light': '#C9A77C',
    'wood-teak': '#9C6A3F',
    'wood-walnut': '#6B4A33',
    'wood-wenge': '#3C2C24',
  };
  if (slug in woods) return pick('wood', woods[slug]!, 0.55, 1.2);
  if (slug === 'wood-fluted') return pick('wood-fluted', '#B48A5E', 0.5, 2.4);
  const marbles: Record<string, [string, string]> = {
    'marble-beige': ['#E6DCC8', '#B8A98C'],
    'marble-black': ['#1E1E20', '#8A8A8A'],
    'marble-green': ['#2F4F3E', '#9FB9A6'],
    'marble-pink': ['#E8CFC6', '#B58A7E'],
    'marble-statuario': ['#F2F0EA', '#8C8C90'],
    'marble-white': ['#EDEBE4', '#B1AFA8'],
  };
  if (slug in marbles) return pick('marble', marbles[slug]![0], 0.18, 0.4, marbles[slug]![1]);
  const granites: Record<string, string> = {
    'granite-black': '#232326',
    'granite-brown': '#5A4234',
    'granite-grey': '#7A7A7C',
    'granite-white': '#D8D4CC',
  };
  if (slug in granites) return pick('granite', granites[slug]!, 0.25, 1.0, '#C9B27F');
  if (slug === 'tile-subway') return pick('tile-subway', '#F2F0EA', 0.2, 2.0);
  if (slug === 'tile-zellige') return pick('tile-zellige', '#5C8A7A', 0.2, 2.2, '#2E5A4B');
  if (slug === 'tile-fishscale') return pick('tile-fishscale', '#DCE6E4', 0.22, 2.0);
  if (slug === 'tile-athangudi') return pick('tile-athangudi', '#E6D5B8', 0.4, 1.4, '#9A3B2E');
  if (slug === 'fabric-velvet') return pick('fabric-velvet', '#355E52', 0.85, 0.5);
  if (slug === 'fabric-boucle') return pick('fabric-boucle', '#EFE7DA', 0.95, 1.8);
  if (slug === 'fabric-ikat') return pick('fabric-ikat', '#D9CDB8', 0.9, 0.8, '#3B4E7A');
  if (slug === 'fabric-sheer') return pick('fabric-sheer', '#F7F6F2', 0.8, 0.4);
  if (slug === 'fabric-linen') return pick('fabric', '#D9D2C5', 0.92, 1.0);
  if (slug === 'fabric-weave') return pick('fabric', '#B9AE9B', 0.9, 1.4);
  if (slug === 'wallpaper-blockprint')
    return pick('wallpaper-blockprint', '#F0E8DA', 0.75, 0.3, '#8A3B3B');
  if (slug === 'wallpaper-botanical')
    return pick('wallpaper-botanical', '#E8E4D8', 0.75, 0.3, '#4E6B4F');
  if (slug === 'wallpaper-clouds') return pick('wallpaper-clouds', '#CFE0EC', 0.75, 0.2);
  if (slug === 'wallpaper-grasscloth') return pick('wallpaper-grasscloth', '#C9A86A', 0.8, 1.6);
  if (slug === 'wallpaper-jaali') return pick('wallpaper-jaali', '#F1EBE1', 0.75, 0.4, '#8C7A5A');
  if (slug === 'plaster-lime') return pick('plaster', '#E8E2D6', 0.9, 1.2);
  if (slug === 'plaster-rough') return pick('plaster-rough', '#D8D2C4', 0.95, 2.4);
  if (slug === 'plaster-metallic') return pick('plaster-metallic', '#C8B38F', 0.45, 1.0);
  const metals: Record<string, [string, number]> = {
    'metal-black': ['#2B2B2D', 0.35],
    'metal-brass': ['#C9A45C', 0.3],
    'metal-copper': ['#B87352', 0.3],
    'metal-steel': ['#B5B8BC', 0.25],
  };
  if (slug in metals) return pick('metal', metals[slug]![0], metals[slug]![1], 0.3);
  const stones: Record<string, string> = {
    'stone-grey': '#8C8C88',
    'stone-kota': '#6E7A6C',
    'stone-travertine': '#D8CBB4',
  };
  if (slug in stones) return pick('stone', stones[slug]!, 0.6, 1.6);
  if (slug === 'terrazzo') return pick('terrazzo', '#E9E4DA', 0.3, 0.8, '#B9705B');
  if (slug === 'concrete-smooth') return pick('concrete', '#A9A6A0', 0.8, 1.0);
  if (slug === 'cane-weave') return pick('cane', '#D4B483', 0.7, 3.0);
  if (slug === 'leather-tan') return pick('leather', '#A66A3C', 0.6, 1.2);
  if (slug === 'laminate-plain') return pick('laminate', '#DAD3C6', 0.5, 0.3);
  return pick('plaster', '#D0C8BA', 0.85, 1.0);
}

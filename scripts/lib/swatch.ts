/** Material swatch + portrait + editorial-card SVGs (square swatches, 3:2 others). */
import { mix, shade, withAlpha } from './color';
import { rng } from './prng';

const S = 1200;
const f = (n: number) => Math.round(n * 10) / 10;

export interface SwatchSpec {
  id: string;
  category: string;
  hex?: string;
  finish?: string;
  pattern?: string;
  name: string;
  tier?: string;
}

const CAT_BASE: Record<string, string> = {
  PAINT: '#D9CDB8',
  LAMINATE: '#C7A67A',
  VENEER: '#A97C50',
  ACRYLIC: '#F1F1EE',
  PU_FINISH: '#EDE7DC',
  WALLPAPER: '#E8E0D0',
  WALL_TEXTURE: '#D8D2C4',
  GLASS: '#DDE8EC',
  MARBLE: '#EDE9E1',
  GRANITE: '#3A3A3C',
  QUARTZ: '#F4F4F2',
  CERAMIC_TILE: '#F0EEE9',
  VITRIFIED_TILE: '#E6E1D6',
  WOOD_FLOORING: '#B98A5E',
  VINYL_FLOORING: '#C9B08F',
  UPHOLSTERY: '#B9AE9B',
  CURTAIN: '#D9CBB2',
  METAL_FINISH: '#B58A4A',
  KITCHEN_HARDWARE: '#8C8C8C',
  WARDROBE_HARDWARE: '#8C8C8C',
  LIGHTING: '#F2C48D',
  SANITARYWARE: '#F7F7F5',
  COUNTERTOP: '#2B2B2D',
  HANDLES: '#B58A4A',
};

export function renderSwatch(spec: SwatchSpec): string {
  const r = rng(spec.id);
  const base = spec.hex ?? CAT_BASE[spec.category] ?? '#C9C2B4';
  const defs: string[] = [];
  const body: string[] = [];
  const cat = spec.category;
  const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
    `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${extra}/>`;

  body.push(rect(0, 0, S, S, base));

  const stroke = (color: string, w: number, d: string, op = 0.7) =>
    `<path d="${d}" stroke="${color}" stroke-width="${f(w)}" fill="none" opacity="${op}" stroke-linecap="round"/>`;

  const wood = (vertical: boolean, dark = -0.08) => {
    for (let i = 0; i < 26; i++) {
      const pos = r.range(0, S);
      const wob = r.range(8, 40);
      const d = vertical
        ? `M${f(pos)} 0 C ${f(pos + wob)} ${S * 0.3}, ${f(pos - wob)} ${S * 0.6}, ${f(pos + wob * 0.5)} ${S}`
        : `M0 ${f(pos)} C ${S * 0.3} ${f(pos + wob)}, ${S * 0.6} ${f(pos - wob)}, ${S} ${f(pos + wob * 0.5)}`;
      body.push(stroke(shade(base, dark - r.next() * 0.06), r.range(1.5, 6), d, r.range(0.4, 0.9)));
    }
    // knots
    if (r.chance(0.5))
      body.push(
        `<ellipse cx="${f(r.range(200, 1000))}" cy="${f(r.range(200, 1000))}" rx="${f(r.range(20, 50))}" ry="${f(r.range(12, 30))}" fill="${shade(base, -0.2)}" opacity="0.6"/>`,
      );
  };
  const marble = (vein: string, count = 9) => {
    for (let i = 0; i < count; i++) {
      const x0 = r.range(-100, S);
      const y0 = r.range(-100, S);
      body.push(
        stroke(
          vein,
          r.range(1.5, 7),
          `M${f(x0)} ${f(y0)} c ${f(r.range(80, 300))} ${f(r.range(-150, 150))}, ${f(r.range(200, 600))} ${f(r.range(-80, 250))}, ${f(r.range(600, 1300))} ${f(r.range(-150, 350))}`,
          r.range(0.3, 0.8),
        ),
      );
    }
    body.push(rect(0, 0, S, S, `url(#sheen)`));
    defs.push(
      `<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${withAlpha('#ffffff', 0.18)}"/><stop offset="1" stop-color="${withAlpha('#000000', 0.08)}"/></linearGradient>`,
    );
  };
  const speckle = (colors: string[], n: number, size: [number, number]) => {
    for (let i = 0; i < n; i++)
      body.push(
        `<circle cx="${f(r.range(0, S))}" cy="${f(r.range(0, S))}" r="${f(r.range(size[0], size[1]))}" fill="${r.pick(colors)}" opacity="${f(r.range(0.4, 0.9))}"/>`,
      );
  };
  const grid = (size: number, grout: string, groutW: number, offsetRows = false) => {
    for (let y = 0; y < S; y += size) {
      const off = offsetRows && (y / size) % 2 ? size / 2 : 0;
      for (let x = -size; x < S + size; x += size)
        body.push(
          rect(
            x + off + groutW / 2,
            y + groutW / 2,
            size - groutW,
            size - groutW,
            shade(base, r.jitter(0.015)),
            'rx="2"',
          ),
        );
    }
    body.unshift(rect(0, 0, S, S, grout));
    body.splice(1, 1); // remove the base rect (grout replaces it)
  };
  const weave = (spacing: number, w: number) => {
    for (let x = 0; x < S; x += spacing)
      body.push(stroke(shade(base, -0.05), w, `M${x} 0 V ${S}`, 0.5));
    for (let y = 0; y < S; y += spacing)
      body.push(stroke(shade(base, 0.05), w, `M0 ${y} H ${S}`, 0.5));
  };
  const flutes = (w: number) => {
    for (let x = 0; x < S; x += w) {
      body.push(rect(x, 0, w / 2, S, shade(base, 0.06)));
      body.push(rect(x + w / 2, 0, w / 2, S, shade(base, -0.07)));
      body.push(rect(x + w - 4, 0, 4, S, shade(base, -0.16)));
    }
  };
  const brushed = () => {
    for (let y = 0; y < S; y += 3)
      body.push(rect(0, y, S, 1.2, shade(base, r.jitter(0.04)), 'opacity="0.6"'));
  };

  switch (cat) {
    case 'PAINT':
    case 'PU_FINISH':
    case 'ACRYLIC': {
      // soft light gradient, subtle roller texture
      defs.push(
        `<linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(base, 0.04)}"/><stop offset="1" stop-color="${shade(base, -0.04)}"/></linearGradient>`,
      );
      body.push(rect(0, 0, S, S, 'url(#lg)'));
      if (spec.finish === 'GLOSS' || spec.finish === 'HIGH_GLOSS' || cat === 'ACRYLIC') {
        body.push(
          `<polygon points="0,0 ${S * 0.45},0 0,${S * 0.7}" fill="${withAlpha('#ffffff', 0.25)}"/>`,
        );
      }
      break;
    }
    case 'LAMINATE':
    case 'VENEER':
    case 'WOOD_FLOORING':
    case 'VINYL_FLOORING':
      if (spec.pattern === 'plain' || spec.finish === 'HIGH_GLOSS') {
        defs.push(
          `<linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(base, 0.03)}"/><stop offset="1" stop-color="${shade(base, -0.03)}"/></linearGradient>`,
        );
        body.push(rect(0, 0, S, S, 'url(#lg)'));
      } else if (spec.pattern === 'herringbone') {
        const w = 90;
        const l = 360;
        body.length = 0;
        body.push(rect(0, 0, S, S, shade(base, -0.2)));
        for (let y = -l; y < S + l; y += w * 2)
          for (let x = -l; x < S + l; x += l) {
            body.push(
              `<rect x="${x}" y="${y}" width="${l}" height="${w}" fill="${shade(base, r.jitter(0.04))}" transform="rotate(45 ${x} ${y})"/>`,
            );
            body.push(
              `<rect x="${x}" y="${y + w}" width="${l}" height="${w}" fill="${shade(base, r.jitter(0.04))}" transform="rotate(-45 ${x} ${y + w})"/>`,
            );
          }
      } else if (spec.id.includes('fluted')) flutes(70);
      else wood(cat !== 'WOOD_FLOORING');
      break;
    case 'MARBLE':
      marble(
        mix(base, base.startsWith('#1') || base.startsWith('#2') ? '#CFCFCF' : '#7A7268', 0.7),
      );
      break;
    case 'QUARTZ':
      speckle([shade(base, -0.08), shade(base, 0.05)], 900, [1, 3]);
      marble(shade(base, -0.06), 3);
      break;
    case 'GRANITE':
      speckle([shade(base, 0.25), shade(base, 0.12), shade(base, -0.1), '#C9B27F'], 2200, [1.5, 6]);
      break;
    case 'CERAMIC_TILE':
    case 'VITRIFIED_TILE':
      if (spec.pattern === 'brick-lay') grid(200, shade(base, -0.14), 6, true);
      else if (spec.pattern === 'geometric') {
        grid(240, shade(base, -0.14), 5);
        for (let y = 0; y < S; y += 240)
          for (let x = 0; x < S; x += 240)
            body.push(
              `<polygon points="${x + 120},${y + 20} ${x + 220},${y + 120} ${x + 120},${y + 220} ${x + 20},${y + 120}" fill="${shade(base, -0.12)}" opacity="0.8"/>`,
            );
      } else if (spec.pattern === 'floral') {
        grid(300, shade(base, -0.14), 5);
        for (let y = 0; y < S; y += 300)
          for (let x = 0; x < S; x += 300)
            for (let k = 0; k < 4; k++)
              body.push(
                `<ellipse cx="${x + 150}" cy="${y + 100}" rx="30" ry="70" fill="${shade(base, -0.15)}" opacity="0.75" transform="rotate(${k * 90} ${x + 150} ${y + 150})"/>`,
              );
      } else if (spec.id.includes('fishscale')) {
        body.length = 0;
        body.push(rect(0, 0, S, S, shade(base, -0.18)));
        for (let y = 0; y < S + 100; y += 70)
          for (let x = -100; x < S + 100; x += 140)
            body.push(
              `<circle cx="${x + ((y / 70) % 2) * 70}" cy="${y}" r="68" fill="${shade(base, r.jitter(0.03))}"/>`,
            );
      } else if (spec.id.includes('carrara') || spec.id.includes('marble')) {
        marble('#B8B2A8', 6);
        grid(600, shade(base, -0.1), 4);
        marble('#B8B2A8', 4);
      } else
        grid(
          spec.id.includes('subway') ? 200 : 400,
          shade(base, -0.12),
          5,
          spec.id.includes('subway'),
        );
      break;
    case 'WALLPAPER':
      if (spec.id.includes('clouds')) {
        for (let i = 0; i < 14; i++) {
          const x = r.range(0, S),
            y = r.range(0, S);
          for (let k = 0; k < 3; k++)
            body.push(
              `<ellipse cx="${f(x + k * 40 - 40)}" cy="${f(y + (k === 1 ? -14 : 0))}" rx="${f(r.range(40, 70))}" ry="${f(r.range(22, 40))}" fill="${withAlpha('#ffffff', 0.85)}"/>`,
            );
        }
      } else if (spec.id.includes('grasscloth')) weave(6, 1.6);
      else if (spec.id.includes('jaali') || spec.pattern === 'geometric') {
        for (let y = 0; y < S; y += 150)
          for (let x = 0; x < S; x += 150)
            body.push(
              `<path d="M${x + 75} ${y + 15} L${x + 135} ${y + 75} L${x + 75} ${y + 135} L${x + 15} ${y + 75} Z" fill="none" stroke="${shade(base, -0.25)}" stroke-width="5"/>`,
            );
      } else if (spec.pattern === 'stripe') {
        for (let x = 0; x < S; x += 120) body.push(rect(x, 0, 60, S, shade(base, -0.08)));
      } else if (spec.pattern === 'damask') {
        for (let y = 0; y < S; y += 240)
          for (let x = 0; x < S; x += 240)
            body.push(
              `<path d="M${x + 120} ${y + 30} c 60 40 60 100 0 180 c -60 -80 -60 -140 0 -180 Z M${x + 30} ${y + 120} c 40 -60 100 -60 180 0 c -80 60 -140 60 -180 0 Z" fill="${shade(base, -0.14)}" opacity="0.75"/>`,
            );
      } else {
        // botanical / block print
        for (let i = 0; i < 40; i++) {
          const x = r.range(0, S),
            y = r.range(0, S),
            a = r.range(0, 360);
          body.push(
            `<path d="M${f(x)} ${f(y)} c 40 -70 100 -60 90 10 c -50 40 -100 30 -90 -10 Z" fill="${shade(base, -0.22)}" opacity="0.7" transform="rotate(${f(a)} ${f(x)} ${f(y)})"/>`,
          );
        }
      }
      break;
    case 'WALL_TEXTURE':
      speckle([shade(base, -0.05), shade(base, 0.05)], 2500, [1, 5]);
      if (spec.id.includes('metallic')) {
        defs.push(
          `<linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${withAlpha('#ffffff', 0.3)}"/><stop offset="0.5" stop-color="${withAlpha('#ffffff', 0)}"/><stop offset="1" stop-color="${withAlpha('#000000', 0.15)}"/></linearGradient>`,
        );
        body.push(rect(0, 0, S, S, 'url(#lg)'));
      }
      if (spec.id.includes('rough') || spec.id.includes('concrete'))
        for (let i = 0; i < 30; i++)
          body.push(
            stroke(
              shade(base, -0.1),
              r.range(1, 3),
              `M${f(r.range(0, S))} ${f(r.range(0, S))} l ${f(r.range(-200, 200))} ${f(r.range(-120, 120))}`,
              0.35,
            ),
          );
      break;
    case 'GLASS':
      defs.push(
        `<linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4F8FA"/><stop offset="0.5" stop-color="${base}"/><stop offset="1" stop-color="#B9C9D1"/></linearGradient>`,
      );
      body.push(rect(0, 0, S, S, 'url(#lg)'));
      if (spec.id.includes('fluted'))
        for (let x = 0; x < S; x += 60) body.push(rect(x, 0, 30, S, withAlpha('#ffffff', 0.35)));
      if (spec.id.includes('frost')) speckle([withAlpha('#ffffff', 0.5)], 3000, [1, 3]);
      if (spec.id.includes('tinted') || spec.id.includes('grey') || spec.id.includes('bronze'))
        body.push(
          rect(0, 0, S, S, withAlpha(spec.id.includes('bronze') ? '#5A3E2E' : '#2B2B2D', 0.45)),
        );
      body.push(
        `<polygon points="0,0 ${S * 0.35},0 0,${S * 0.5}" fill="${withAlpha('#ffffff', 0.3)}"/>`,
      );
      break;
    case 'UPHOLSTERY':
    case 'CURTAIN':
      if (spec.id.includes('velvet')) {
        defs.push(
          `<linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(base, 0.12)}"/><stop offset="0.5" stop-color="${base}"/><stop offset="1" stop-color="${shade(base, -0.12)}"/></linearGradient>`,
        );
        body.push(rect(0, 0, S, S, 'url(#lg)'));
      } else if (spec.id.includes('boucle'))
        speckle([shade(base, 0.08), shade(base, -0.06)], 1800, [4, 12]);
      else if (spec.id.includes('leather')) {
        speckle([shade(base, -0.06)], 800, [1, 3]);
        for (let i = 0; i < 20; i++)
          body.push(
            stroke(
              shade(base, -0.12),
              2,
              `M${f(r.range(0, S))} ${f(r.range(0, S))} q ${f(r.range(-100, 100))} ${f(r.range(-60, 60))} ${f(r.range(-200, 200))} ${f(r.range(-120, 120))}`,
              0.4,
            ),
          );
      } else if (spec.id.includes('ikat') || spec.pattern === 'geometric') {
        weave(8, 1.4);
        for (let y = 0; y < S; y += 200)
          for (let x = 0; x < S; x += 200)
            body.push(
              `<polygon points="${x + 100},${y + 20} ${x + 180},${y + 100} ${x + 100},${y + 180} ${x + 20},${y + 100}" fill="${shade(base, -0.28)}" opacity="0.8"/>`,
            );
      } else if (spec.id.includes('sheer')) {
        body.length = 0;
        body.push(rect(0, 0, S, S, '#F7F6F2'));
        weave(10, 1);
        for (let x = 0; x < S; x += 160) body.push(rect(x, 0, 80, S, withAlpha('#ffffff', 0.5)));
      } else if (spec.id.includes('blackout')) {
        defs.push(
          `<linearGradient id="lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(base, 0.05)}"/><stop offset="0.5" stop-color="${shade(base, -0.05)}"/><stop offset="1" stop-color="${shade(base, 0.03)}"/></linearGradient>`,
        );
        body.push(rect(0, 0, S, S, 'url(#lg)'));
      } else weave(spec.id.includes('linen') ? 7 : 12, spec.id.includes('linen') ? 1.4 : 2.4);
      // drape fold shading for curtains
      if (cat === 'CURTAIN') {
        defs.push(
          `<linearGradient id="fold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${withAlpha('#000000', 0.12)}"/><stop offset="0.5" stop-color="${withAlpha('#ffffff', 0.12)}"/><stop offset="1" stop-color="${withAlpha('#000000', 0.12)}"/></linearGradient><pattern id="folds" patternUnits="userSpaceOnUse" width="240" height="${S}"><rect width="240" height="${S}" fill="url(#fold)"/></pattern>`,
        );
        body.push(rect(0, 0, S, S, 'url(#folds)'));
      }
      break;
    case 'METAL_FINISH':
    case 'KITCHEN_HARDWARE':
    case 'WARDROBE_HARDWARE':
    case 'HANDLES':
      brushed();
      defs.push(
        `<linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${withAlpha('#ffffff', 0.35)}"/><stop offset="0.45" stop-color="${withAlpha('#ffffff', 0)}"/><stop offset="0.55" stop-color="${withAlpha('#000000', 0.12)}"/><stop offset="1" stop-color="${withAlpha('#ffffff', 0.15)}"/></linearGradient>`,
      );
      body.push(rect(0, 0, S, S, 'url(#lg)'));
      if (cat !== 'METAL_FINISH') {
        // handle / hinge silhouette
        body.push(
          `<rect x="200" y="540" width="800" height="120" rx="60" fill="${shade(base, -0.25)}"/><rect x="230" y="560" width="740" height="60" rx="30" fill="${shade(base, 0.1)}"/>`,
        );
        if (cat === 'KITCHEN_HARDWARE' || cat === 'WARDROBE_HARDWARE')
          body.push(
            `<circle cx="330" cy="600" r="22" fill="${shade(base, -0.4)}"/><circle cx="870" cy="600" r="22" fill="${shade(base, -0.4)}"/>`,
          );
      }
      break;
    case 'LIGHTING': {
      body.length = 0;
      defs.push(
        `<radialGradient id="glow" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#FFF4DC"/><stop offset="0.35" stop-color="${base}"/><stop offset="1" stop-color="#2A241C"/></radialGradient>`,
      );
      body.push(rect(0, 0, S, S, 'url(#glow)'));
      body.push(`<line x1="600" y1="0" x2="600" y2="330" stroke="#3A3A3A" stroke-width="8"/>`);
      const kind = r.pick(['dome', 'cone', 'globe', 'strip']);
      if (kind === 'dome')
        body.push(
          `<path d="M380 520 a 220 220 0 0 1 440 0 Z" fill="#2B2B2D"/><ellipse cx="600" cy="520" rx="220" ry="26" fill="#FFF0C8"/>`,
        );
      else if (kind === 'cone')
        body.push(
          `<polygon points="540,330 660,330 820,560 380,560" fill="#2B2B2D"/><ellipse cx="600" cy="560" rx="220" ry="28" fill="#FFF0C8"/>`,
        );
      else if (kind === 'globe')
        body.push(`<circle cx="600" cy="500" r="200" fill="#FFF7E6" opacity="0.95"/>`);
      else
        body.push(
          `<rect x="200" y="300" width="800" height="60" rx="8" fill="#2B2B2D"/><rect x="220" y="350" width="760" height="14" fill="#FFF0C8"/>`,
        );
      break;
    }
    case 'SANITARYWARE': {
      body.length = 0;
      defs.push(
        `<linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6ECEF"/><stop offset="1" stop-color="#C9D4D9"/></linearGradient>`,
      );
      body.push(rect(0, 0, S, S, 'url(#lg)'));
      body.push(
        `<ellipse cx="600" cy="640" rx="420" ry="220" fill="${base}"/><ellipse cx="600" cy="620" rx="360" ry="170" fill="${shade(base, -0.06)}"/><ellipse cx="600" cy="600" rx="300" ry="120" fill="${shade(base, 0.02)}"/>`,
      );
      body.push(
        `<path d="M600 420 v -140 q 0 -40 40 -40 h 60" stroke="${spec.id.includes('brass') || spec.id.includes('gold') ? '#C9A45C' : spec.id.includes('black') ? '#1F1F1F' : '#9EA7AE'}" stroke-width="26" fill="none" stroke-linecap="round"/>`,
      );
      break;
    }
    case 'COUNTERTOP':
      if (base.startsWith('#1') || base.startsWith('#2') || base.startsWith('#3'))
        speckle([shade(base, 0.25), shade(base, 0.12), '#C9B27F'], 2000, [1.5, 5]);
      else marble(shade(base, -0.15));
      break;
    default:
      speckle([shade(base, -0.05), shade(base, 0.05)], 600, [1, 4]);
  }

  // finish sheen
  if (spec.finish === 'GLOSS' || spec.finish === 'HIGH_GLOSS' || spec.finish === 'POLISHED') {
    body.push(
      `<polygon points="0,${S * 0.15} ${S * 0.55},0 ${S * 0.7},0 0,${S * 0.4}" fill="${withAlpha('#ffffff', 0.22)}"/>`,
    );
  }
  // grain
  defs.push(
    `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer></filter>`,
  );
  body.push(`<rect width="${S}" height="${S}" filter="url(#grain)"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs>${defs.join('')}</defs>${body.join('')}</svg>`;
}

/* ------------------------------------------------------------------------ */
/*  Portraits — abstract, clearly illustrative (no faces).                   */
/* ------------------------------------------------------------------------ */

export function renderPortrait(id: string, name: string, accent: string): string {
  const r = rng(id);
  const W = 1200;
  const H = 1200;
  const bg = r.pick(['#EFE6D8', '#E9E7E2', '#E6DCCB', '#EDE7DD', '#F2F1EE']);
  const skin = r.pick(['#C68B59', '#A9714B', '#8D5A3B', '#D9A276', '#6F4A33']);
  const cloth = accent;
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><radialGradient id="bg" cx="0.5" cy="0.35" r="0.8"><stop offset="0" stop-color="${shade(bg, 0.03)}"/><stop offset="1" stop-color="${shade(bg, -0.08)}"/></radialGradient>
<linearGradient id="cl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(cloth, 0.05)}"/><stop offset="1" stop-color="${shade(cloth, -0.1)}"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<circle cx="600" cy="${f(r.range(380, 420))}" r="${f(r.range(300, 340))}" fill="${withAlpha(accent, 0.18)}"/>
<path d="M200 1200 C 200 900, 380 800, 600 800 C 820 800, 1000 900, 1000 1200 Z" fill="url(#cl)"/>
<rect x="540" y="620" width="120" height="180" rx="40" fill="${shade(skin, -0.06)}"/>
<ellipse cx="600" cy="500" rx="${f(r.range(150, 175))}" ry="${f(r.range(185, 210))}" fill="${skin}"/>
<path d="M${f(600 - r.range(160, 190))} ${f(r.range(420, 470))} C 480 260, 720 260, ${f(600 + r.range(160, 190))} ${f(r.range(420, 470))} C 760 ${f(r.range(330, 370))}, 440 ${f(r.range(330, 370))}, ${f(600 - r.range(160, 190))} ${f(r.range(420, 470))} Z" fill="${r.pick(['#2B2320', '#3A2C24', '#1F1A18', '#4A3A2E'])}"/>
<text x="600" y="1080" text-anchor="middle" font-family="Georgia, serif" font-size="150" fill="${withAlpha('#ffffff', 0.9)}" font-weight="600">${initials}</text>
</svg>`;
}

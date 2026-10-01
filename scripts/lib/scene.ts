/**
 * SVG room-scene renderer: one-point perspective box, style palette, perspective
 * furniture silhouettes, window light, AO and grain. Output is a 3:2 SVG string
 * that sharp rasterises. Deterministic per `id`.
 */
import { mix, shade, warm, withAlpha } from './color';
import { BEFORE, paletteFor, type Palette } from './palette';
import { rng, type Rng } from './prng';

export type Pt = [number, number];
export const W = 2000;
export const H = 1333;

/* ------------------------------------------------------------------------ */
/*  Camera / perspective                                                     */
/* ------------------------------------------------------------------------ */

export class Cam {
  constructor(
    public vp: Pt,
    public bw: { x0: number; y0: number; x1: number; y1: number },
    public k = 2.2,
  ) {}

  toward(p: Pt, t: number): Pt {
    return [p[0] + (p[0] - this.vp[0]) * t * this.k, p[1] + (p[1] - this.vp[1]) * t * this.k];
  }
  far(p: Pt): Pt {
    return this.toward(p, 4);
  }
  get TL(): Pt {
    return [this.bw.x0, this.bw.y0];
  }
  get TR(): Pt {
    return [this.bw.x1, this.bw.y0];
  }
  get BR(): Pt {
    return [this.bw.x1, this.bw.y1];
  }
  get BL(): Pt {
    return [this.bw.x0, this.bw.y1];
  }
  backWall(): Pt[] {
    return [this.TL, this.TR, this.BR, this.BL];
  }
  leftWall(): Pt[] {
    return [this.far(this.TL), this.TL, this.BL, this.far(this.BL)];
  }
  rightWall(): Pt[] {
    return [this.TR, this.far(this.TR), this.far(this.BR), this.BR];
  }
  floor(): Pt[] {
    return [this.far(this.BL), this.BL, this.BR, this.far(this.BR)];
  }
  ceiling(): Pt[] {
    return [this.far(this.TL), this.far(this.TR), this.TR, this.TL];
  }
  onBack(x0: number, y0: number, x1: number, y1: number): Pt[] {
    return [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ];
  }
  /** Floor point at back-wall x, depth t (0 = back wall). */
  fp(x: number, t: number, h = 0): Pt {
    return this.toward([x, this.bw.y1 - h], t);
  }
  /** Wall-mounted rect on left wall between y0..y1, depth t0..t1 */
  onLeft(y0: number, y1: number, t0: number, t1: number): Pt[] {
    const x = this.bw.x0;
    return [
      this.toward([x, y0], t1),
      this.toward([x, y0], t0),
      this.toward([x, y1], t0),
      this.toward([x, y1], t1),
    ];
  }
  onRight(y0: number, y1: number, t0: number, t1: number): Pt[] {
    const x = this.bw.x1;
    return [
      this.toward([x, y0], t0),
      this.toward([x, y0], t1),
      this.toward([x, y1], t1),
      this.toward([x, y1], t0),
    ];
  }
  /**
   * Box standing on the floor: back-wall x-range [xa,xb], depth [t0 (far), t1 (near)], height h (px at back wall).
   * Returns faces in draw order.
   */
  floorBox(
    xa: number,
    xb: number,
    t0: number,
    t1: number,
    h: number,
    yBase = this.bw.y1,
    hBottom = 0,
  ) {
    const p = (x: number, t: number, hh: number): Pt => this.toward([x, yBase - hh], t);
    const top: Pt[] = [p(xa, t0, h), p(xb, t0, h), p(xb, t1, h), p(xa, t1, h)];
    const front: Pt[] = [p(xa, t1, h), p(xb, t1, h), p(xb, t1, hBottom), p(xa, t1, hBottom)];
    const cx = (xa + xb) / 2;
    const side: Pt[] =
      cx < this.vp[0]
        ? [p(xb, t0, h), p(xb, t1, h), p(xb, t1, hBottom), p(xb, t0, hBottom)] // right side visible
        : [p(xa, t0, h), p(xa, t1, h), p(xa, t1, hBottom), p(xa, t0, hBottom)];
    return { top, front, side, sideIsRight: cx < this.vp[0] };
  }
  /** Box protruding from the back wall (cabinet): front face + visible side + top/bottom */
  wallBox(x0: number, y0: number, x1: number, y1: number, d: number) {
    const t = (p: Pt) => this.toward(p, d);
    const front: Pt[] = [t([x0, y0]), t([x1, y0]), t([x1, y1]), t([x0, y1])];
    const cx = (x0 + x1) / 2;
    const side: Pt[] =
      cx < this.vp[0]
        ? [[x1, y0], t([x1, y0]), t([x1, y1]), [x1, y1]]
        : [[x0, y0], t([x0, y0]), t([x0, y1]), [x0, y1]];
    const cy = (y0 + y1) / 2;
    const cap: Pt[] =
      cy > this.vp[1]
        ? [[x0, y0], [x1, y0], t([x1, y0]), t([x0, y0])]
        : [[x0, y1], [x1, y1], t([x1, y1]), t([x0, y1])];
    return { front, side, cap, capIsTop: cy > this.vp[1], sideIsRight: cx < this.vp[0] };
  }
}

/* ------------------------------------------------------------------------ */
/*  SVG helpers                                                              */
/* ------------------------------------------------------------------------ */

const f = (n: number) => Math.round(n * 10) / 10;
export const pts = (p: Pt[]) => p.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
export const poly = (p: Pt[], fill: string, extra = '') =>
  `<polygon points="${pts(p)}" fill="${fill}" ${extra}/>`;
const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${extra}/>`;
const line = (a: Pt, b: Pt, stroke: string, w = 2, extra = '') =>
  `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${stroke}" stroke-width="${w}" ${extra}/>`;
const ell = (cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" ${extra}/>`;

let uid = 0;
const gid = (p: string) => `${p}${(uid++).toString(36)}`;

function linGrad(id: string, a: Pt, b: Pt, stops: [number, string][]) {
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</linearGradient>`;
}
function radGrad(id: string, cx: number, cy: number, r: number, stops: [number, string][]) {
  return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</radialGradient>`;
}

class Svg {
  defs: string[] = [];
  body: string[] = [];
  add(s: string) {
    this.body.push(s);
  }
  grad(a: Pt, b: Pt, stops: [number, string][]) {
    const id = gid('g');
    this.defs.push(linGrad(id, a, b, stops));
    return `url(#${id})`;
  }
  radial(cx: number, cy: number, r: number, stops: [number, string][]) {
    const id = gid('r');
    this.defs.push(radGrad(id, cx, cy, r, stops));
    return `url(#${id})`;
  }
  pattern(w: number, h: number, inner: string, transform = '') {
    const id = gid('p');
    this.defs.push(
      `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${h}" ${transform ? `patternTransform="${transform}"` : ''}>${inner}</pattern>`,
    );
    return `url(#${id})`;
  }
  clip(p: Pt[]) {
    const id = gid('c');
    this.defs.push(`<clipPath id="${id}"><polygon points="${pts(p)}"/></clipPath>`);
    return `url(#${id})`;
  }
  blur(std: number) {
    const id = gid('b');
    this.defs.push(
      `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${std}"/></filter>`,
    );
    return `url(#${id})`;
  }
  toString(w = W, h = H) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${this.defs.join('')}</defs>${this.body.join('')}</svg>`;
  }
}

/* ------------------------------------------------------------------------ */
/*  Material fills (pattern-based, screen-space)                             */
/* ------------------------------------------------------------------------ */

export function woodFill(s: Svg, base: string, r: Rng, vertical = false, scale = 1) {
  const w = 220 * scale;
  const h = 900 * scale;
  let inner = rect(0, 0, w, h, base);
  for (let i = 0; i < 9; i++) {
    const x = r.range(0, w);
    const wobble = r.range(6, 22) * scale;
    inner += `<path d="M${f(x)} 0 C ${f(x + wobble)} ${f(h * 0.3)}, ${f(x - wobble)} ${f(h * 0.6)}, ${f(x + wobble * 0.4)} ${h}" stroke="${shade(base, -0.05 - r.next() * 0.05)}" stroke-width="${f(r.range(1.2, 3.5) * scale)}" fill="none" opacity="0.7"/>`;
  }
  inner += rect(
    0,
    0,
    w,
    h,
    s.grad(
      [0, 0],
      [w, 0],
      [
        [0, withAlpha('#000000', 0.06)],
        [0.5, withAlpha('#ffffff', 0.05)],
        [1, withAlpha('#000000', 0.05)],
      ],
    ),
  );
  return s.pattern(w, h, inner, vertical ? '' : 'rotate(90)');
}

export function tileFill(s: Svg, base: string, size = 120, grout = '#CFC9BE', groutW = 3) {
  const inner =
    rect(0, 0, size, size, grout) +
    rect(groutW / 2, groutW / 2, size - groutW, size - groutW, base, 'rx="1"');
  return s.pattern(size, size, inner);
}

export function subwayFill(s: Svg, base: string, grout = '#D8D4CC') {
  const w = 240;
  const h = 120;
  const inner =
    rect(0, 0, w, h, grout) +
    rect(2, 2, w / 2 - 4, h / 2 - 4, base) +
    rect(w / 2 + 2, 2, w / 2 - 4, h / 2 - 4, base) +
    rect(-w / 4 + 2, h / 2 + 2, w / 2 - 4, h / 2 - 4, base) +
    rect(w / 4 + 2, h / 2 + 2, w / 2 - 4, h / 2 - 4, base) +
    rect((3 * w) / 4 + 2, h / 2 + 2, w / 2 - 4, h / 2 - 4, base);
  return s.pattern(w, h, inner);
}

export function marbleFill(s: Svg, base: string, r: Rng, vein = '#B8B2A8') {
  const w = 1200;
  const h = 800;
  let inner = rect(0, 0, w, h, base);
  for (let i = 0; i < 7; i++) {
    const x0 = r.range(-100, w);
    const y0 = r.range(-100, h);
    inner += `<path d="M${f(x0)} ${f(y0)} c ${f(r.range(80, 300))} ${f(r.range(-120, 120))}, ${f(r.range(200, 500))} ${f(r.range(-60, 200))}, ${f(r.range(500, 900))} ${f(r.range(-100, 300))}" stroke="${vein}" stroke-width="${f(r.range(1, 4))}" fill="none" opacity="${f(r.range(0.25, 0.6))}"/>`;
  }
  return s.pattern(w, h, inner);
}

export function flutedFill(s: Svg, base: string, w = 44) {
  const inner =
    rect(0, 0, w, 100, base) +
    rect(0, 0, w * 0.5, 100, shade(base, 0.06)) +
    rect(w * 0.5, 0, w * 0.5, 100, shade(base, -0.06)) +
    rect(w - 4, 0, 4, 100, shade(base, -0.14));
  return s.pattern(w, 100, inner);
}

export function fabricFill(s: Svg, base: string) {
  const inner =
    rect(0, 0, 12, 12, base) +
    line([0, 0], [12, 12], shade(base, -0.03), 1.2) +
    line([0, 12], [12, 0], shade(base, 0.03), 1.2);
  return s.pattern(12, 12, inner);
}

export function brickFill(s: Svg, base: string, grout = '#CFC6B8') {
  const w = 240;
  const h = 80;
  const b = (x: number, y: number) => rect(x + 3, y + 3, w / 2 - 6, h / 2 - 6, base, 'rx="2"');
  const inner =
    rect(0, 0, w, h, grout) +
    b(0, 0) +
    b(w / 2, 0) +
    b(-w / 4, h / 2) +
    b(w / 4, h / 2) +
    b((3 * w) / 4, h / 2);
  return s.pattern(w, h, inner);
}

export function jaaliFill(s: Svg, base: string, hole = '#FFF3D6') {
  const w = 120;
  const inner =
    rect(0, 0, w, w, base) +
    `<path d="M60 12 L108 60 L60 108 L12 60 Z" fill="${hole}" opacity="0.9"/>` +
    `<circle cx="60" cy="60" r="14" fill="${base}"/>`;
  return s.pattern(w, w, inner);
}

export function blockprintFill(s: Svg, base: string, ink: string) {
  const w = 160;
  const inner =
    rect(0, 0, w, w, base) +
    `<path d="M80 20 C 100 40, 100 60, 80 80 C 60 60, 60 40, 80 20 Z" fill="${ink}" opacity="0.55"/>` +
    `<circle cx="20" cy="120" r="8" fill="${ink}" opacity="0.5"/><circle cx="140" cy="120" r="8" fill="${ink}" opacity="0.5"/>` +
    `<path d="M40 140 q 40 -30 80 0" stroke="${ink}" stroke-width="3" fill="none" opacity="0.5"/>`;
  return s.pattern(w, w, inner);
}

export function stripeFill(s: Svg, a: string, b: string, w = 90) {
  return s.pattern(w, 100, rect(0, 0, w / 2, 100, a) + rect(w / 2, 0, w / 2, 100, b));
}

export function cloudsFill(s: Svg, base: string) {
  const w = 300;
  const c = withAlpha('#ffffff', 0.85);
  const inner =
    rect(0, 0, w, w, base) +
    ell(90, 90, 46, 26, c) +
    ell(120, 80, 40, 30, c) +
    ell(60, 96, 30, 20, c) +
    ell(220, 220, 44, 24, c) +
    ell(250, 210, 36, 28, c) +
    ell(195, 226, 28, 18, c);
  return s.pattern(w, w, inner);
}

export function botanicalFill(s: Svg, base: string, leaf: string) {
  const w = 220;
  const inner =
    rect(0, 0, w, w, base) +
    `<path d="M40 180 C 60 100, 120 60, 180 40" stroke="${leaf}" stroke-width="3" fill="none" opacity="0.6"/>` +
    `<path d="M70 140 c 30 -40 60 -30 50 10 c -30 20 -60 10 -50 -10 Z" fill="${leaf}" opacity="0.5"/>` +
    `<path d="M120 100 c 30 -40 60 -30 50 10 c -30 20 -60 10 -50 -10 Z" fill="${leaf}" opacity="0.45"/>`;
  return s.pattern(w, w, inner);
}

export function terrazzoFill(s: Svg, base: string, r: Rng) {
  const w = 400;
  let inner = rect(0, 0, w, w, base);
  const chips = ['#B9A88F', '#8C8A86', '#D9C7B0', '#5C5C5C', '#C46A4A'];
  for (let i = 0; i < 40; i++) {
    inner += ell(
      r.range(0, w),
      r.range(0, w),
      r.range(4, 14),
      r.range(3, 10),
      r.pick(chips),
      `opacity="0.75" transform="rotate(${f(r.range(0, 180))} ${f(w / 2)} ${f(w / 2)})"`,
    );
  }
  return s.pattern(w, w, inner);
}

/* ------------------------------------------------------------------------ */
/*  Scene spec                                                               */
/* ------------------------------------------------------------------------ */

export interface SceneSpec {
  id: string;
  roomType: string;
  style: string;
  before?: boolean;
  /** 0..n — shifts camera + furniture toggles for gallery variety */
  variant?: number;
  /** hero images get a wider, more dramatic frame */
  hero?: boolean;
}

type Side = 'left' | 'right' | 'back' | 'none';

interface Ctx {
  s: Svg;
  c: Cam;
  p: Palette;
  r: Rng;
  light: Pt;
  window: Side;
  before: boolean;
  roomType: string;
  style: string;
}

/* ------------------------------------------------------------------------ */
/*  Shell: walls, floor, ceiling, window, AO                                 */
/* ------------------------------------------------------------------------ */

function floorFill(ctx: Ctx): string {
  const { s, p, r } = ctx;
  switch (p.floorKind) {
    case 'wood':
      return woodFill(s, p.floor, r, false, 1.6);
    case 'marble':
      return marbleFill(s, p.floor, r, shade(p.floor, -0.18));
    case 'terrazzo':
      return terrazzoFill(s, p.floor, r);
    case 'concrete':
    case 'stone':
      return p.floor;
    default:
      return p.floor;
  }
}

function drawShell(ctx: Ctx) {
  const { s, c, p, light } = ctx;
  const lx = light[0];
  const leftLit = lx > 0; // light from the right lights the left wall
  const wallL = shade(p.wall, leftLit ? 0.02 : -0.06);
  const wallR = shade(p.wall, leftLit ? -0.06 : 0.02);
  const back = ctx.roomType === 'bathroom' ? p.wall : shade(p.wall, -0.015);

  // ceiling
  s.add(
    poly(
      c.ceiling(),
      s.grad(
        [0, 0],
        [0, c.bw.y0],
        [
          [0, shade(p.ceiling, -0.02)],
          [1, shade(p.ceiling, -0.09)],
        ],
      ),
    ),
  );
  // floor
  s.add(poly(c.floor(), floorFill(ctx)));
  // floor perspective lines for tile / stone
  if (p.floorKind === 'tile' || p.floorKind === 'stone' || p.floorKind === 'concrete') {
    const grout = shade(p.floor, -0.12);
    const clip = s.clip(c.floor());
    const g: string[] = [];
    const n = p.floorKind === 'concrete' ? 4 : 10;
    const stepX = (c.bw.x1 - c.bw.x0) / n;
    for (let i = -n * 2; i <= n * 3; i++) {
      const x = c.bw.x0 + i * stepX;
      g.push(line([x, c.bw.y1], c.far([x, c.bw.y1]), grout, 2.2, 'opacity="0.5"'));
    }
    for (let j = 0; j < 14; j++) {
      const t = j * 0.09 * (1 + j * 0.12);
      g.push(line(c.fp(-5000, t), c.fp(7000, t), grout, 2.2 + t * 2, 'opacity="0.5"'));
    }
    s.add(`<g clip-path="${clip}">${g.join('')}</g>`);
  }
  if (p.floorKind === 'wood') {
    // plank seams converging
    const clip = s.clip(c.floor());
    const g: string[] = [];
    const stepX = (c.bw.x1 - c.bw.x0) / 14;
    for (let i = -30; i <= 44; i++) {
      const x = c.bw.x0 + i * stepX;
      g.push(line([x, c.bw.y1], c.far([x, c.bw.y1]), shade(p.floor, -0.16), 1.8, 'opacity="0.45"'));
    }
    s.add(`<g clip-path="${clip}">${g.join('')}</g>`);
  }
  // floor sheen toward window
  const sheenX = ctx.window === 'left' ? 0 : ctx.window === 'right' ? W : W / 2;
  s.add(
    poly(
      c.floor(),
      s.radial(sheenX, H * 0.95, W * 0.7, [
        [0, withAlpha(p.light, 0.32)],
        [1, withAlpha(p.light, 0)],
      ]),
    ),
  );

  // walls
  s.add(
    poly(
      c.leftWall(),
      s.grad(
        [0, 0],
        [c.bw.x0, 0],
        [
          [0, shade(wallL, -0.03)],
          [1, wallL],
        ],
      ),
    ),
  );
  s.add(
    poly(
      c.rightWall(),
      s.grad(
        [W, 0],
        [c.bw.x1, 0],
        [
          [0, shade(wallR, -0.03)],
          [1, wallR],
        ],
      ),
    ),
  );
  s.add(
    poly(
      c.backWall(),
      s.grad(
        [c.bw.x0, 0],
        [c.bw.x1, 0],
        [
          [0, shade(back, leftLit ? -0.02 : 0.02)],
          [1, shade(back, leftLit ? 0.02 : -0.02)],
        ],
      ),
    ),
  );

  // skirting
  const sk = shade(p.wall, -0.1);
  s.add(poly([c.BL, c.BR, [c.BR[0], c.BR[1] - 10], [c.BL[0], c.BL[1] - 10]], sk));
  s.add(
    poly(
      [c.BL, [c.BL[0], c.BL[1] - 10], c.far([c.BL[0], c.BL[1] - 10]), c.far(c.BL)],
      shade(sk, -0.03),
    ),
  );
  s.add(
    poly(
      [c.BR, [c.BR[0], c.BR[1] - 10], c.far([c.BR[0], c.BR[1] - 10]), c.far(c.BR)],
      shade(sk, -0.03),
    ),
  );
  // cornice line
  const co = shade(p.ceiling, -0.14);
  s.add(line(c.TL, c.TR, co, 2));
  s.add(line(c.TL, c.far(c.TL), co, 2));
  s.add(line(c.TR, c.far(c.TR), co, 2));
  s.add(line(c.BL, c.far(c.BL), shade(p.floor, -0.25), 2));
  s.add(line(c.BR, c.far(c.BR), shade(p.floor, -0.25), 2));
}

function drawWindow(ctx: Ctx) {
  const { s, c, p, r } = ctx;
  if (ctx.window === 'none') return;
  const glass = s.grad(
    [0, 0],
    [0, H],
    [
      [0, '#FFFFFF'],
      [0.5, mix(p.light, '#CFE3F2', 0.5)],
      [1, shade(p.light, -0.05)],
    ],
  );
  let frame: Pt[];
  if (ctx.window === 'left') frame = c.onLeft(c.bw.y0 + 40, c.bw.y1 - 140, 0.22, 0.58);
  else if (ctx.window === 'right') frame = c.onRight(c.bw.y0 + 40, c.bw.y1 - 140, 0.22, 0.58);
  else {
    const w = (c.bw.x1 - c.bw.x0) * 0.32;
    const x0 = c.vp[0] + (ctx.roomType === 'kitchen' ? 60 : -w / 2);
    frame = c.onBack(x0, c.bw.y0 + 60, x0 + w, c.bw.y1 - 220);
  }
  const fr = shade(p.wall, -0.2);
  const inset = (q: Pt[], d: number): Pt[] => {
    const cx = q.reduce((a, b) => a + b[0], 0) / 4;
    const cy = q.reduce((a, b) => a + b[1], 0) / 4;
    return q.map(([x, y]) => [x + (cx - x) * d, y + (cy - y) * d]);
  };
  s.add(poly(frame, fr));
  s.add(poly(inset(frame, 0.04), glass));
  // mullions
  const [a, b, cc, d] = frame as [Pt, Pt, Pt, Pt];
  const midTop: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const midBot: Pt = [(cc[0] + d[0]) / 2, (cc[1] + d[1]) / 2];
  const midL: Pt = [(a[0] + d[0]) / 2, (a[1] + d[1]) / 2];
  const midR: Pt = [(b[0] + cc[0]) / 2, (b[1] + cc[1]) / 2];
  s.add(line(midTop, midBot, fr, 6));
  s.add(line(midL, midR, fr, 6));
  // light beam on floor
  const beamClip = s.clip(c.floor());
  const bx =
    ctx.window === 'left' ? c.bw.x0 - 300 : ctx.window === 'right' ? c.bw.x1 + 300 : c.vp[0];
  const beam: Pt[] =
    ctx.window === 'back'
      ? [
          c.fp(c.vp[0] - 220, 0),
          c.fp(c.vp[0] + 220, 0),
          c.fp(c.vp[0] + 900, 0.9),
          c.fp(c.vp[0] - 900, 0.9),
        ]
      : [
          c.fp(bx, 0.15),
          c.fp(bx + (ctx.window === 'left' ? 900 : -900), 0.35),
          c.fp(bx + (ctx.window === 'left' ? 1600 : -1600), 1.2),
          c.fp(bx, 0.9),
        ];
  s.add(
    `<g clip-path="${beamClip}"><polygon points="${pts(beam)}" fill="${withAlpha(p.light, 0.28)}" filter="${s.blur(40)}"/></g>`,
  );
  // curtains beside side windows
  if (ctx.window !== 'back' && !ctx.before && r.chance(0.8)) {
    const fabric = ctx.roomType === 'master-bedroom' ? p.fabric2 : p.fabric;
    const cur =
      ctx.window === 'left'
        ? c.onLeft(c.bw.y0 + 20, c.bw.y1, 0.14, 0.24)
        : c.onRight(c.bw.y0 + 20, c.bw.y1, 0.14, 0.24);
    const cur2 =
      ctx.window === 'left'
        ? c.onLeft(c.bw.y0 + 20, c.bw.y1, 0.56, 0.68)
        : c.onRight(c.bw.y0 + 20, c.bw.y1, 0.56, 0.68);
    const cf = s.grad(
      [0, 0],
      [60, 0],
      [
        [0, shade(fabric, 0.05)],
        [0.5, shade(fabric, -0.06)],
        [1, shade(fabric, 0.03)],
      ],
    );
    const clipL = s.clip(cur);
    const clipR = s.clip(cur2);
    s.add(poly(cur, fabric));
    s.add(
      `<g clip-path="${clipL}">${rect(0, 0, W, H, s.pattern(60, 100, rect(0, 0, 60, 100, cf)))}</g>`,
    );
    s.add(poly(cur2, fabric));
    s.add(
      `<g clip-path="${clipR}">${rect(0, 0, W, H, s.pattern(60, 100, rect(0, 0, 60, 100, cf)))}</g>`,
    );
  }
}

function drawAO(ctx: Ctx) {
  const { s, c } = ctx;
  const k = withAlpha('#000000', 0.22);
  const z = withAlpha('#000000', 0);
  // back wall / floor junction
  s.add(
    poly(
      [c.BL, c.BR, c.fp(c.bw.x1 + 200, 0.08), c.fp(c.bw.x0 - 200, 0.08)],
      s.grad(
        [0, c.bw.y1],
        [0, c.bw.y1 + 60],
        [
          [0, k],
          [1, z],
        ],
      ),
    ),
  );
  s.add(
    poly(
      [c.BL, c.BR, [c.bw.x1, c.bw.y1 - 60], [c.bw.x0, c.bw.y1 - 60]],
      s.grad(
        [0, c.bw.y1],
        [0, c.bw.y1 - 60],
        [
          [0, withAlpha('#000000', 0.16)],
          [1, z],
        ],
      ),
    ),
  );
  // vertical corners
  s.add(
    poly(
      [c.TL, c.BL, [c.bw.x0 + 50, c.bw.y1], [c.bw.x0 + 50, c.bw.y0]],
      s.grad(
        [c.bw.x0, 0],
        [c.bw.x0 + 50, 0],
        [
          [0, withAlpha('#000000', 0.12)],
          [1, z],
        ],
      ),
    ),
  );
  s.add(
    poly(
      [c.TR, c.BR, [c.bw.x1 - 50, c.bw.y1], [c.bw.x1 - 50, c.bw.y0]],
      s.grad(
        [c.bw.x1, 0],
        [c.bw.x1 - 50, 0],
        [
          [0, withAlpha('#000000', 0.12)],
          [1, z],
        ],
      ),
    ),
  );
  // ceiling / back wall
  s.add(
    poly(
      [c.TL, c.TR, [c.bw.x1, c.bw.y0 + 40], [c.bw.x0, c.bw.y0 + 40]],
      s.grad(
        [0, c.bw.y0],
        [0, c.bw.y0 + 40],
        [
          [0, withAlpha('#000000', 0.1)],
          [1, z],
        ],
      ),
    ),
  );
}

function drawVignetteAndGrain(s: Svg, strength = 0.35) {
  s.add(
    rect(
      0,
      0,
      W,
      H,
      s.radial(W / 2, H / 2, W * 0.75, [
        [0.55, withAlpha('#000000', 0)],
        [1, withAlpha('#000000', strength)],
      ]),
    ),
  );
  const id = gid('n');
  s.defs.push(
    `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.09"/></feComponentTransfer></filter>`,
  );
  s.add(`<rect x="0" y="0" width="${W}" height="${H}" filter="url(#${id})" opacity="0.9"/>`);
}

/* ------------------------------------------------------------------------ */
/*  Furniture primitives                                                     */
/* ------------------------------------------------------------------------ */

function shaded(
  ctx: Ctx,
  faces: { top: Pt[]; front: Pt[]; side: Pt[]; sideIsRight: boolean },
  color: string,
  opts: { topFill?: string; frontFill?: string } = {},
) {
  const { light } = ctx;
  const lit = faces.sideIsRight ? light[0] > 0 : light[0] < 0;
  return (
    poly(faces.side, shade(color, lit ? 0.02 : -0.1)) +
    poly(faces.front, opts.frontFill ?? shade(color, -0.03)) +
    poly(faces.top, opts.topFill ?? shade(color, 0.07))
  );
}

function shadow(ctx: Ctx, floorPoly: Pt[], alpha = 0.25, blur = 24) {
  const clip = ctx.s.clip(ctx.c.floor());
  return `<g clip-path="${clip}"><polygon points="${pts(floorPoly)}" fill="${withAlpha('#000000', alpha)}" filter="${ctx.s.blur(blur)}"/></g>`;
}

function sofa(ctx: Ctx, xa: number, xb: number, t0: number, t1: number, color: string) {
  const { c, s } = ctx;
  const out: string[] = [];
  const fab = fabricFill(s, color);
  out.push(
    shadow(ctx, [
      c.fp(xa - 30, t0 - 0.02),
      c.fp(xb + 30, t0 - 0.02),
      c.fp(xb + 60, t1 + 0.04),
      c.fp(xa - 60, t1 + 0.04),
    ]),
  );
  // base
  out.push(
    shaded(ctx, c.floorBox(xa, xb, t0, t1, 90), color, {
      frontFill: fab,
      topFill: shade(color, 0.05),
    }),
  );
  // back rest
  out.push(
    shaded(ctx, c.floorBox(xa, xb, t0, t0 + (t1 - t0) * 0.28, 210), color, { frontFill: fab }),
  );
  // arms
  const aw = (xb - xa) * 0.09;
  out.push(shaded(ctx, c.floorBox(xa, xa + aw, t0, t1, 140), color));
  out.push(shaded(ctx, c.floorBox(xb - aw, xb, t0, t1, 140), color));
  // cushions
  const n = 3;
  const cw = (xb - xa - 2 * aw) / n;
  for (let i = 0; i < n; i++) {
    const x0 = xa + aw + i * cw + 6;
    out.push(
      shaded(
        ctx,
        c.floorBox(x0, x0 + cw - 12, t0 + (t1 - t0) * 0.3, t1 - 0.01, 118),
        shade(color, 0.04),
        { topFill: shade(color, 0.09) },
      ),
    );
  }
  // throw pillows
  const pc = [ctx.p.fabric2, ctx.p.accent, shade(ctx.p.wood, 0.1)];
  for (let i = 0; i < 2; i++) {
    const x0 = i === 0 ? xa + aw + 20 : xb - aw - cw + 20;
    out.push(
      shaded(
        ctx,
        c.floorBox(x0, x0 + cw * 0.6, t0 + (t1 - t0) * 0.3, t0 + (t1 - t0) * 0.42, 180),
        pc[i] ?? color,
      ),
    );
  }
  return out.join('');
}

function bed(ctx: Ctx, xa: number, xb: number, t0: number, t1: number) {
  const { c, s, p } = ctx;
  const out: string[] = [];
  out.push(
    shadow(
      ctx,
      [c.fp(xa - 40, t0), c.fp(xb + 40, t0), c.fp(xb + 80, t1 + 0.05), c.fp(xa - 80, t1 + 0.05)],
      0.28,
    ),
  );
  // frame
  out.push(shaded(ctx, c.floorBox(xa, xb, t0, t1, 70), p.woodDark));
  // mattress + duvet
  const linen = p.fabric;
  out.push(
    shaded(ctx, c.floorBox(xa + 10, xb - 10, t0, t1 - 0.02, 130), linen, {
      frontFill: fabricFill(s, linen),
      topFill: shade(linen, 0.06),
    }),
  );
  // folded throw
  out.push(
    shaded(ctx, c.floorBox(xa + 10, xb - 10, t0 + (t1 - t0) * 0.62, t1 - 0.02, 140), p.fabric2, {
      topFill: shade(p.fabric2, 0.05),
    }),
  );
  // pillows
  const pw = (xb - xa - 60) / 2;
  for (let i = 0; i < 2; i++) {
    const x0 = xa + 30 + i * pw;
    out.push(
      shaded(
        ctx,
        c.floorBox(x0 + 10, x0 + pw - 10, t0 + 0.01, t0 + 0.09, 200),
        shade(linen, 0.04),
        { topFill: shade(linen, 0.1) },
      ),
    );
  }
  // side tables + lamps
  for (const side of [-1, 1]) {
    const sx = side < 0 ? xa - 150 : xb + 30;
    out.push(shaded(ctx, c.floorBox(sx, sx + 120, t0, t0 + 0.12, 150), p.wood));
    const top = c.fp(sx + 60, t0 + 0.06, 150);
    out.push(line(top, [top[0], top[1] - 90], p.metal, 4));
    out.push(
      poly(
        [
          [top[0] - 45, top[1] - 90],
          [top[0] + 45, top[1] - 90],
          [top[0] + 34, top[1] - 150],
          [top[0] - 34, top[1] - 150],
        ],
        shade(p.fabric, 0.08),
      ),
    );
    out.push(
      ell(
        top[0],
        top[1] - 100,
        110,
        60,
        s.radial(top[0], top[1] - 100, 110, [
          [0, withAlpha(p.light, 0.35)],
          [1, withAlpha(p.light, 0)],
        ]),
      ),
    );
  }
  return out.join('');
}

function headboardPanel(ctx: Ctx, x0: number, x1: number, y0: number) {
  const { c, s, p, r } = ctx;
  const fill =
    p.patternWall === 'fluted'
      ? flutedFill(s, p.wood, 40)
      : r.chance(0.5)
        ? fabricFill(s, p.fabric2)
        : p.accent;
  return (
    poly(c.onBack(x0, y0, x1, c.bw.y1), fill) +
    poly(c.onBack(x0, y0, x1, y0 + 6), shade(p.wood, 0.12))
  );
}

function wardrobe(ctx: Ctx, side: 'left' | 'right', t0: number, t1: number) {
  const { c, s, p } = ctx;
  const face =
    side === 'left'
      ? c.onLeft(c.bw.y0 + 10, c.bw.y1, t0, t1)
      : c.onRight(c.bw.y0 + 10, c.bw.y1, t0, t1);
  const fill = woodFill(s, p.wood, ctx.r, true, 1.4);
  const out = [poly(face, fill)];
  // shutter seams
  const n = 3;
  const [a, b, cc, d] = face as [Pt, Pt, Pt, Pt];
  for (let i = 1; i < n; i++) {
    const u = i / n;
    const top: Pt =
      side === 'left'
        ? [b[0] + (a[0] - b[0]) * u, b[1] + (a[1] - b[1]) * u]
        : [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    const bot: Pt =
      side === 'left'
        ? [cc[0] + (d[0] - cc[0]) * u, cc[1] + (d[1] - cc[1]) * u]
        : [d[0] + (cc[0] - d[0]) * u, d[1] + (cc[1] - d[1]) * u];
    out.push(line(top, bot, shade(p.wood, -0.25), 3));
    // handle
    const hy = 0.5;
    const hp: Pt = [top[0] + (bot[0] - top[0]) * hy, top[1] + (bot[1] - top[1]) * hy];
    out.push(line([hp[0], hp[1] - 40], [hp[0], hp[1] + 40], p.metal, 5));
  }
  // shading gradient towards the back
  const g =
    side === 'left'
      ? s.grad(
          [0, 0],
          [c.bw.x0, 0],
          [
            [0, withAlpha('#000000', 0)],
            [1, withAlpha('#000000', 0.18)],
          ],
        )
      : s.grad(
          [W, 0],
          [c.bw.x1, 0],
          [
            [0, withAlpha('#000000', 0)],
            [1, withAlpha('#000000', 0.18)],
          ],
        );
  out.push(poly(face, g));
  return out.join('');
}

function artFrame(ctx: Ctx, x0: number, y0: number, w: number, h: number) {
  const { c, s, p, r } = ctx;
  const out: string[] = [];
  out.push(poly(c.onBack(x0 + 8, y0 + 12, x0 + w + 8, y0 + h + 12), withAlpha('#000000', 0.12)));
  out.push(poly(c.onBack(x0, y0, x0 + w, y0 + h), p.woodDark));
  const inner = c.onBack(x0 + 10, y0 + 10, x0 + w - 10, y0 + h - 10);
  const bg = shade(p.wall, 0.04);
  out.push(poly(inner, bg));
  const clip = s.clip(inner);
  const cols = [p.accent, p.fabric2, p.wood, p.plant, p.metal];
  let art = '';
  for (let i = 0; i < 4; i++) {
    const cx = x0 + r.range(0.2, 0.8) * w;
    const cy = y0 + r.range(0.2, 0.8) * h;
    art += r.chance(0.5)
      ? ell(cx, cy, r.range(0.1, 0.3) * w, r.range(0.1, 0.3) * h, r.pick(cols), 'opacity="0.85"')
      : rect(
          cx - r.range(20, 80),
          cy - r.range(20, 120),
          r.range(40, 160),
          r.range(40, 200),
          r.pick(cols),
          'opacity="0.8"',
        );
  }
  out.push(`<g clip-path="${clip}">${art}</g>`);
  return out.join('');
}

function plant(ctx: Ctx, x: number, t: number, scale = 1) {
  const { c, s, p, r } = ctx;
  const out: string[] = [];
  const potW = 90 * scale;
  out.push(
    shadow(
      ctx,
      [
        c.fp(x - potW, t - 0.02),
        c.fp(x + potW, t - 0.02),
        c.fp(x + potW * 1.4, t + 0.06),
        c.fp(x - potW * 1.4, t + 0.06),
      ],
      0.22,
      16,
    ),
  );
  out.push(
    shaded(
      ctx,
      c.floorBox(x - potW / 2, x + potW / 2, t, t + 0.06, 110 * scale),
      shade(p.fabric2, 0.1),
    ),
  );
  const base = c.fp(x, t + 0.03, 110 * scale);
  const sc = (1 + c.k * (t + 0.03)) * scale;
  for (let i = 0; i < 9; i++) {
    const ang = r.range(-70, 70);
    const len = r.range(120, 260) * sc;
    const rad = (ang * Math.PI) / 180;
    const tip: Pt = [base[0] + Math.sin(rad) * len, base[1] - Math.cos(rad) * len];
    out.push(
      `<path d="M${f(base[0])} ${f(base[1])} Q ${f((base[0] + tip[0]) / 2 + r.jitter(30))} ${f((base[1] + tip[1]) / 2 - 40)} ${f(tip[0])} ${f(tip[1])}" stroke="${shade(p.plant, -0.1)}" stroke-width="${f(4 * sc)}" fill="none"/>`,
    );
    out.push(
      ell(
        tip[0],
        tip[1],
        34 * sc,
        16 * sc,
        shade(p.plant, r.jitter(0.06)),
        `transform="rotate(${f(ang)} ${f(tip[0])} ${f(tip[1])})"`,
      ),
    );
  }
  void s;
  return out.join('');
}

function floorLamp(ctx: Ctx, x: number, t: number) {
  const { c, p, s } = ctx;
  const base = c.fp(x, t);
  const sc = 1 + c.k * t;
  const top: Pt = [base[0], base[1] - 520 * sc];
  const out = [
    ell(base[0], base[1], 40 * sc, 14 * sc, p.metal),
    line(base, top, p.metal, 5 * sc),
    poly(
      [
        [top[0] - 70 * sc, top[1] + 40 * sc],
        [top[0] + 70 * sc, top[1] + 40 * sc],
        [top[0] + 50 * sc, top[1] - 60 * sc],
        [top[0] - 50 * sc, top[1] - 60 * sc],
      ],
      shade(p.fabric, 0.06),
    ),
    ell(
      top[0],
      top[1] + 40 * sc,
      140 * sc,
      80 * sc,
      s.radial(top[0], top[1] + 40 * sc, 140 * sc, [
        [0, withAlpha(p.light, 0.4)],
        [1, withAlpha(p.light, 0)],
      ]),
    ),
  ];
  return out.join('');
}

function pendant(ctx: Ctx, x: number, t: number, kind: 'dome' | 'cone' | 'globe' = 'dome') {
  const { c, p, s } = ctx;
  const sc = 1 + c.k * t;
  const ceil = c.toward([x, c.bw.y0], t);
  const drop = 200 * sc;
  const at: Pt = [ceil[0], ceil[1] + drop];
  const out = [line(ceil, at, p.metal, 2.5 * sc)];
  if (kind === 'globe')
    out.push(ell(at[0], at[1] + 40 * sc, 44 * sc, 44 * sc, shade(p.light, 0.02)));
  else if (kind === 'cone')
    out.push(
      poly(
        [
          [at[0] - 20 * sc, at[1]],
          [at[0] + 20 * sc, at[1]],
          [at[0] + 80 * sc, at[1] + 90 * sc],
          [at[0] - 80 * sc, at[1] + 90 * sc],
        ],
        p.metal,
      ),
    );
  else
    out.push(
      `<path d="M${f(at[0] - 90 * sc)} ${f(at[1] + 80 * sc)} a ${f(90 * sc)} ${f(90 * sc)} 0 0 1 ${f(180 * sc)} 0 Z" fill="${p.metal}"/>`,
    );
  out.push(
    ell(
      at[0],
      at[1] + 90 * sc,
      180 * sc,
      100 * sc,
      s.radial(at[0], at[1] + 90 * sc, 180 * sc, [
        [0, withAlpha(p.light, 0.35)],
        [1, withAlpha(p.light, 0)],
      ]),
    ),
  );
  return out.join('');
}

function coveLight(ctx: Ctx) {
  const { c, s, p } = ctx;
  const inset = 70;
  const outer = c.ceiling();
  const inner: Pt[] = [
    c.toward([c.bw.x0 - inset, c.bw.y0 - inset], 0.55),
    c.toward([c.bw.x1 + inset, c.bw.y0 - inset], 0.55),
    [c.bw.x1 + inset * 0.4, c.bw.y0 + 6],
    [c.bw.x0 - inset * 0.4, c.bw.y0 + 6],
  ];
  void outer;
  const glow = s.grad(
    [0, c.bw.y0 - 120],
    [0, c.bw.y0 + 30],
    [
      [0, withAlpha(p.light, 0)],
      [1, withAlpha(warm(p.light, 0.3), 0.55)],
    ],
  );
  return (
    poly(inner, shade(p.ceiling, -0.02)) +
    poly(c.onBack(c.bw.x0, c.bw.y0, c.bw.x1, c.bw.y0 + 80), glow) +
    line([inner[3]![0], inner[3]![1]], [inner[2]![0], inner[2]![1]], warm(p.light, 0.5), 5)
  );
}

function table(
  ctx: Ctx,
  xa: number,
  xb: number,
  t0: number,
  t1: number,
  h: number,
  color: string,
  topFill?: string,
) {
  const { c } = ctx;
  const out: string[] = [];
  out.push(
    shadow(
      ctx,
      [c.fp(xa, t0), c.fp(xb, t0), c.fp(xb + 30, t1 + 0.03), c.fp(xa - 30, t1 + 0.03)],
      0.2,
    ),
  );
  // legs
  for (const [x, t] of [
    [xa + 15, t0 + 0.01],
    [xb - 15, t0 + 0.01],
    [xa + 15, t1 - 0.01],
    [xb - 15, t1 - 0.01],
  ] as [number, number][]) {
    out.push(line(c.fp(x, t), c.fp(x, t, h - 14), shade(color, -0.15), 8 * (1 + c.k * t)));
  }
  out.push(shaded(ctx, c.floorBox(xa, xb, t0, t1, h, c.bw.y1), color, { topFill }));
  // trim the box so only the slab shows: overdraw underside with nothing (we drew legs first, box covers) — slab thickness illusion:
  const under = c.floorBox(xa, xb, t0, t1, h - 14);
  out.push(poly(under.front, withAlpha('#000000', 0)));
  return out.join('');
}

function chair(ctx: Ctx, x: number, t: number, facing: 'back' | 'front', color: string) {
  const { c } = ctx;
  const w = 64;
  const out: string[] = [];
  const legC = shade(ctx.p.woodDark, -0.05);
  for (const [lx, lt] of [
    [x - w / 2 + 6, t + 0.005],
    [x + w / 2 - 6, t + 0.005],
    [x - w / 2 + 6, t + 0.05],
    [x + w / 2 - 6, t + 0.05],
  ] as [number, number][]) {
    out.push(line(c.fp(lx, lt), c.fp(lx, lt, 90), legC, 5 * (1 + c.k * t)));
  }
  out.push(shaded(ctx, c.floorBox(x - w / 2, x + w / 2, t, t + 0.055, 95, undefined, 82), color));
  const bt = facing === 'back' ? t + 0.05 : t;
  if (facing === 'back') {
    out.push(
      shaded(ctx, c.floorBox(x - w / 2, x + w / 2, bt, bt + 0.01, 180), shade(color, -0.04)),
    );
  } else {
    // open frame back so the table stays visible
    const post = (px: number) => line(c.fp(px, bt), c.fp(px, bt, 180), legC, 6 * (1 + c.k * t));
    out.push(post(x - w / 2 + 6), post(x + w / 2 - 6));
    out.push(
      shaded(
        ctx,
        c.floorBox(x - w / 2, x + w / 2, bt, bt + 0.01, 180, undefined, 150),
        shade(color, -0.04),
      ),
    );
  }
  return out.join('');
}

function shelfUnit(ctx: Ctx, x0: number, x1: number, y0: number, y1: number, depth: number) {
  const { c, s, p, r } = ctx;
  const out: string[] = [];
  const wood = woodFill(s, p.wood, r, false, 1);
  const box = c.wallBox(x0, y0, x1, y1, depth);
  out.push(poly(box.side, shade(p.wood, -0.12)));
  out.push(poly(box.cap, shade(p.wood, box.capIsTop ? 0.06 : -0.1)));
  out.push(poly(box.front, wood));
  const rows = 4;
  const rh = (y1 - y0) / rows;
  for (let i = 1; i < rows; i++) {
    const y = y0 + i * rh;
    const shelf = c.wallBox(x0 + 8, y - 6, x1 - 8, y + 6, depth);
    out.push(poly(shelf.front, shade(p.wood, 0.05)));
  }
  // objects
  const objColors = [p.accent, p.fabric2, p.metal, p.plant, shade(p.wall, 0.05)];
  for (let i = 0; i < rows; i++) {
    const y = y0 + i * rh + rh - 6;
    let x = x0 + 24;
    while (x < x1 - 60) {
      const w = r.range(24, 70);
      const h = r.range(30, rh - 30);
      const ob = c.wallBox(x, y - h, x + w, y, depth * 0.9);
      out.push(poly(ob.front, r.pick(objColors)));
      x += w + r.range(12, 40);
    }
  }
  return out.join('');
}

function tvUnit(ctx: Ctx) {
  const { c, s, p, r } = ctx;
  const out: string[] = [];
  const x0 = c.bw.x0 + 70;
  const x1 = c.bw.x1 - 70;
  // wall panel (accent/fluted) behind TV
  const panelFill =
    p.patternWall === 'fluted'
      ? flutedFill(s, p.wood)
      : p.patternWall === 'stripe'
        ? stripeFill(s, p.accent, shade(p.accent, -0.06))
        : p.accent;
  const px0 = c.vp[0] - 60;
  out.push(poly(c.onBack(px0, c.bw.y0 + 40, c.bw.x1 - 60, c.bw.y1), panelFill));
  // low unit
  const unit = c.wallBox(x0, c.bw.y1 - 110, x1, c.bw.y1, 0.09);
  out.push(poly(unit.side, shade(p.woodDark, -0.08)));
  out.push(poly(unit.cap, shade(p.woodDark, 0.08)));
  out.push(poly(unit.front, woodFill(s, p.woodDark, r, false, 1.2)));
  // drawer seams
  for (let i = 1; i < 4; i++) {
    const x = x0 + ((x1 - x0) * i) / 4;
    out.push(
      line(
        c.toward([x, c.bw.y1 - 110], 0.09),
        c.toward([x, c.bw.y1], 0.09),
        shade(p.woodDark, -0.2),
        2,
      ),
    );
  }
  // TV
  const tw = (x1 - x0) * 0.42;
  const tx = c.vp[0] - tw / 2 + 40;
  const ty = c.bw.y0 + 150;
  out.push(poly(c.onBack(tx, ty, tx + tw, ty + tw * 0.56), '#0E0E10'));
  out.push(
    poly(
      c.onBack(tx + 6, ty + 6, tx + tw - 6, ty + tw * 0.56 - 6),
      s.grad(
        [tx, ty],
        [tx + tw, ty + tw * 0.56],
        [
          [0, '#1A1C22'],
          [1, '#2C3140'],
        ],
      ),
    ),
  );
  // objects on unit
  out.push(plantSmall(ctx, x1 - 120, c.bw.y1 - 110, 0.05));
  out.push(poly(c.onBack(x0 + 40, c.bw.y1 - 170, x0 + 110, c.bw.y1 - 112), p.fabric2));
  return out.join('');
}

function plantSmall(ctx: Ctx, x: number, y: number, d: number) {
  const { c, p, r } = ctx;
  const base = c.toward([x, y], d);
  let out = poly(
    [
      [base[0] - 22, base[1]],
      [base[0] + 22, base[1]],
      [base[0] + 16, base[1] - 44],
      [base[0] - 16, base[1] - 44],
    ],
    p.metal,
  );
  for (let i = 0; i < 6; i++) {
    const a = r.range(-60, 60);
    const l = r.range(50, 110);
    const rad = (a * Math.PI) / 180;
    const tip: Pt = [base[0] + Math.sin(rad) * l, base[1] - 44 - Math.cos(rad) * l];
    out += line([base[0], base[1] - 44], tip, shade(p.plant, -0.05), 3);
    out += ell(
      tip[0],
      tip[1],
      16,
      8,
      p.plant,
      `transform="rotate(${f(a)} ${f(tip[0])} ${f(tip[1])})"`,
    );
  }
  return out;
}

function rug(
  ctx: Ctx,
  xa: number,
  xb: number,
  t0: number,
  t1: number,
  color: string,
  pattern: 'plain' | 'stripe' | 'kilim' = 'plain',
) {
  const { c, s } = ctx;
  const q: Pt[] = [c.fp(xa, t0), c.fp(xb, t0), c.fp(xb, t1), c.fp(xa, t1)];
  let out = poly(q, color);
  if (pattern !== 'plain') {
    const clip = s.clip(q);
    const g: string[] = [];
    const n = pattern === 'kilim' ? 9 : 6;
    for (let i = 1; i < n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      g.push(
        line(
          c.fp(xa, t),
          c.fp(xb, t),
          shade(color, i % 2 ? -0.12 : 0.08),
          pattern === 'kilim' ? 10 : 18,
        ),
      );
    }
    if (pattern === 'kilim')
      for (let i = 1; i < 6; i++) {
        const x = xa + ((xb - xa) * i) / 6;
        g.push(line(c.fp(x, t0), c.fp(x, t1), shade(color, -0.1), 5));
      }
    out += `<g clip-path="${clip}">${g.join('')}</g>`;
  }
  // border
  out += `<polygon points="${pts(q)}" fill="none" stroke="${shade(color, -0.15)}" stroke-width="6"/>`;
  return out;
}

function kitchenRun(ctx: Ctx, side: 'back' | 'left' | 'right' | 'L') {
  const { c, s, p, r } = ctx;
  const out: string[] = [];
  const y0u = c.bw.y0 + 30;
  const y1u = c.bw.y0 + 300;
  const yCounter = c.bw.y1 - 140;
  const glossy = (base: string, a: Pt, b: Pt) =>
    s.grad(a, b, [
      [0, shade(base, 0.06)],
      [1, shade(base, -0.04)],
    ]);
  const back = side === 'back' || side === 'L';
  const leftRun = side === 'left' || side === 'L';
  const rightRun = side === 'right';
  const x0 = c.bw.x0 + 20;
  const x1 = c.bw.x1 - 20;
  // backsplash
  const splash = r.chance(0.5)
    ? subwayFill(s, shade(p.wall, 0.04), shade(p.wall, -0.1))
    : tileFill(s, shade(p.accent, 0.15), 80, shade(p.accent, -0.05), 2);
  if (back) out.push(poly(c.onBack(x0, y1u, x1, yCounter), splash));
  if (leftRun) out.push(poly(c.onLeft(y1u, yCounter, 0, 0.5), splash));
  if (rightRun) out.push(poly(c.onRight(y1u, yCounter, 0, 0.5), splash));
  // uppers
  const upperD = 0.05;
  const drawUppers = (face: Pt[], count: number, vertical: (u: number) => [Pt, Pt]) => {
    out.push(poly(face, glossy(p.upper, face[0]!, face[2]!)));
    for (let i = 1; i < count; i++) {
      const [a, b] = vertical(i / count);
      out.push(line(a, b, shade(p.upper, -0.18), 2.5));
    }
  };
  if (back) {
    const up = c.wallBox(x0, y0u, x1, y1u, upperD);
    out.push(poly(up.cap, shade(p.upper, -0.12)));
    drawUppers(up.front, 6, (u) => [
      c.toward([x0 + (x1 - x0) * u, y0u], upperD),
      c.toward([x0 + (x1 - x0) * u, y1u], upperD),
    ]);
    // chimney
    const chX = c.vp[0] - 100;
    out.push(poly(c.wallBox(chX, y0u + 40, chX + 260, y1u - 20, 0.09).front, '#2A2A2C'));
    out.push(poly(c.wallBox(chX, y1u - 20, chX + 260, y1u + 4, 0.09).front, p.metal));
  }
  if (leftRun) {
    const face = c.onLeft(y0u, y1u, upperD, 0.5);
    drawUppers(face, 4, (u) => {
      const t = upperD + (0.5 - upperD) * (1 - u);
      return [c.toward([c.bw.x0, y0u], t), c.toward([c.bw.x0, y1u], t)];
    });
  }
  if (rightRun) {
    const face = c.onRight(y0u, y1u, upperD, 0.5);
    drawUppers(face, 4, (u) => {
      const t = upperD + (0.5 - upperD) * u;
      return [c.toward([c.bw.x1, y0u], t), c.toward([c.bw.x1, y1u], t)];
    });
  }
  // counter + lowers
  const d = 0.12;
  const counterFill =
    p.counter === '#1C1C1E' || p.counter.startsWith('#2') || p.counter.startsWith('#3')
      ? p.counter
      : marbleFill(s, p.counter, r, shade(p.counter, -0.15));
  if (back) {
    const low = c.wallBox(x0, yCounter + 14, x1, c.bw.y1, d);
    out.push(poly(low.side, shade(p.lower, -0.1)));
    out.push(poly(low.front, glossy(p.lower, low.front[0]!, low.front[3]!)));
    for (let i = 1; i < 6; i++) {
      const x = x0 + ((x1 - x0) * i) / 6;
      out.push(
        line(
          c.toward([x, yCounter + 14], d),
          c.toward([x, c.bw.y1], d),
          shade(p.lower, -0.18),
          2.5,
        ),
      );
    }
    // handles
    for (let i = 0; i < 6; i++) {
      const x = x0 + ((x1 - x0) * (i + 0.5)) / 6;
      const hp = c.toward([x, yCounter + 40], d);
      out.push(line([hp[0] - 30, hp[1]], [hp[0] + 30, hp[1]], p.metal, 5));
    }
    const top: Pt[] = [
      [x0, yCounter],
      [x1, yCounter],
      c.toward([x1, yCounter], d),
      c.toward([x0, yCounter], d),
    ];
    out.push(poly(top, counterFill));
    out.push(
      poly(
        [
          c.toward([x0, yCounter], d),
          c.toward([x1, yCounter], d),
          c.toward([x1, yCounter + 14], d),
          c.toward([x0, yCounter + 14], d),
        ],
        shade(p.counter, 0.05),
      ),
    );
    // hob + sink
    const hob = c.vp[0] - 30;
    out.push(
      poly(
        [
          c.toward([hob - 110, yCounter + 2], d * 0.35),
          c.toward([hob + 110, yCounter + 2], d * 0.35),
          c.toward([hob + 110, yCounter + 2], d * 0.8),
          c.toward([hob - 110, yCounter + 2], d * 0.8),
        ],
        '#111',
      ),
    );
    for (const dx of [-60, 60]) {
      const q = c.toward([hob + dx, yCounter + 2], d * 0.57);
      out.push(ell(q[0], q[1], 34, 12, '#333'));
    }
    const sinkX = x0 + (x1 - x0) * 0.2;
    out.push(
      poly(
        [
          c.toward([sinkX - 110, yCounter + 2], d * 0.3),
          c.toward([sinkX + 110, yCounter + 2], d * 0.3),
          c.toward([sinkX + 110, yCounter + 2], d * 0.85),
          c.toward([sinkX - 110, yCounter + 2], d * 0.85),
        ],
        shade(p.metal, 0.25),
      ),
    );
    const tap = c.toward([sinkX, yCounter], d * 0.12);
    out.push(
      `<path d="M${f(tap[0])} ${f(tap[1])} v -70 q 0 -30 30 -30 h 20" stroke="${p.metal}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    );
  }
  if (leftRun) {
    const face = c.onLeft(yCounter + 14, c.bw.y1, d, 0.5);
    out.push(poly(face, glossy(p.lower, face[1]!, face[0]!)));
    const top: Pt[] = [
      c.toward([c.bw.x0, yCounter], 0),
      c.toward([c.bw.x0, yCounter], 0.5),
      c.toward([c.bw.x0, yCounter], 0.62),
      c.toward([c.bw.x0, yCounter], d),
    ].map((pt, i) => (i >= 2 ? [pt[0] + 120 + d * 400, pt[1] + 30] : pt)) as Pt[];
    out.push(poly(top, counterFill));
  }
  if (rightRun) {
    const face = c.onRight(yCounter + 14, c.bw.y1, d, 0.5);
    out.push(poly(face, glossy(p.lower, face[0]!, face[1]!)));
    const top: Pt[] = [
      c.toward([c.bw.x1, yCounter], 0),
      c.toward([c.bw.x1, yCounter], d),
      c.toward([c.bw.x1, yCounter], 0.62),
      c.toward([c.bw.x1, yCounter], 0.5),
    ].map((pt, i) => (i === 1 || i === 2 ? [pt[0] - 120 - d * 400, pt[1] + 30] : pt)) as Pt[];
    out.push(poly(top, counterFill));
  }
  return out.join('');
}

function bathroom(ctx: Ctx) {
  const { c, s, p, r } = ctx;
  const out: string[] = [];
  // tiled walls
  const wallTile = r.chance(0.5)
    ? subwayFill(s, shade(p.wall, 0.03), shade(p.wall, -0.12))
    : tileFill(s, shade(p.wall, 0.02), 160, shade(p.wall, -0.12), 3);
  out.push(poly(c.leftWall(), wallTile));
  out.push(poly(c.rightWall(), wallTile));
  const feature =
    p.floorKind === 'marble'
      ? marbleFill(s, p.accent, r, shade(p.accent, 0.25))
      : tileFill(s, p.accent, 100, shade(p.accent, -0.15), 3);
  out.push(poly(c.backWall(), feature));
  // vanity
  const x0 = c.vp[0] - 360;
  const x1 = c.vp[0] + 360;
  const yTop = c.bw.y1 - 160;
  const van = c.wallBox(x0, yTop + 14, x1, c.bw.y1, 0.12);
  out.push(poly(van.side, shade(p.wood, -0.1)));
  out.push(poly(van.front, woodFill(s, p.wood, r, false, 1.2)));
  out.push(
    poly(
      [[x0, yTop], [x1, yTop], c.toward([x1, yTop], 0.12), c.toward([x0, yTop], 0.12)],
      marbleFill(s, p.counter, r, shade(p.counter, -0.12)),
    ),
  );
  // basin + tap
  const bx = c.vp[0];
  const bq = c.toward([bx, yTop], 0.06);
  out.push(ell(bq[0], bq[1] + 4, 120, 40, '#F7F7F5'));
  out.push(ell(bq[0], bq[1] + 6, 100, 28, '#E6E6E2'));
  out.push(
    `<path d="M${f(bx)} ${f(yTop - 4)} v -60 h 40" stroke="${p.metal}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  );
  // mirror + light
  out.push(
    poly(
      c.onBack(x0 + 120, c.bw.y0 + 60, x1 - 120, yTop - 140),
      s.grad(
        [x0, c.bw.y0],
        [x1, yTop],
        [
          [0, '#D9E0E4'],
          [0.5, '#EDF1F3'],
          [1, '#C9D1D6'],
        ],
      ),
    ),
  );
  out.push(poly(c.onBack(x0 + 120, c.bw.y0 + 40, x1 - 120, c.bw.y0 + 60), warm(p.light, 0.3)));
  // shower glass on the side opposite the window
  const side: 'left' | 'right' = ctx.window === 'left' ? 'right' : 'left';
  const glass =
    side === 'left'
      ? c.onLeft(c.bw.y0 + 20, c.bw.y1 + 200, 0, 0.55)
      : c.onRight(c.bw.y0 + 20, c.bw.y1 + 200, 0, 0.55);
  out.push(poly(glass, withAlpha('#DDE8EC', 0.35), `stroke="${p.metal}" stroke-width="6"`));
  const showerHead =
    side === 'left'
      ? c.toward([c.bw.x0, c.bw.y0 + 60], 0.25)
      : c.toward([c.bw.x1, c.bw.y0 + 60], 0.25);
  out.push(
    line(showerHead, [showerHead[0] + (side === 'left' ? 120 : -120), showerHead[1]], p.metal, 8),
  );
  out.push(ell(showerHead[0] + (side === 'left' ? 120 : -120), showerHead[1] + 8, 60, 12, p.metal));
  // towel + plant
  out.push(poly(c.onBack(x1 + 40, yTop - 60, x1 + 100, yTop + 120), p.fabric));
  out.push(plantSmall(ctx, x0 + 40, yTop, 0.04));
  return out.join('');
}

function poojaRoom(ctx: Ctx) {
  const { c, s, p, r } = ctx;
  const out: string[] = [];
  const bx0 = c.vp[0] - 320;
  const bx1 = c.vp[0] + 320;
  // jaali/back panel with arch
  out.push(
    poly(
      c.onBack(bx0 - 60, c.bw.y0 + 30, bx1 + 60, c.bw.y1),
      jaaliFill(s, p.wood, warm(p.light, 0.4)),
    ),
  );
  out.push(
    `<path d="M${f(bx0)} ${f(c.bw.y1 - 200)} V ${f(c.bw.y0 + 240)} A ${f((bx1 - bx0) / 2)} ${f((bx1 - bx0) / 2)} 0 0 1 ${f(bx1)} ${f(c.bw.y0 + 240)} V ${f(c.bw.y1 - 200)} Z" fill="${s.radial(
      c.vp[0],
      c.bw.y0 + 300,
      400,
      [
        [0, warm(p.light, 0.6)],
        [1, p.accent],
      ],
    )}"/>`,
  );
  // platform
  const yTop = c.bw.y1 - 200;
  const pl = c.wallBox(bx0, yTop + 14, bx1, c.bw.y1, 0.14);
  out.push(poly(pl.side, shade(p.wood, -0.1)));
  out.push(poly(pl.front, woodFill(s, p.wood, r, true, 1.2)));
  for (let i = 1; i < 4; i++) {
    const x = bx0 + ((bx1 - bx0) * i) / 4;
    out.push(
      line(c.toward([x, yTop + 14], 0.14), c.toward([x, c.bw.y1], 0.14), shade(p.wood, -0.25), 2),
    );
  }
  out.push(
    poly(
      [[bx0, yTop], [bx1, yTop], c.toward([bx1, yTop], 0.14), c.toward([bx0, yTop], 0.14)],
      marbleFill(s, '#F1E6E2', r, '#D9BFB8'),
    ),
  );
  // idols as warm silhouettes + diyas
  for (const dx of [-120, 0, 120]) {
    const q = c.toward([c.vp[0] + dx, yTop], 0.05);
    out.push(
      `<path d="M${f(q[0] - 34)} ${f(q[1])} q 0 -60 20 -90 q 14 -30 14 -60 a 12 12 0 0 1 24 0 q 0 30 14 60 q 20 30 20 90 Z" fill="${p.metal}" opacity="0.9"/>`,
    );
  }
  for (const dx of [-260, -200, 200, 260]) {
    const q = c.toward([c.vp[0] + dx, yTop], 0.09);
    out.push(ell(q[0], q[1], 16, 6, p.metal));
    out.push(ell(q[0], q[1] - 14, 7, 12, '#FFB74A'));
    out.push(
      ell(
        q[0],
        q[1] - 14,
        60,
        40,
        s.radial(q[0], q[1] - 14, 60, [
          [0, withAlpha('#FFC66B', 0.5)],
          [1, withAlpha('#FFC66B', 0)],
        ]),
      ),
    );
  }
  // bells
  for (const dx of [-380, 380]) {
    const top = c.toward([c.vp[0] + dx, c.bw.y0], 0.2);
    out.push(line(top, [top[0], top[1] + 260], p.metal, 3));
    out.push(`<path d="M${f(top[0] - 30)} ${f(top[1] + 300)} q 30 -70 60 0 Z" fill="${p.metal}"/>`);
  }
  // flower garland
  out.push(
    `<path d="M${f(bx0)} ${f(c.bw.y0 + 200)} Q ${f(c.vp[0])} ${f(c.bw.y0 + 320)} ${f(bx1)} ${f(c.bw.y0 + 200)}" stroke="#E6A23C" stroke-width="16" fill="none" stroke-dasharray="6 10"/>`,
  );
  return out.join('');
}

function foyer(ctx: Ctx) {
  const { c, s, p, r } = ctx;
  const out: string[] = [];
  const x0 = c.vp[0] - 300;
  const x1 = c.vp[0] + 300;
  out.push(
    poly(
      c.onBack(x0 - 80, c.bw.y0 + 20, x1 + 80, c.bw.y1),
      p.patternWall === 'fluted' ? flutedFill(s, p.wood) : p.accent,
    ),
  );
  // console
  out.push(
    poly(
      c.wallBox(x0, c.bw.y1 - 220, x1, c.bw.y1, 0.08).front,
      woodFill(s, p.woodDark, r, false, 1.1),
    ),
  );
  out.push(
    poly(
      [
        [x0, c.bw.y1 - 230],
        [x1, c.bw.y1 - 230],
        c.toward([x1, c.bw.y1 - 230], 0.08),
        c.toward([x0, c.bw.y1 - 230], 0.08),
      ],
      shade(p.woodDark, 0.08),
    ),
  );
  // round mirror
  out.push(
    `<circle cx="${f(c.vp[0])}" cy="${f(c.bw.y0 + 230)}" r="150" fill="${s.grad(
      [x0, c.bw.y0],
      [x1, c.bw.y1],
      [
        [0, '#D9E0E4'],
        [1, '#B9C3C9'],
      ],
    )}" stroke="${p.metal}" stroke-width="10"/>`,
  );
  out.push(plantSmall(ctx, x1 - 80, c.bw.y1 - 230, 0.04));
  out.push(poly(c.onBack(x0 + 60, c.bw.y1 - 330, x0 + 130, c.bw.y1 - 232), p.fabric2));
  // bench + shoe cabinet on side
  out.push(wardrobe(ctx, ctx.window === 'left' ? 'right' : 'left', 0.05, 0.4));
  out.push(plant(ctx, ctx.window === 'left' ? c.bw.x1 + 120 : c.bw.x0 - 120, 0.25, 1.1));
  return out.join('');
}

function balcony(ctx: Ctx) {
  const { c, s, p, r } = ctx;
  const out: string[] = [];
  // open back: sky + railing instead of a wall
  out.push(
    poly(
      c.backWall(),
      s.grad(
        [0, c.bw.y0],
        [0, c.bw.y1],
        [
          [0, '#BFD8EE'],
          [0.6, '#E9EEF2'],
          [1, '#D6D2C8'],
        ],
      ),
    ),
  );
  // distant buildings
  let x = c.bw.x0;
  while (x < c.bw.x1) {
    const w = r.range(60, 160);
    const h = r.range(120, 320);
    out.push(
      poly(c.onBack(x, c.bw.y1 - 120 - h, x + w, c.bw.y1 - 120), shade('#C9CBCF', r.jitter(0.05))),
    );
    x += w + r.range(10, 30);
  }
  // railing
  out.push(poly(c.onBack(c.bw.x0, c.bw.y1 - 340, c.bw.x1, c.bw.y1 - 330), p.metal));
  for (let i = 0; i <= 18; i++) {
    const rx = c.bw.x0 + ((c.bw.x1 - c.bw.x0) * i) / 18;
    out.push(line([rx, c.bw.y1 - 330], [rx, c.bw.y1], p.metal, 4));
  }
  // deck floor
  out.push(poly(c.floor(), woodFill(s, p.wood, r, false, 1.8)));
  // planters + seating
  for (let i = 0; i < 4; i++)
    out.push(plant(ctx, c.bw.x0 + 40 + i * 200, 0.02 + i * 0.03, 0.8 + r.range(0, 0.4)));
  out.push(chair(ctx, c.bw.x1 - 200, 0.25, 'front', p.wood));
  out.push(chair(ctx, c.bw.x1 - 80, 0.32, 'front', p.wood));
  out.push(table(ctx, c.bw.x1 - 190, c.bw.x1 - 90, 0.42, 0.5, 120, p.wood));
  out.push(pendant(ctx, c.vp[0], 0.3, 'globe'));
  return out.join('');
}

function office(ctx: Ctx) {
  const { c, p, r } = ctx;
  const out: string[] = [];
  out.push(shelfUnit(ctx, c.bw.x0 + 40, c.bw.x0 + 420, c.bw.y0 + 60, c.bw.y1, 0.06));
  out.push(poly(c.onBack(c.vp[0] - 60, c.bw.y0 + 80, c.bw.x1 - 60, c.bw.y0 + 380), p.accent));
  // desks in rows
  const rows = ctx.roomType === 'office' ? 2 : 1;
  for (let rI = 0; rI < rows; rI++) {
    const t0 = 0.12 + rI * 0.28;
    out.push(
      table(ctx, c.vp[0] - 380, c.vp[0] + 380, t0, t0 + 0.12, 150, p.wood, shade(p.wood, 0.1)),
    );
    for (let i = 0; i < 3; i++) {
      const x = c.vp[0] - 260 + i * 260;
      out.push(poly(c.floorBox(x - 60, x + 60, t0 + 0.04, t0 + 0.045, 235).front, '#1A1C22'));
      out.push(chair(ctx, x, t0 + 0.14, 'front', p.fabric2));
    }
  }
  out.push(plant(ctx, c.bw.x1 - 80, 0.1, 1.2));
  for (let i = 0; i < 3; i++) out.push(pendant(ctx, c.vp[0] - 300 + i * 300, 0.15, 'cone'));
  void r;
  return out.join('');
}

function retail(ctx: Ctx) {
  const { c, s, p, r } = ctx;
  const out: string[] = [];
  out.push(shelfUnit(ctx, c.bw.x0 + 30, c.bw.x1 - 30, c.bw.y0 + 40, c.bw.y1, 0.05));
  // counter
  out.push(
    shaded(ctx, c.floorBox(c.vp[0] - 260, c.vp[0] + 260, 0.3, 0.42, 190), p.woodDark, {
      topFill: marbleFill(s, p.counter, r, shade(p.counter, -0.1)),
    }),
  );
  // display tables
  out.push(table(ctx, c.bw.x0 - 200, c.bw.x0 + 140, 0.3, 0.45, 140, p.wood));
  out.push(table(ctx, c.bw.x1 - 140, c.bw.x1 + 200, 0.3, 0.45, 140, p.wood));
  for (let i = 0; i < 5; i++)
    out.push(pendant(ctx, c.bw.x0 + 60 + i * 200, 0.1 + (i % 2) * 0.12, 'cone'));
  out.push(plant(ctx, c.bw.x1 + 80, 0.55, 1.2));
  return out.join('');
}

function restaurant(ctx: Ctx) {
  const { c, s, p, r } = ctx;
  const out: string[] = [];
  out.push(
    poly(
      c.backWall(),
      p.patternWall === 'brick' ? brickFill(s, p.accent, shade(p.accent, 0.2)) : p.accent,
    ),
  );
  out.push(artFrame(ctx, c.vp[0] - 300, c.bw.y0 + 100, 600, 260));
  // banquette along one side
  out.push(sofa(ctx, c.bw.x0 - 60, c.bw.x0 + 260, 0.05, 0.62, p.fabric2));
  // tables and chairs
  for (let i = 0; i < 3; i++) {
    const t0 = 0.08 + i * 0.2;
    out.push(
      table(
        ctx,
        c.bw.x0 + 300,
        c.bw.x0 + 460,
        t0,
        t0 + 0.1,
        150,
        p.wood,
        marbleFill(s, p.counter, r),
      ),
    );
    out.push(chair(ctx, c.bw.x0 + 540, t0 + 0.03, 'back', p.woodDark));
  }
  for (let i = 0; i < 2; i++) {
    const t0 = 0.12 + i * 0.28;
    out.push(
      table(
        ctx,
        c.vp[0] + 120,
        c.vp[0] + 380,
        t0,
        t0 + 0.12,
        150,
        p.wood,
        marbleFill(s, p.counter, r),
      ),
    );
    out.push(chair(ctx, c.vp[0] + 60, t0 + 0.04, 'back', p.woodDark));
    out.push(chair(ctx, c.vp[0] + 440, t0 + 0.04, 'back', p.woodDark));
  }
  for (let i = 0; i < 4; i++)
    out.push(pendant(ctx, c.bw.x0 + 380 + (i % 2) * 460, 0.12 + Math.floor(i / 2) * 0.28, 'dome'));
  out.push(plant(ctx, c.bw.x1 + 60, 0.5, 1.3));
  return out.join('');
}

/* ------------------------------------------------------------------------ */
/*  Room recipes                                                             */
/* ------------------------------------------------------------------------ */

function living(ctx: Ctx) {
  const { c, r, p } = ctx;
  const out: string[] = [];
  if (r.chance(0.6)) out.push(coveLight(ctx));
  // feature wall behind the sofa: fluted panel, paint block or art
  const feature = r.pick(['fluted', 'block', 'art', 'tv'] as const);
  if (feature === 'fluted')
    out.push(
      poly(
        c.onBack(c.vp[0] - 460, c.bw.y0 + 40, c.vp[0] + 460, c.bw.y1),
        flutedFill(ctx.s, p.wood),
      ),
    );
  else if (feature === 'block')
    out.push(
      poly(c.onBack(c.vp[0] - 500, c.bw.y0, c.vp[0] + 500, c.bw.y1), p.accent, 'opacity="0.9"'),
    );
  if (feature === 'tv') out.push(tvUnit(ctx));
  else if (feature !== 'fluted') out.push(artFrame(ctx, c.vp[0] - 240, c.bw.y0 + 110, 480, 230));
  out.push(
    rug(
      ctx,
      c.vp[0] - 560,
      c.vp[0] + 560,
      0.0,
      0.62,
      shade(p.floor, p.floorKind === 'wood' ? 0.15 : -0.1),
      r.pick(['plain', 'stripe', 'kilim'] as const),
    ),
  );
  if (feature === 'tv') {
    // sofa in the foreground facing the TV wall; coffee table between
    out.push(table(ctx, c.vp[0] - 180, c.vp[0] + 180, 0.22, 0.36, 95, p.wood));
    out.push(sofa(ctx, c.vp[0] - 420, c.vp[0] + 420, 0.5, 0.68, p.fabric));
  } else {
    out.push(sofa(ctx, c.vp[0] - 420, c.vp[0] + 420, 0.03, 0.2, p.fabric));
    out.push(
      table(
        ctx,
        c.vp[0] - 180,
        c.vp[0] + 180,
        0.32,
        0.46,
        95,
        p.wood,
        r.chance(0.5)
          ? marbleFill(ctx.s, p.counter === '#1C1C1E' ? '#F2F0EA' : p.counter, r)
          : undefined,
      ),
    );
  }
  // side table + plant on the side away from the window
  const sideX = ctx.window === 'left' ? c.bw.x1 + 60 : c.bw.x0 - 60;
  out.push(table(ctx, sideX - 70, sideX + 70, 0.06, 0.16, 120, p.woodDark));
  out.push(plant(ctx, ctx.window === 'left' ? c.bw.x1 + 250 : c.bw.x0 - 250, 0.25, 1.3));
  if (r.chance(0.6))
    out.push(floorLamp(ctx, ctx.window === 'left' ? c.bw.x0 - 120 : c.bw.x1 + 120, 0.12));
  if (r.chance(0.5)) out.push(pendant(ctx, c.vp[0] + 80, 0.3, r.pick(['dome', 'globe'] as const)));
  return out.join('');
}

function bedroom(ctx: Ctx) {
  const { c, r, p } = ctx;
  const out: string[] = [];
  const kids = ctx.roomType === 'kids-room';
  if (kids)
    out.push(
      poly(
        c.backWall(),
        p.patternWall === 'clouds' || r.chance(0.5)
          ? cloudsFill(ctx.s, mix(p.accent, '#DCE6EE', 0.5))
          : stripeFill(ctx.s, shade(p.accent, 0.08), shade(p.accent, 0.16), 140),
      ),
    );
  else if (
    p.patternWall === 'botanical' ||
    (r.chance(0.25) && ['bohemian', 'coastal'].includes(ctx.style))
  )
    out.push(poly(c.backWall(), botanicalFill(ctx.s, shade(p.wall, 0.02), p.plant)));
  else if (p.patternWall === 'blockprint' && r.chance(0.5))
    out.push(poly(c.backWall(), blockprintFill(ctx.s, shade(p.wall, 0.02), p.accent)));
  else out.push(poly(c.backWall(), p.accent, 'opacity="0.9"'));
  if (r.chance(0.5)) out.push(coveLight(ctx));
  out.push(headboardPanel(ctx, c.vp[0] - 330, c.vp[0] + 330, c.bw.y0 + 200));
  out.push(wardrobe(ctx, ctx.window === 'left' ? 'right' : 'left', 0.02, 0.44));
  out.push(rug(ctx, c.vp[0] - 500, c.vp[0] + 500, 0.36, 0.7, shade(p.floor, 0.12), 'plain'));
  out.push(bed(ctx, c.vp[0] - 300, c.vp[0] + 300, 0.02, 0.4));
  if (kids) {
    // desk under window / study side
    const dx = ctx.window === 'left' ? c.bw.x0 - 260 : c.bw.x1 + 60;
    out.push(table(ctx, dx, dx + 200, 0.3, 0.45, 150, p.wood));
    out.push(chair(ctx, dx + 100, 0.5, 'back', p.fabric2));
    out.push(shelfUnit(ctx, c.bw.x0 + 30, c.bw.x0 + 200, c.bw.y0 + 60, c.bw.y0 + 340, 0.05));
  } else {
    if (r.chance(0.6)) out.push(artFrame(ctx, c.vp[0] - 160, c.bw.y0 + 40, 320, 150));
    if (r.chance(0.5))
      out.push(plant(ctx, ctx.window === 'left' ? c.bw.x1 + 20 : c.bw.x0 - 20, 0.12, 1.0));
  }
  if (r.chance(0.4)) out.push(pendant(ctx, c.vp[0] + 120, 0.2, 'globe'));
  return out.join('');
}

function kitchen(ctx: Ctx) {
  const { c, r, p } = ctx;
  const out: string[] = [];
  const layout = r.pick(['L', 'L', 'back', 'left'] as const);
  out.push(kitchenRun(ctx, layout === 'left' ? 'L' : layout));
  if (r.chance(0.5)) {
    // island
    out.push(
      shaded(ctx, c.floorBox(c.vp[0] - 260, c.vp[0] + 260, 0.38, 0.52, 190), p.lower, {
        topFill: p.counter.startsWith('#1') ? p.counter : marbleFill(ctx.s, p.counter, r),
      }),
    );
    out.push(chair(ctx, c.vp[0] - 120, 0.56, 'front', p.wood));
    out.push(chair(ctx, c.vp[0] + 120, 0.56, 'front', p.wood));
    for (let i = 0; i < 3; i++) out.push(pendant(ctx, c.vp[0] - 180 + i * 180, 0.45, 'cone'));
  }
  out.push(plantSmall(ctx, c.bw.x1 - 60, c.bw.y1 - 140, 0.06));
  return out.join('');
}

function dining(ctx: Ctx) {
  const { c, r, p } = ctx;
  const out: string[] = [];
  out.push(
    poly(
      c.backWall(),
      p.patternWall === 'fluted' ? flutedFill(ctx.s, p.wood) : p.accent,
      'opacity="0.92"',
    ),
  );
  // crockery unit
  out.push(shelfUnit(ctx, c.bw.x0 + 60, c.bw.x0 + 400, c.bw.y0 + 120, c.bw.y1, 0.06));
  if (r.chance(0.7)) out.push(artFrame(ctx, c.vp[0] + 40, c.bw.y0 + 110, 440, 240));
  out.push(rug(ctx, c.vp[0] - 520, c.vp[0] + 520, 0.15, 0.72, shade(p.floor, -0.08), 'plain'));
  out.push(
    table(
      ctx,
      c.vp[0] - 260,
      c.vp[0] + 260,
      0.22,
      0.46,
      135,
      p.woodDark,
      r.chance(0.5) ? marbleFill(ctx.s, '#F2F0EA', r) : undefined,
    ),
  );
  for (let i = 0; i < 3; i++)
    out.push(chair(ctx, c.vp[0] - 180 + i * 180, 0.15, 'back', p.fabric2));
  for (let i = 0; i < 2; i++)
    out.push(chair(ctx, c.vp[0] - 100 + i * 200, 0.49, 'front', p.fabric2));
  out.push(pendant(ctx, c.vp[0], 0.4, 'dome'));
  out.push(plant(ctx, c.bw.x1 + 40, 0.15, 1.1));
  return out.join('');
}

function study(ctx: Ctx) {
  const { c, r, p } = ctx;
  const out: string[] = [];
  out.push(shelfUnit(ctx, c.bw.x0 + 40, c.bw.x1 - 40, c.bw.y0 + 60, c.bw.y0 + 380, 0.05));
  out.push(
    poly(c.onBack(c.bw.x0 + 40, c.bw.y0 + 380, c.bw.x1 - 40, c.bw.y1), p.accent, 'opacity="0.9"'),
  );
  out.push(table(ctx, c.vp[0] - 380, c.vp[0] + 380, 0.08, 0.2, 150, p.wood, shade(p.wood, 0.08)));
  out.push(poly(c.floorBox(c.vp[0] - 120, c.vp[0] + 120, 0.11, 0.115, 240).front, '#1A1C22'));
  out.push(chair(ctx, c.vp[0], 0.24, 'front', p.fabric2));
  out.push(rug(ctx, c.vp[0] - 460, c.vp[0] + 460, 0.05, 0.6, shade(p.floor, 0.1)));
  out.push(plant(ctx, ctx.window === 'left' ? c.bw.x1 + 20 : c.bw.x0 - 20, 0.1, 1.1));
  if (r.chance(0.5))
    out.push(floorLamp(ctx, ctx.window === 'left' ? c.bw.x1 + 200 : c.bw.x0 - 200, 0.35));
  return out.join('');
}

function utility(ctx: Ctx) {
  const { c, p, r } = ctx;
  const out: string[] = [];
  out.push(
    poly(
      c.onBack(c.bw.x0, c.bw.y0 + 320, c.bw.x1, c.bw.y1),
      tileFill(ctx.s, shade(p.wall, 0.02), 120, shade(p.wall, -0.12), 3),
    ),
  );
  out.push(shelfUnit(ctx, c.bw.x0 + 40, c.bw.x1 - 40, c.bw.y0 + 60, c.bw.y0 + 300, 0.05));
  // washing machine + counter
  const wm = c.wallBox(c.vp[0] - 140, c.bw.y1 - 260, c.vp[0] + 140, c.bw.y1, 0.1);
  out.push(poly(wm.side, '#D9D9D6'));
  out.push(poly(wm.front, '#F0F0EE'));
  const door = c.toward([c.vp[0], c.bw.y1 - 130], 0.1);
  out.push(
    `<circle cx="${f(door[0])}" cy="${f(door[1])}" r="90" fill="#2B2B2D"/><circle cx="${f(door[0])}" cy="${f(door[1])}" r="70" fill="#5A6470"/>`,
  );
  out.push(
    poly(c.wallBox(c.vp[0] + 150, c.bw.y1 - 260, c.bw.x1 - 40, c.bw.y1, 0.1).front, p.lower),
  );
  out.push(
    poly(
      [
        [c.vp[0] - 140, c.bw.y1 - 270],
        [c.bw.x1 - 40, c.bw.y1 - 270],
        c.toward([c.bw.x1 - 40, c.bw.y1 - 270], 0.1),
        c.toward([c.vp[0] - 140, c.bw.y1 - 270], 0.1),
      ],
      p.counter.startsWith('#1') ? p.counter : shade(p.counter, -0.05),
    ),
  );
  void r;
  return out.join('');
}

function beforeRoom(ctx: Ctx) {
  const { c, s, r, p } = ctx;
  const out: string[] = [];
  // damp patches, old switchboard, hanging wire + bulb, ceiling fan
  for (let i = 0; i < 4; i++) {
    const x = r.range(c.bw.x0, c.bw.x1);
    const y = r.range(c.bw.y0, c.bw.y1);
    out.push(
      ell(
        x,
        y,
        r.range(60, 180),
        r.range(40, 120),
        withAlpha('#6E6A5E', 0.18),
        `filter="${s.blur(30)}"`,
      ),
    );
  }
  const wallP = r.chance(0.5) ? c.leftWall() : c.rightWall();
  const clip = s.clip(wallP);
  out.push(
    `<g clip-path="${clip}">${ell(r.range(100, W - 100), r.range(200, 900), 220, 160, withAlpha('#5C5648', 0.2), `filter="${s.blur(40)}"`)}</g>`,
  );
  out.push(
    poly(
      c.onBack(c.bw.x0 + 80, c.bw.y0 + 200, c.bw.x0 + 150, c.bw.y0 + 260),
      '#D6D1C4',
      'stroke="#9A958A" stroke-width="3"',
    ),
  );
  const bulb: Pt = [c.vp[0] + 60, c.bw.y0 - 40];
  out.push(line(c.toward([c.vp[0] + 60, c.bw.y0], 0.3), [bulb[0], bulb[1] + 240], '#333', 3));
  out.push(ell(bulb[0], bulb[1] + 270, 26, 34, '#F3EBCF'));
  // fan
  const fc = c.toward([c.vp[0], c.bw.y0], 0.45);
  out.push(line(fc, [fc[0], fc[1] + 60], '#6B6B6B', 8));
  out.push(ell(fc[0], fc[1] + 70, 30, 12, '#8A8A8A'));
  for (const a of [0, 120, 240])
    out.push(
      `<rect x="${f(fc[0])}" y="${f(fc[1] + 62)}" width="260" height="16" fill="#8A8A8A" transform="rotate(${a} ${f(fc[0])} ${f(fc[1] + 70)}) scale(1 0.35)" transform-origin="${f(fc[0])} ${f(fc[1] + 70)}"/>`,
    );
  // old cabinet or stacked boxes
  if (r.chance(0.6))
    out.push(shaded(ctx, c.floorBox(c.bw.x0 + 60, c.bw.x0 + 300, 0.05, 0.2, 260), '#8B7355'));
  if (r.chance(0.6))
    out.push(shaded(ctx, c.floorBox(c.bw.x1 - 260, c.bw.x1 - 40, 0.1, 0.22, 140), '#B39B78'));
  // floor stains
  const fclip = s.clip(c.floor());
  out.push(
    `<g clip-path="${fclip}">${ell(r.range(400, 1600), r.range(1000, 1300), 200, 60, withAlpha('#4A4538', 0.15), `filter="${s.blur(24)}"`)}</g>`,
  );
  void p;
  return out.join('');
}

const RECIPES: Record<string, (ctx: Ctx) => string> = {
  living,
  dining,
  kitchen,
  study,
  utility,
  foyer,
  balcony,
  office,
  retail,
  restaurant,
  'master-bedroom': bedroom,
  bedroom,
  'kids-room': bedroom,
  'parents-room': bedroom,
  'guest-room': bedroom,
  pooja: poojaRoom,
  bathroom,
  terrace: balcony,
  courtyard: balcony,
  clinic: office,
  reception: retail,
  'living-room': living,
  'dining-room': dining,
  'modular-kitchen': kitchen,
  'study-home-office': study,
  'pooja-room': poojaRoom,
  'foyer-entrance': foyer,
  'utility-laundry': utility,
  'courtyard-aangan': balcony,
  'restaurant-cafe': restaurant,
  'full-home': living,
  wardrobe: bedroom,
};

/* ------------------------------------------------------------------------ */
/*  Public API                                                               */
/* ------------------------------------------------------------------------ */

export function renderRoomScene(spec: SceneSpec): string {
  uid = 0;
  const r = rng(`${spec.id}`);
  const variant = spec.variant ?? 0;
  const roomType = spec.roomType;
  // camera
  const vx = W / 2 + r.jitter(140) + ((variant % 3) - 1) * 60;
  const vy = 600 + r.jitter(50);
  const half = spec.hero ? 520 : r.range(400, 480);
  const bw = { x0: vx - half, y0: vy - half * 0.7, x1: vx + half, y1: vy + half * 0.62 };
  const c = new Cam([vx, vy], bw, spec.hero ? 2.4 : 2.2);
  const s = new Svg();
  const before = !!spec.before;
  const p = before ? BEFORE : paletteFor(spec.style, spec.id);
  const windowSide: Side = ['kitchen', 'modular-kitchen', 'utility', 'utility-laundry'].includes(
    roomType,
  )
    ? r.pick(['back', 'left', 'right'] as const)
    : ['pooja', 'pooja-room', 'foyer', 'foyer-entrance'].includes(roomType)
      ? r.pick(['none', 'left'] as const)
      : ['balcony', 'terrace', 'courtyard', 'courtyard-aangan'].includes(roomType)
        ? 'none'
        : r.pick(['left', 'right', 'left', 'right', 'back'] as const);
  const light: Pt =
    windowSide === 'left' ? [-0.7, -0.3] : windowSide === 'right' ? [0.7, -0.3] : [0, -0.8];
  const ctx: Ctx = { s, c, p, r, light, window: windowSide, before, roomType, style: spec.style };

  drawShell(ctx);
  drawWindow(ctx);
  if (before) s.add(beforeRoom(ctx));
  else s.add((RECIPES[roomType] ?? living)(ctx));
  drawAO(ctx);
  drawVignetteAndGrain(s, before ? 0.5 : spec.hero ? 0.42 : 0.32);
  return s.toString();
}

/* ------------------------------------------------------------------------ */
/*  Template scenes (exact geometry from src/data/demo/roomTemplates.ts)      */
/* ------------------------------------------------------------------------ */

export interface TemplateSurfaceLike {
  id: string;
  surfaceType: string;
  polygon: Pt[];
  baseHex: string;
  z: number;
  defaultMaterialSlug?: string;
}
export interface TemplateLike {
  slug: string;
  roomType: string;
  style: string;
  lightDirection: [number, number];
  window?: Pt[];
  surfaces: TemplateSurfaceLike[];
}

export function renderTemplateScene(t: TemplateLike): string {
  uid = 0;
  const r = rng(`template:${t.slug}`);
  const s = new Svg();
  const c = new Cam([1000, 620], { x0: 560, y0: 300, x1: 1440, y1: 900 }, 2.2);
  const p = paletteFor(t.style, `template:${t.slug}`);
  const light = t.lightDirection;
  const surfaces = [...t.surfaces].sort((a, b) => a.z - b.z);

  const fillFor = (sf: TemplateSurfaceLike): string => {
    const slug = sf.defaultMaterialSlug ?? '';
    const base = sf.baseHex;
    if (slug.startsWith('veneer-fluted') || sf.id === 'panel') return flutedFill(s, base, 40);
    if (slug.includes('subway')) return subwayFill(s, base, shade(base, -0.1));
    if (slug.startsWith('marble') || slug.includes('carrara') || slug.includes('quartz'))
      return marbleFill(s, base, r, shade(base, -0.18));
    if (slug.startsWith('vitrified') || slug.startsWith('ceramic'))
      return tileFill(s, base, sf.surfaceType === 'FLOOR' ? 140 : 100, shade(base, -0.1), 3);
    if (
      slug.startsWith('wood') ||
      slug.startsWith('laminate') ||
      slug.startsWith('veneer') ||
      slug.includes('butcher')
    )
      return woodFill(s, base, r, sf.surfaceType !== 'FLOOR', 1.3);
    if (slug.startsWith('fabric') || slug.startsWith('curtain')) return fabricFill(s, base);
    if (slug.startsWith('wallpaper')) return cloudsFill(s, base);
    if (slug.startsWith('granite')) return terrazzoFill(s, base, r);
    if (sf.id === 'jaali') return jaaliFill(s, base, '#FFF3D6');
    if (sf.id === 'mirror')
      return s.grad(
        [0, 0],
        [W, H],
        [
          [0, '#D9E0E4'],
          [0.5, '#EEF2F4'],
          [1, '#C4CCD1'],
        ],
      );
    return base;
  };

  for (const sf of surfaces) {
    const fill = fillFor(sf);
    s.add(poly(sf.polygon, fill));
    // directional shading per surface type
    const dim = (a: number) => withAlpha('#000000', a);
    if (sf.surfaceType === 'CEILING')
      s.add(
        poly(
          sf.polygon,
          s.grad(
            [0, 0],
            [0, 300],
            [
              [0, dim(0.02)],
              [1, dim(0.12)],
            ],
          ),
        ),
      );
    if (sf.id === 'wall-left')
      s.add(
        poly(
          sf.polygon,
          s.grad(
            [0, 0],
            [560, 0],
            [
              [0, dim(light[0] > 0 ? 0.02 : 0.14)],
              [1, dim(light[0] > 0 ? 0 : 0.06)],
            ],
          ),
        ),
      );
    if (sf.id === 'wall-right')
      s.add(
        poly(
          sf.polygon,
          s.grad(
            [W, 0],
            [1440, 0],
            [
              [0, dim(light[0] < 0 ? 0.02 : 0.14)],
              [1, dim(light[0] < 0 ? 0 : 0.06)],
            ],
          ),
        ),
      );
    if (sf.surfaceType === 'FLOOR')
      s.add(
        poly(
          sf.polygon,
          s.radial(light[0] < 0 ? 0 : light[0] > 0 ? W : W / 2, H, W * 0.8, [
            [0, withAlpha(p.light, 0.3)],
            [1, withAlpha(p.light, 0)],
          ]),
        ),
      );
    if (['CABINET_LOWER', 'CABINET_UPPER', 'WARDROBE', 'DOOR'].includes(sf.surfaceType)) {
      // seams
      const [a, b, cc, d] = sf.polygon as [Pt, Pt, Pt, Pt];
      if (sf.polygon.length === 4) {
        const n = sf.surfaceType === 'DOOR' ? 1 : 4;
        for (let i = 1; i < n; i++) {
          const u = i / n;
          s.add(
            line(
              [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u],
              [d[0] + (cc[0] - d[0]) * u, d[1] + (cc[1] - d[1]) * u],
              dim(0.25),
              2.5,
            ),
          );
        }
      }
      s.add(
        poly(
          sf.polygon,
          s.grad(
            [0, a[1]],
            [0, d[1]],
            [
              [0, dim(0)],
              [1, dim(0.1)],
            ],
          ),
        ),
      );
    }
    if (sf.surfaceType === 'COUNTERTOP')
      s.add(
        `<polygon points="${pts(sf.polygon)}" fill="none" stroke="${withAlpha('#ffffff', 0.35)}" stroke-width="3"/>`,
      );
    if (sf.surfaceType === 'UPHOLSTERY' || sf.surfaceType === 'RUG')
      s.add(
        poly(
          sf.polygon,
          s.grad(
            [0, sf.polygon[0]![1]],
            [0, sf.polygon[2]![1]],
            [
              [0, withAlpha('#ffffff', 0.08)],
              [1, dim(0.12)],
            ],
          ),
        ),
      );
  }
  // window glow
  if (t.window) {
    s.add(
      poly(
        t.window,
        s.grad(
          [0, 0],
          [0, H],
          [
            [0, '#FFFFFF'],
            [0.6, mix(p.light, '#CFE3F2', 0.5)],
            [1, shade(p.light, -0.04)],
          ],
        ),
        `stroke="${shade(p.wall, -0.25)}" stroke-width="10"`,
      ),
    );
    const [a, b, cc, d] = t.window as [Pt, Pt, Pt, Pt];
    s.add(
      line(
        [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
        [(cc[0] + d[0]) / 2, (cc[1] + d[1]) / 2],
        shade(p.wall, -0.25),
        6,
      ),
    );
    s.add(
      line(
        [(a[0] + d[0]) / 2, (a[1] + d[1]) / 2],
        [(b[0] + cc[0]) / 2, (b[1] + cc[1]) / 2],
        shade(p.wall, -0.25),
        6,
      ),
    );
    const floorPoly = surfaces.find((x) => x.surfaceType === 'FLOOR')?.polygon ?? c.floor();
    const clip = s.clip(floorPoly);
    const bx = light[0] < 0 ? 200 : light[0] > 0 ? W - 200 : W / 2;
    s.add(
      `<g clip-path="${clip}">${ell(bx, 1150, 700, 260, withAlpha(p.light, 0.3), `filter="${s.blur(50)}"`)}</g>`,
    );
  }
  // AO at back-wall/floor junction and corners
  const z = withAlpha('#000000', 0);
  s.add(
    poly(
      [[560, 900], [1440, 900], c.fp(1640, 0.08), c.fp(360, 0.08)],
      s.grad(
        [0, 900],
        [0, 960],
        [
          [0, withAlpha('#000000', 0.2)],
          [1, z],
        ],
      ),
    ),
  );
  s.add(
    poly(
      [
        [560, 300],
        [560, 900],
        [610, 900],
        [610, 300],
      ],
      s.grad(
        [560, 0],
        [610, 0],
        [
          [0, withAlpha('#000000', 0.12)],
          [1, z],
        ],
      ),
    ),
  );
  s.add(
    poly(
      [
        [1440, 300],
        [1440, 900],
        [1390, 900],
        [1390, 300],
      ],
      s.grad(
        [1440, 0],
        [1390, 0],
        [
          [0, withAlpha('#000000', 0.12)],
          [1, z],
        ],
      ),
    ),
  );
  drawVignetteAndGrain(s, 0.3);
  return s.toString();
}

/** Mask: white polygon on black, exact template size. */
export function renderMaskSvg(polygon: Pt[]): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#000"/><polygon points="${pts(polygon)}" fill="#fff"/></svg>`;
}

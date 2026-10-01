/** Small colour helpers for the generators (hex in / hex out). */
import { formatHex, oklch, parse, type Oklch } from 'culori';

export function toOklch(hex: string): Oklch {
  const c = oklch(parse(hex) ?? parse('#888888'));
  return { mode: 'oklch', l: c?.l ?? 0.5, c: c?.c ?? 0, h: c?.h ?? 0 };
}

export function hex(c: Oklch): string {
  return formatHex({ ...c, l: Math.min(1, Math.max(0, c.l)), c: Math.max(0, c.c) }) ?? '#888888';
}

/** Lighten/darken by delta in OKLCH L (−1..1). */
export function shade(hexIn: string, dl: number, dc = 0): string {
  const c = toOklch(hexIn);
  return hex({ ...c, l: c.l + dl, c: c.c + dc });
}

export function withAlpha(hexIn: string, a: number): string {
  let h = hexIn.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((ch) => ch + ch)
      .join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/** Mix two hex colours in OKLCH, t∈[0,1]. */
export function mix(a: string, b: string, t: number): string {
  const A = toOklch(a);
  const B = toOklch(b);
  const dh = (((B.h ?? 0) - (A.h ?? 0) + 540) % 360) - 180;
  return hex({
    mode: 'oklch',
    l: A.l + (B.l - A.l) * t,
    c: A.c + (B.c - A.c) * t,
    h: ((A.h ?? 0) + dh * t + 360) % 360,
  });
}

/** Warm-shift for lighting: pushes hue toward 70° and adds chroma slightly. */
export function warm(hexIn: string, amt: number): string {
  return mix(hexIn, '#F2C48D', amt);
}
export function cool(hexIn: string, amt: number): string {
  return mix(hexIn, '#9FB3C8', amt);
}

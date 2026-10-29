/** sharp pipeline: SVG string → master PNG buffer → AVIF/WebP derivatives + blurhash. */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { encode as encodeBlurhash } from 'blurhash';
import sharp from 'sharp';

export const WIDTHS = [400, 800, 1200, 2000] as const;
export type Width = (typeof WIDTHS)[number];

export interface EncodeResult {
  width: number;
  height: number;
  blurHash: string;
  palette: string[];
}

export interface EncodeOptions {
  /** Apply the "before" look: desaturate, flatten contrast, cool tint. */
  before?: boolean;
  /** Only write these widths (default all). */
  widths?: readonly Width[];
  /** Skip files that already exist. */
  skipExisting?: boolean;
  quality?: { avif?: number; webp?: number };
}

export function ensureDir(p: string) {
  mkdirSync(dirname(p), { recursive: true });
}

export function outputsExist(basePath: string, widths: readonly Width[] = WIDTHS): boolean {
  return widths.every(
    (w) => existsSync(`${basePath}-${w}.webp`) && existsSync(`${basePath}-${w}.avif`),
  );
}

export async function rasterise(svg: string, width: number, density = 72): Promise<Buffer> {
  return sharp(Buffer.from(svg), { density }).resize({ width }).png().toBuffer();
}

export async function blurhashOf(master: Buffer): Promise<string> {
  const { data, info } = await sharp(master)
    .resize(32, 32, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return encodeBlurhash(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}

export async function paletteOf(master: Buffer, n = 5): Promise<string[]> {
  const { data, info } = await sharp(master)
    .resize(24, 24, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // simple quantisation to 4 bits/channel, count, take top-n distinct
  const counts = new Map<number, number>();
  for (let i = 0; i < info.width * info.height * 3; i += 3) {
    const key = ((data[i]! >> 4) << 8) | ((data[i + 1]! >> 4) << 4) | (data[i + 2]! >> 4);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => {
      const r = ((k >> 8) & 15) * 17;
      const g = ((k >> 4) & 15) * 17;
      const b = (k & 15) * 17;
      return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    });
}

/**
 * Encode an SVG to `${basePath}-${w}.{avif,webp}` for each width.
 * Returns dimensions of the master and a blurhash.
 */
export async function encodeSvg(
  svg: string,
  basePath: string,
  opts: EncodeOptions = {},
): Promise<EncodeResult> {
  const widths = opts.widths ?? WIDTHS;
  ensureDir(basePath);
  const maxW = Math.max(...widths);
  let master = sharp(Buffer.from(svg), { density: 72 }).resize({ width: maxW });
  if (opts.before) {
    master = master
      .modulate({ saturation: 0.55, brightness: 0.94 })
      .linear(0.86, 12)
      .tint({ r: 235, g: 232, b: 225 });
  }
  const masterPng = await master.png().toBuffer();
  const meta = await sharp(masterPng).metadata();
  const [blurHash, palette] = await Promise.all([blurhashOf(masterPng), paletteOf(masterPng)]);

  await Promise.all(
    widths.flatMap((w) => {
      const base = sharp(masterPng).resize({ width: w, withoutEnlargement: true });
      const jobs: Promise<unknown>[] = [];
      const webpPath = `${basePath}-${w}.webp`;
      const avifPath = `${basePath}-${w}.avif`;
      if (!(opts.skipExisting && existsSync(webpPath)))
        jobs.push(
          base
            .clone()
            .webp({ quality: opts.quality?.webp ?? 78, effort: 4 })
            .toFile(webpPath),
        );
      if (!(opts.skipExisting && existsSync(avifPath)))
        jobs.push(
          base
            .clone()
            .avif({ quality: opts.quality?.avif ?? 52, effort: 3 })
            .toFile(avifPath),
        );
      return jobs;
    }),
  );
  return {
    width: meta.width ?? maxW,
    height: meta.height ?? Math.round(maxW / 1.5),
    blurHash,
    palette,
  };
}

/**
 * Turn a white-on-black greyscale image into a white PNG whose alpha channel carries the mask.
 * CSS `mask-image` reads alpha (luminance masks are not portable to Safari), so shipped masks are alpha masks.
 */
export async function greyToAlphaPng(input: Buffer | string): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .greyscale()
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4, 255);
  for (let i = 0; i < data.length; i++) rgba[i * 4 + 3] = data[i] ?? 0;
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Write an alpha PNG mask from an SVG (white shape on black). */
export async function encodeMask(svg: string, outPath: string, feather = 2): Promise<void> {
  ensureDir(outPath);
  let img = sharp(Buffer.from(svg), { density: 72 }).greyscale();
  if (feather > 0) img = img.blur(feather);
  const grey = await img.png().toBuffer();
  writeFileSync(outPath, await greyToAlphaPng(grey));
}

export function writeText(path: string, text: string) {
  ensureDir(path);
  writeFileSync(path, text, 'utf8');
}

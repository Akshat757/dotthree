/**
 * Renders the brand monogram to every PNG/ICO/SVG icon the site references:
 *   public/icons/generated/{icon-192,icon-512,maskable-512,apple-touch-180}.png
 *   public/icons/generated/favicon-32.png
 *   public/favicon.ico  (32px PNG payload — all modern browsers accept this)
 *   public/icon.svg
 *
 * Run: npm run assets:icons
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

const INK = '#111111';
const CANVAS = '#ffffff';

/** The studio's circle mark (ring, hole, dot) on a 100-unit grid — keep in sync with LogoMark in layout/primitives.tsx. */
const MARK_PATH = [
  'M0 50a50 50 0 1 0 100 0a50 50 0 1 0-100 0Z',
  'M17 66.7a33.2 33.2 0 1 0 66.4 0a33.2 33.2 0 1 0-66.4 0Z',
  'M17 66.5a16.5 16.5 0 1 0 33 0a16.5 16.5 0 1 0-33 0Z',
].join('');

/** `pad` = fraction of the canvas kept as safe margin (maskable icons need ≥10%). */
function monogramSvg(size: number, pad = 0, rounded = true): string {
  const inset = size * pad;
  const inner = size - inset * 2;
  const r = rounded ? inner * 0.19 : 0;
  const markSize = inner * 0.72;
  const offset = inset + (inner - markSize) / 2;
  const s = markSize / 100;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${pad > 0 ? `<rect width="${size}" height="${size}" fill="${CANVAS}"/>` : ''}
  <rect x="${inset}" y="${inset}" width="${inner}" height="${inner}" rx="${r}" fill="${CANVAS}"/>
  <path transform="translate(${offset.toFixed(2)} ${offset.toFixed(2)}) scale(${s.toFixed(4)})" d="${MARK_PATH}" fill="${INK}" fill-rule="evenodd"/>
</svg>`;
}

async function png(svg: string, dest: string) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(dest);
}

async function main() {
  const root = process.cwd();
  const gen = join(root, 'public', 'icons', 'generated');
  mkdirSync(gen, { recursive: true });

  await png(monogramSvg(192), join(gen, 'icon-192.png'));
  await png(monogramSvg(512), join(gen, 'icon-512.png'));
  await png(monogramSvg(512, 0.12, false), join(gen, 'maskable-512.png'));
  await png(monogramSvg(180), join(gen, 'apple-touch-180.png'));
  await png(monogramSvg(32), join(gen, 'favicon-32.png'));

  // favicon.ico: browsers accept a PNG byte stream under the .ico name.
  const fav = await sharp(Buffer.from(monogramSvg(32)))
    .png()
    .toBuffer();
  writeFileSync(join(root, 'public', 'favicon.ico'), fav);
  writeFileSync(join(root, 'public', 'icon.svg'), monogramSvg(32));

  console.log('✔ icons → public/icons/generated, public/favicon.ico, public/icon.svg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

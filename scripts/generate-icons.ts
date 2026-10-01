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

const ACCENT = '#b5643c';
const CANVAS = '#fbf9f6';

/** `pad` = fraction of the canvas kept as safe margin (maskable icons need ≥10%). */
function monogramSvg(size: number, pad = 0, rounded = true): string {
  const inset = size * pad;
  const inner = size - inset * 2;
  const r = rounded ? inner * 0.19 : 0;
  const s = inner / 32; // scale from the 32-unit logo grid
  const tx = (v: number) => (inset + v * s).toFixed(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${pad > 0 ? `<rect width="${size}" height="${size}" fill="${ACCENT}"/>` : ''}
  <rect x="${inset}" y="${inset}" width="${inner}" height="${inner}" rx="${r}" fill="${ACCENT}"/>
  <path d="M${tx(8)} ${tx(24)} ${tx(16)} ${tx(8)} ${tx(24)} ${tx(24)} M${tx(11.5)} ${tx(18)} H${tx(20.5)}"
        stroke="${CANVAS}" stroke-width="${(2.2 * s).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
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
  const fav = await sharp(Buffer.from(monogramSvg(32))).png().toBuffer();
  writeFileSync(join(root, 'public', 'favicon.ico'), fav);
  writeFileSync(join(root, 'public', 'icon.svg'), monogramSvg(32));

  console.log('✔ icons → public/icons/generated, public/favicon.ico, public/icon.svg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

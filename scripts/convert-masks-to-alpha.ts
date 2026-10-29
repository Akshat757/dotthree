/**
 * One-off: convert existing luminance masks (opaque white-on-black) to alpha masks.
 * Safe to re-run — masks that already carry transparency are skipped.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

import { greyToAlphaPng } from './lib/encode';

const ROOT = join(process.cwd(), 'public', 'demo', 'templates');

async function main() {
  let converted = 0;
  let skipped = 0;
  for (const dir of readdirSync(ROOT)) {
    const full = join(ROOT, dir);
    if (!statSync(full).isDirectory()) continue;
    for (const f of readdirSync(full)) {
      if (!/^mask-.*\.png$/.test(f)) continue;
      const path = join(full, f);
      const buf = readFileSync(path);
      const stats = await sharp(buf).stats();
      const alpha = stats.channels[3];
      if (alpha && alpha.min < 255) {
        skipped++;
        continue;
      }
      writeFileSync(path, await greyToAlphaPng(buf));
      converted++;
    }
  }
  console.log(`masks converted: ${converted}, already alpha: ${skipped}`);
}

main();

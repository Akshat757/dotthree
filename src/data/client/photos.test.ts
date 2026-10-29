/**
 * Every imported client photo must have all its derivatives on disk, and every override must resolve.
 *
 * @vitest-environment node
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { CLIENT_IMAGE_OVERRIDES } from './overrides';
import { PORTFOLIO_PHOTOS } from './photos.generated';

describe('client photos', () => {
  it('has avif and webp files at every width', () => {
    const missing: string[] = [];
    for (const { ref } of PORTFOLIO_PHOTOS) {
      for (const w of [400, 800, 1200, 2000]) {
        for (const fmt of ['avif', 'webp']) {
          const file = join(process.cwd(), 'public', `${ref.src}-${w}.${fmt}`);
          if (!existsSync(file)) missing.push(`${ref.src}-${w}.${fmt}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('has unique ids and real alt text', () => {
    const ids = PORTFOLIO_PHOTOS.map((p) => p.ref.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { ref } of PORTFOLIO_PHOTOS) expect(ref.alt.length, ref.id).toBeGreaterThan(20);
  });

  it('only overrides with photos that exist', () => {
    const ids = new Set(PORTFOLIO_PHOTOS.map((p) => p.ref.id));
    for (const [from, to] of Object.entries(CLIENT_IMAGE_OVERRIDES))
      expect(ids.has(to), `${from} → ${to}`).toBe(true);
  });
});

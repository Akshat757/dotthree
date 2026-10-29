import type { ImageRef } from '@/types/content';

import { CLIENT_IMAGE_OVERRIDES } from '@/data/client/overrides';
import { PORTFOLIO_PHOTOS } from '@/data/client/photos.generated';

import { GENERATED_IMAGES } from './images.generated';

const CLIENT_BY_ID: Record<string, ImageRef> = Object.fromEntries(
  PORTFOLIO_PHOTOS.map((p) => [p.ref.id, p.ref]),
);

/**
 * Resolve a demo image by id. Never throws — a missing id yields a clearly
 * labelled placeholder so the build never breaks, and a unit test
 * (src/data/__tests__/images.test.ts) fails if any referenced id is missing.
 */
export function img(id: string): ImageRef {
  const clientId = CLIENT_IMAGE_OVERRIDES[id];
  const client = clientId ? CLIENT_BY_ID[clientId] : undefined;
  if (client) return client;
  const ref = GENERATED_IMAGES[id];
  if (ref) return ref;
  return {
    id,
    src: `/demo/missing/${id}`,
    width: 1600,
    height: 1067,
    blurHash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
    alt: `Image ${id} has not been generated yet — run npm run assets:images`,
    credit: { source: 'original', licence: 'owned' },
    synthetic: true,
  };
}

export function hasImage(id: string): boolean {
  return id in GENERATED_IMAGES || id in CLIENT_BY_ID;
}

export function allImages(): ImageRef[] {
  return [...Object.values(GENERATED_IMAGES), ...Object.values(CLIENT_BY_ID)];
}

/** Build the derivative URL the <Img> component uses. */
export function imgSrc(
  ref: ImageRef,
  width: 400 | 800 | 1200 | 2000,
  format: 'avif' | 'webp' = 'webp',
): string {
  return `${ref.src}-${width}.${format}`;
}

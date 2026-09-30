/**
 * Declarative specification of every demo image the build generates (SRS §11.3).
 *
 * `scripts/fetch-demo-assets.ts` renders each spec into AVIF/WebP derivatives
 * under /public/demo and writes `images.generated.ts` with the resulting ImageRef
 * (dimensions, BlurHash, palette). Data files reference images by id via `img()`.
 *
 * Replacing a generated image with a real photograph later = add the photo to
 * `public/demo/<id>.jpg`, mark the spec `source: 'file'`, re-run the script.
 */

export type StyleBucket =
  | 'modern-indian'
  | 'contemporary'
  | 'minimal'
  | 'luxury'
  | 'traditional-indian'
  | 'indo-modern-fusion'
  | 'scandinavian'
  | 'bohemian'
  | 'industrial'
  | 'coastal'
  | 'rustic'
  | 'art-deco'
  | 'japandi';

export type RoomKind =
  | 'living'
  | 'master-bedroom'
  | 'kids-room'
  | 'parents-room'
  | 'kitchen'
  | 'pooja'
  | 'balcony'
  | 'foyer'
  | 'bathroom'
  | 'study'
  | 'utility'
  | 'dining'
  | 'guest-room'
  | 'office'
  | 'clinic'
  | 'retail'
  | 'restaurant'
  | 'exterior';

export type ImageAspect = 'landscape' | 'portrait' | 'square' | 'wide';

export interface ImageSpec {
  id: string;
  room: RoomKind;
  style: StyleBucket;
  aspect: ImageAspect;
  /** Deterministic seed — same seed, same picture, forever */
  seed: number;
  alt: string;
  caption?: string;
  /** Generate a synthetic "before" companion (desaturated, dated grade) */
  withBefore?: boolean;
  /** Time-of-day mood for the render */
  light?: 'day' | 'golden' | 'night';
  /** Portrait of a person (designers) — rendered as an abstract monogram portrait */
  kind?: 'room' | 'portrait' | 'swatch' | 'abstract';
}

export const ASPECT_DIMS: Record<ImageAspect, [number, number]> = {
  landscape: [2000, 1333],
  portrait: [1400, 1867],
  square: [1600, 1600],
  wide: [2400, 1200],
};

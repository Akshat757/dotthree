import type { ImageRef } from '@/types/content';

import { cn } from '@/lib/utils';
import { imgSrc } from '@/data/demo/images';

export interface ImgProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt' | 'width' | 'height' | 'srcSet' | 'sizes'
> {
  image: ImageRef;
  /** CSS sizes hint; defaults to full-width up to 1200px */
  sizes?: string;
  priority?: boolean;
  /** Override alt (e.g. decorative → "") */
  alt?: string;
  /** Blur placeholder until loaded (CSS only — background from palette or blurhash-ish grey) */
  fill?: boolean;
  aspect?: string;
  className?: string;
  imgClassName?: string;
}

const WIDTHS = [400, 800, 1200, 2000] as const;

/**
 * Responsive <picture> for demo-manifest images (AVIF → WebP fallback).
 * The build-time generator emits `${src}-${w}.{avif,webp}` derivatives.
 * Marked as the only sanctioned place for a raw <img> (ESLint override).
 */
export function Img({
  image,
  sizes = '(min-width: 1280px) 1200px, 100vw',
  priority,
  alt,
  fill,
  aspect,
  className,
  imgClassName,
  ...rest
}: ImgProps) {
  const bg = image.palette?.[0] ?? 'var(--color-surface-sunk)';
  const set = (fmt: 'avif' | 'webp') =>
    WIDTHS.map((w) => `${imgSrc(image, w, fmt)} ${w}w`).join(', ');
  return (
    <picture
      className={cn('block overflow-hidden', fill && 'absolute inset-0 size-full', className)}
      style={{
        backgroundColor: bg,
        aspectRatio: aspect ?? (fill ? undefined : `${image.width} / ${image.height}`),
      }}
    >
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <img
        src={imgSrc(image, 1200, 'webp')}
        srcSet={set('webp')}
        sizes={sizes}
        alt={alt ?? image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        className={cn('size-full object-cover', imgClassName)}
        {...rest}
      />
    </picture>
  );
}

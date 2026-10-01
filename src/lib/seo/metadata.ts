import type { Metadata } from 'next';

import { site } from '@/config/site';

export interface PageMetaInput {
  title: string;
  description: string;
  /** Route path with trailing slash, e.g. `/projects/` */
  path: string;
  /** Absolute or site-relative OG image. Defaults to the generated route card or the site default. */
  image?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
}

/**
 * Metadata factory — every page builds its <head> from this so canonical URLs,
 * OG cards and robots are consistent (SRS FR-L-01).
 */
export function pageMeta({
  title,
  description,
  path,
  image,
  noindex,
  type = 'website',
}: PageMetaInput): Metadata {
  const og = image ?? '/og/default.png';
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      title,
      description,
      url: path,
      siteName: site.name,
      locale: 'en_IN',
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [og] },
  };
}

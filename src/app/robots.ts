import type { MetadataRoute } from 'next';

import { site } from '@/config/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Share decoders and personal dashboards carry no indexable content.
        disallow: ['/d/', '/b/', '/dashboard/', '/dev/', '/estimate/result/', '/quiz/result/'],
      },
    ],
    sitemap: new URL('/sitemap.xml', site.url).toString(),
    host: site.url,
  };
}

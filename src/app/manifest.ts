import type { MetadataRoute } from 'next';

import { site } from '@/config/site';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf9f6',
    theme_color: '#b5643c',
    lang: 'en-IN',
    icons: [
      { src: '/icons/generated/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/generated/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/generated/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      { name: 'Room visualiser', url: '/visualiser/' },
      { name: 'Cost estimator', url: '/estimate/' },
      { name: 'Book a consultation', url: '/consultation/' },
    ],
  };
}

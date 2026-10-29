import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import {
  AppProviders,
  DemoBanner,
  Footer,
  Header,
  MobileBar,
  PREFS_BOOT_SCRIPT,
  SkipLink,
  WhatsAppFab,
} from '@/components/layout';
import { AmbientBackground } from '@/components/motion/ambient-background';
import { ScrollProgress, ScrollReveals } from '@/components/motion';
import { site } from '@/config/site';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Interior Designers in Indore`,
    template: `%s · ${site.shortName}`,
  },
  description: site.tagline,
  applicationName: site.name,
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_IN',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/generated/apple-touch-180.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f4' },
    { media: '(prefers-color-scheme: dark)', color: '#171512' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* Theme boot: applied before paint from localStorage. Static string, no user input. */}
        {/* eslint-disable-next-line no-restricted-syntax */}
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT_SCRIPT }} />
      </head>
      <body className="relative min-h-dvh bg-canvas font-sans text-body text-ink antialiased">
        <AppProviders>
          <AmbientBackground />
          <ScrollProgress />
          <ScrollReveals />
          <SkipLink />
          <DemoBanner />
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <MobileBar />
          <WhatsAppFab />
        </AppProviders>
      </body>
    </html>
  );
}

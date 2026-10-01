'use client';

import { MapPin } from 'lucide-react';

import { MediaFacade } from '@/components/ui/media';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

/**
 * OpenStreetMap embed behind a click-to-load facade — the only third-party origin
 * the site touches, and only after explicit consent (SRS §6 privacy).
 */
export function StudioMap({ className, zoom = 15 }: { className?: string; zoom?: number }) {
  const { lat, lng } = site.address;
  const d = 0.008;
  const bbox = [lng - d, lat - d / 2, lng + d, lat + d / 2].map((n) => n.toFixed(5)).join('%2C');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;

  return (
    <MediaFacade
      className={cn('aspect-[4/3] md:aspect-auto md:h-full', className)}
      label="Load map"
      description="Loads tiles from openstreetmap.org"
      poster={
        <div className="flex size-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_40%,var(--color-sand)_0,var(--color-surface-sunk)_70%)] text-ink-muted">
          <MapPin className="size-8 text-accent" aria-hidden />
          <p className="text-body-s">
            {site.address.line1}, {site.address.line2}
          </p>
          <p className="text-caption">
            {site.address.city} {site.address.pincode}
          </p>
        </div>
      }
    >
      <div className="relative size-full">
        <iframe
          title={`Map showing ${site.name}`}
          src={src}
          className="size-full min-h-[320px] border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 bottom-2 rounded-sm bg-surface/90 px-2 py-1 text-caption text-ink shadow-e1 hover:underline"
        >
          Open in OpenStreetMap
        </a>
      </div>
    </MediaFacade>
  );
}

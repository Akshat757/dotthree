import { MapPin } from 'lucide-react';
import Link from 'next/link';

import { Container, Section } from '@/components/layout';
import { CtaBand, PageHero } from '@/components/shared/page';
import { Badge, SectionHeader } from '@/components/ui/display';
import { site } from '@/config/site';
import { indoreLocalities, nearbyCities, projects } from '@/data/demo';
import { breadcrumbLd, JsonLd, localBusinessLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import type { Locality } from '@/types/content';

export const metadata = pageMeta({
  title: 'Interior designers across Indore — areas we serve',
  description: `Interior design and turnkey execution in ${indoreLocalities.length} Indore localities plus ${nearbyCities.map((c) => c.name).join(', ')}. Local site knowledge, society rules and realistic pricing for each area.`,
  path: '/locations/',
});

function projectCount(l: Locality) {
  return projects.filter((p) => (l.kind === 'city' ? p.city === l.name : p.locality === l.name))
    .length;
}

export default function LocationsPage() {
  const sorted = [...indoreLocalities].sort((a, b) => a.distanceKm - b.distanceKm);
  return (
    <>
      <JsonLd
        data={[
          localBusinessLd({
            areaServed: [...indoreLocalities, ...nearbyCities].map((l) => ({
              '@type': 'Place',
              name: `${l.name}, ${l.city}`,
            })),
          }),
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Locations', href: '/locations/' },
          ]),
        ]}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Locations' }]}
        overline="Where we work"
        title="Interior designers who know your society's rules"
        description={`From our studio in Scheme 54 we cover every Indore locality and the surrounding cities. Each area page lists what the buildings there are like, what to budget for, and the projects we have done nearby.`}
      />

      <Section className="pt-0 md:pt-0">
        <Container>
          <SectionHeader
            overline="Indore"
            title={`${sorted.length} localities, sorted by distance from the studio`}
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((l) => (
              <LocalityTile key={l.slug} l={l} />
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="sunk">
        <Container>
          <SectionHeader
            overline="Beyond Indore"
            title="Nearby cities"
            description="Full-home and commercial projects, scheduled in site-visit batches. Travel is itemised in the quote."
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearbyCities.map((l) => (
              <LocalityTile key={l.slug} l={l} />
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand
        title="Not sure if we cover your PIN code?"
        description={`We serve ${site.serviceablePinPrefixes.map((p) => `${p}xxx`).join(' and ')} fully and nearby cities on request. Ask and we will tell you straight.`}
        primary={{ label: 'Check in the estimator', href: '/estimate/' }}
        secondary={{ label: 'Contact us', href: '/contact/' }}
      />
    </>
  );
}

function LocalityTile({ l }: { l: Locality }) {
  const n = projectCount(l);
  return (
    <li>
      <Link
        href={`/locations/${l.slug}/`}
        className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 transition-colors hover:border-sand hover:bg-surface-sunk focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-h3 text-ink group-hover:text-accent">{l.name}</h3>
          <MapPin className="size-4 shrink-0 text-ink-subtle" aria-hidden />
        </div>
        <p className="mt-1 text-caption text-ink-muted">
          {l.kind === 'city'
            ? `${l.distanceKm} km from Indore`
            : `${l.distanceKm} km · PIN ${l.pincodes[0]}`}
        </p>
        <p className="mt-3 line-clamp-2 flex-1 text-body-s text-ink-muted">
          {l.propertyTypes.join(' · ')}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {n > 0 && (
            <Badge tone="accent">
              {n} project{n === 1 ? '' : 's'}
            </Badge>
          )}
          {l.multiplier !== 1 && (
            <Badge tone="outline">
              {l.multiplier > 1 ? '+' : ''}
              {Math.round((l.multiplier - 1) * 100)}% pricing
            </Badge>
          )}
        </div>
      </Link>
    </li>
  );
}

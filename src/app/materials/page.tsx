import { Suspense } from 'react';

import { Container, Section } from '@/components/layout';
import { MaterialsCatalogue } from '@/components/materials/catalogue';
import { CtaBand, PageHero } from '@/components/shared/page';
import { CardSkeleton } from '@/components/ui/display';
import { materials } from '@/data/demo';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Interior Materials Catalogue with Indore Prices',
  description: `${materials.length} paints, laminates, veneers, stones, tiles, fabrics and hardware we actually specify — with current Indore price ranges, finish tiers and budget-friendly substitutes.`,
  path: '/materials/',
});

export default function MaterialsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Materials', href: '/materials/' },
        ])}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Materials' }]}
        overline="Materials library"
        title="Every finish we specify, with the price next to it"
        description="Search by name or room, filter by tier and surface, match a colour from a photo, and compare up to four side by side. Prices are Indore market ranges, updated with each price book."
        className="pb-6 md:pb-8"
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <Suspense
            fallback={
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" aria-busy>
                {Array.from({ length: 10 }).map((_, i) => (
                  <CardSkeleton key={i} lines={1} />
                ))}
              </div>
            }
          >
            <MaterialsCatalogue />
          </Suspense>
        </Container>
      </Section>
      <CtaBand
        title="See a finish you like?"
        description="Try it on a room in the visualiser, or ask us on WhatsApp whether it suits your space and budget."
        primary={{ label: 'Open the visualiser', href: '/visualiser/' }}
        secondary={{ label: 'Get an estimate', href: '/estimate/' }}
      />
    </>
  );
}

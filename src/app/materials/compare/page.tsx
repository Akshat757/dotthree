import { Suspense } from 'react';

import { Container, Section } from '@/components/layout';
import { MaterialsCompare } from '@/components/materials/compare';
import { PageHero } from '@/components/shared/page';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Compare materials',
  description:
    'Side-by-side comparison of finishes: price, tier, durability, maintenance and where each one works.',
  path: '/materials/compare/',
  noindex: true,
});

export default function MaterialsComparePage() {
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Materials', href: '/materials/' },
          { label: 'Compare' },
        ]}
        overline="Compare"
        title="Materials side by side"
        description="Up to four finishes at once. Prices are Indore market ranges for material only."
        className="pb-6 md:pb-8"
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <Suspense fallback={<div className="skeleton h-72 w-full rounded-lg" aria-busy />}>
            <MaterialsCompare />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}

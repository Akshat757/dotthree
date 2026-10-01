import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { ServiceCard } from '@/components/cards';
import { Container, Section } from '@/components/layout';
import { CtaBand, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/display';
import { services, STANDARD_PROCESS } from '@/data/demo';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Interior Design Services in Indore',
  description:
    'Full-home interiors, modular kitchens, wardrobes, renovation, false ceilings, lighting and commercial fit-outs — every service priced from one public Indore price book.',
  path: '/services/',
  image: '/og/services/default.png',
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Services', href: '/services/' },
        ])}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
        overline="Services"
        title="One studio, from a single wardrobe to a whole villa"
        description="Pick the scope you need. Every service shares the same designers, the same vendors and the same transparent price book — so a kitchen-only job isn't a second-class project."
        actions={
          <Button asChild variant="outline">
            <Link href="/process/">
              How a project runs <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        }
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </Container>
      </Section>
      <Section tone="sunk">
        <Container>
          <SectionHeader
            overline="Shared process"
            title="Whatever the scope, the steps are the same"
            description="Each stage ends with something you sign off — a layout, a BOQ, a sample board — before money moves to the next one."
          />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STANDARD_PROCESS.map((s, i) => (
              <li key={s.step} className="rounded-lg border border-line bg-surface p-5">
                <span className="tabular font-display text-h3 text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-1 text-body font-medium text-ink">{s.step}</h3>
                <p className="mt-1 text-body-s text-ink-muted">{s.detail}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}

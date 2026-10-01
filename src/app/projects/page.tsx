import { Suspense } from 'react';

import { Container, Section } from '@/components/layout';
import { ProjectsExplorer } from '@/components/projects/explorer';
import { CtaBand, PageHero } from '@/components/shared/page';
import { CardSkeleton } from '@/components/ui/display';
import { site } from '@/config/site';
import { projects } from '@/data/demo';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Interior Design Projects in Indore',
  description: `${projects.length} completed homes, offices and clinics across Indore — filter by BHK, budget, style and room, with real budgets and timelines on every project.`,
  path: '/projects/',
  image: '/og/projects/default.png',
});

export default function ProjectsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Projects', href: '/projects/' },
        ])}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Projects' }]}
        overline="Portfolio"
        title="Real homes, real budgets"
        description={`Every project below lists what it cost, how long it took and who designed it. ${site.stats.projectsCompleted}+ delivered; these are the ones our clients let us photograph.`}
        className="pb-6 md:pb-8"
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <Suspense
            fallback={
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <ProjectsExplorer />
          </Suspense>
        </Container>
      </Section>
      <CtaBand
        title="Like one of these? Start from it."
        description="Tell us which project caught your eye and we'll scope something similar for your home — or run the numbers yourself first."
      />
    </>
  );
}

import Link from 'next/link';

import { Container, Section } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { LinkTiles } from '@/components/shared/page';

export default function NotFound() {
  return (
    <Section>
      <Container size="lg">
        <p className="overline">404</p>
        <h1 className="mt-2 font-display text-display-l text-ink">
          That room isn&apos;t on the plan.
        </h1>
        <p className="mt-4 max-w-xl text-body-l text-ink-muted">
          The page may have moved or never existed. Here are the places most people are looking
          for.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact/">Contact the studio</Link>
          </Button>
        </div>
        <LinkTiles
          className="mt-10"
          items={[
            { label: 'Projects', href: '/projects/', description: '24 homes and workplaces across Indore.' },
            { label: 'Cost estimator', href: '/estimate/', description: 'A real range in three minutes.' },
            { label: 'Room visualiser', href: '/visualiser/', description: 'Try colours and materials on a room.' },
            { label: 'Services', href: '/services/', description: 'Full home to a single pooja unit.' },
            { label: 'Materials', href: '/materials/', description: '120+ finishes with Indore prices.' },
            { label: 'Journal', href: '/journal/', description: 'Honest guides with 2026 numbers.' },
          ]}
        />
      </Container>
    </Section>
  );
}

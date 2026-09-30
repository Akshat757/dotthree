import Link from 'next/link';

import { Container, Section } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { site } from '@/config/site';

export default function HomePage() {
  return (
    <Section>
      <Container size="lg" className="text-center">
        <p className="mb-4 overline">Interior design · {site.address.city}</p>
        <h1 className="font-display text-display-l text-ink">{site.tagline}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-body-l text-ink-muted">
          Full-home interiors, modular kitchens and turnkey execution — with a live visualiser and
          transparent estimates before you ever pick up the phone.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/projects">See our projects</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/estimate">Get an estimate</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { StyleCard } from '@/components/cards';
import { Container, Section } from '@/components/layout';
import { CtaBand, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { styles } from '@/data/demo';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Interior Design Styles — Guides for Indian Homes',
  description: `${styles.length} interior styles explained for Indore homes: what defines each, which rooms they suit, typical budgets and the materials that make them work.`,
  path: '/styles/',
  image: '/og/styles/default.png',
});

export default function StylesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Styles', href: '/styles/' },
        ])}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Styles' }]}
        overline="Style guides"
        title="Find the look you'll still love in ten years"
        description="Styles are a shared vocabulary, not a rulebook. Browse the guides to see what each one means in an Indian home, what it costs, and the projects where we've done it."
        actions={
          <Button asChild>
            <Link href="/quiz/">
              <Sparkles className="size-4" aria-hidden /> Take the 2-minute style quiz
            </Link>
          </Button>
        }
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {styles.map((s) => (
              <StyleCard key={s.slug} style={s} />
            ))}
          </div>
        </Container>
      </Section>
      <CtaBand
        title="Not sure which one is you?"
        description="Eight image choices, no sign-up — the quiz ranks the styles that fit how you actually live."
        primary={{ label: 'Take the quiz', href: '/quiz/' }}
        secondary={{ label: 'Browse projects', href: '/projects/' }}
      />
    </>
  );
}

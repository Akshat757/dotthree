import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { Container, Section } from '@/components/layout';
import { PageHero } from '@/components/shared/page';
import { QuizBrowser } from '@/components/quiz/browser';
import { Button } from '@/components/ui/button';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Style quiz — find your interior design match',
  description:
    'Take the 2-minute style quiz for an Indore home and see the design direction that fits your daily life, storage habits and taste.',
  path: '/quiz/',
  image: '/og/default.png',
});

export default function QuizPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Style quiz', href: '/quiz/' },
        ])}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Style quiz' }]}
        overline="Design direction"
        title="Find the home style you’ll actually live with"
        description="We keep this to eight visual choices and zero paperwork. Answer honestly and we’ll suggest the style that fits your daily life, budget and light."
        actions={
          <Button asChild variant="outline">
            <Link href="/styles/">
              <Sparkles className="size-4" aria-hidden /> Browse style guides
            </Link>
          </Button>
        }
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <QuizBrowser />
        </Container>
      </Section>
    </>
  );
}

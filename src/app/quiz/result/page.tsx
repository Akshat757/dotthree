import { Suspense } from 'react';

import { PageHero } from '@/components/shared/page';
import { QuizResult } from '@/components/quiz/result';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Your style match',
  description: 'Your interior style match based on the style quiz.',
  path: '/quiz/result/',
  image: '/og/default.png',
  noindex: true,
});

export default function QuizResultPage() {
  return (
    <Suspense
      fallback={
        <PageHero
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Style quiz', href: '/quiz/' },
            { label: 'Your match' },
          ]}
          overline="Style quiz"
          title="Loading your match…"
          description="We’re matching your answers to the closest interior style profile."
        />
      }
    >
      <QuizResult />
    </Suspense>
  );
}

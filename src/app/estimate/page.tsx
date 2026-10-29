import { Suspense } from 'react';

import { EstimateWizard } from '@/components/estimate/wizard';
import { PageHero } from '@/components/shared/page';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Interior design cost estimator — Indore',
  description:
    'Get an honest, line-item interior design cost range for your Indore home in three minutes. Built on our 2026 price book, adjusts for locality, scope, kitchen, wardrobes and finish tier.',
  path: '/estimate/',
});

export default function EstimatePage() {
  return (
    <Suspense
      fallback={
        <PageHero
          crumbs={[{ label: 'Home', href: '/' }, { label: 'Cost estimator' }]}
          overline="Cost estimator"
          title="Loading the estimator…"
        />
      }
    >
      <EstimateWizard />
    </Suspense>
  );
}

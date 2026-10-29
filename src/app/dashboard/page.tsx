import { Suspense } from 'react';

import { Dashboard } from '@/components/dashboard/dashboard';
import { PageHero } from '@/components/shared/page';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Your dashboard',
  description: 'Saved estimates, designs, mood boards and enquiries stored on this device.',
  path: '/dashboard/',
  noindex: true,
});

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <PageHero
          crumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
          overline="Your dashboard"
          title="Loading…"
        />
      }
    >
      <Dashboard />
    </Suspense>
  );
}

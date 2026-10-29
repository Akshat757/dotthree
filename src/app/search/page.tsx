import { Suspense } from 'react';

import { SearchResults } from '@/components/search/results';
import { PageHero } from '@/components/shared/page';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Search',
  description:
    'Search projects, materials, guides, styles and services across the Dot 3 Design Studio site.',
  path: '/search/',
  noindex: true,
});

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <PageHero
          crumbs={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
          overline="Search"
          title="Find a project, material or guide"
        />
      }
    >
      <SearchResults />
    </Suspense>
  );
}

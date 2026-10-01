import type { Metadata } from 'next';

import { JournalIndex } from '@/components/journal/journal-index';
import { Container, Section } from '@/components/layout';
import { Breadcrumb } from '@/components/ui/display';
import { site } from '@/config/site';
import { JOURNAL_CATEGORIES, getAllPosts, getAllTags, toSummary } from '@/lib/journal';
import { JsonLd, absUrl, breadcrumbLd } from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'Journal — honest guides to interiors in Indore',
  description:
    'Costs, materials, timelines and planning guides written by our designers — with real 2026 Indore prices and no sales copy.',
  alternates: { canonical: '/journal/', types: { 'application/rss+xml': '/journal/rss.xml' } },
};

export default function JournalPage() {
  const posts = getAllPosts();
  const summaries = posts.map(toSummary);
  const tags = getAllTags().map((t) => t.tag);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: `${site.name} Journal`,
          url: absUrl('/journal/'),
          blogPost: posts.slice(0, 10).map((p) => ({
            '@type': 'BlogPosting',
            headline: p.title,
            datePublished: p.date,
            url: absUrl(`/journal/${p.slug}/`),
          })),
        }}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Journal', href: '/journal/' },
        ])}
      />
      <Section>
        <Container>
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Journal' }]} />
          <header className="mt-6 mb-10 max-w-2xl">
            <p className="overline">Journal</p>
            <h1 className="mt-2 font-display text-display-l text-ink">
              What interiors in Indore actually cost, take, and need.
            </h1>
            <p className="mt-5 text-body-l text-ink-muted">
              Guides written by our designers with real 2026 prices — the articles we wish every
              client had read before their first quote.
            </p>
          </header>
          <JournalIndex posts={summaries} categories={JOURNAL_CATEGORIES} tags={tags} />
        </Container>
      </Section>
    </>
  );
}

import { Container, Section } from '@/components/layout';
import { ProjectGallery } from '@/components/projects/gallery';
import { CtaBand, PageHero } from '@/components/shared/page';
import { PORTFOLIO_PHOTOS } from '@/data/client/photos.generated';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import { site } from '@/config/site';

export const metadata = pageMeta({
  title: 'Gallery — architecture, interiors and outdoor living',
  description: `A look at ${site.name}'s design work: house exteriors, courtyards and pools, bedrooms and bathrooms. 3D visualisations of projects in design.`,
  path: '/gallery/',
});

const LABELS: Record<string, string> = {
  exterior: 'Exteriors',
  outdoor: 'Gardens & outdoor living',
  bedroom: 'Bedrooms',
  bathroom: 'Bathrooms',
  interior: 'Interiors',
};

export default function GalleryPage() {
  const images = PORTFOLIO_PHOTOS.map((p) => p.ref);
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Gallery', href: '/gallery/' },
        ])}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Gallery' }]}
        overline="Our work"
        title="Architecture, interiors, landscape and furniture"
        description="From the street front to the bathroom tiles: a selection of our design work. These are 3D visualisations prepared for our clients, so finishes on site may differ slightly."
        className="pb-6 md:pb-8"
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <ProjectGallery images={images} title={site.name} labels={LABELS} />
        </Container>
      </Section>
      <CtaBand
        title="Have a plot, a home or a room in mind?"
        description="Tell us what you are planning. A designer will walk through it with you, free of charge."
        primary={{ label: 'Book a consultation', href: '/consultation/' }}
        secondary={{ label: 'Try the room visualiser', href: '/visualiser/' }}
      />
    </>
  );
}

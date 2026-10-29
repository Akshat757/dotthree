import { Container, Section } from '@/components/layout';
import { PageHero, Prose } from '@/components/shared/page';
import { site } from '@/config/site';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Terms of use',
  description: `Terms for using the ${site.name} website, estimator and room visualiser.`,
  path: '/legal/terms/',
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Terms of use' }]}
        overline="Legal"
        title="Terms of use"
        description="Plain-language terms for using this website and its design tools."
        className="pb-6 md:pb-8"
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <Prose>
            <p>
              <strong>Demo notice.</strong> This is a demonstration build. Projects, people, prices
              and testimonials shown are illustrative, and these terms will be replaced by the
              studio&apos;s own before launch.
            </p>

            <h2>Estimates are indicative</h2>
            <p>
              The cost estimator gives a range based on a sample price book. It is not a quotation,
              and a final price needs site measurements and a signed proposal from {site.name}.
            </p>

            <h2>Visualiser results are indicative</h2>
            <p>
              Colours and textures vary by screen, lighting and batch. Order a physical sample
              before you commit to a material.
            </p>

            <h2>Consultations</h2>
            <p>
              A consultation request is not a confirmed booking until a designer confirms the slot
              with you. First consultations are free and carry no obligation.
            </p>

            <h2>Your content</h2>
            <p>
              Designs and estimates you create stay on your device. You are responsible for keeping
              an export if you want a backup.
            </p>

            <h2>Our content</h2>
            <p>
              Text, layouts and original imagery on this site belong to {site.legalName}.
              Third-party images and textures are credited on the image credits page.
            </p>

            <h2>Contact</h2>
            <p>Questions about these terms: {site.email}.</p>
          </Prose>
        </Container>
      </Section>
    </>
  );
}

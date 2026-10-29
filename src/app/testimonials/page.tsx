import { Container, Section } from '@/components/layout';
import { CtaBand, PageHero } from '@/components/shared/page';
import { TestimonialsBrowser } from '@/components/testimonials/browser';
import { RatingStars } from '@/components/ui/display';
import { StatCounter } from '@/components/ui/media';
import { site } from '@/config/site';
import { testimonials } from '@/data/demo';
import { breadcrumbLd, JsonLd, reviewsLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Client testimonials & reviews',
  description: `${testimonials.length} Indore families and businesses on what it was like to work with ${site.name} — rated ${site.stats.avgRating} across ${site.stats.reviewCount} reviews.`,
  path: '/testimonials/',
});

export default function TestimonialsPage() {
  const avg = testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length;
  const fiveStar = testimonials.filter((t) => t.rating === 5).length;

  return (
    <>
      <JsonLd
        data={[
          reviewsLd(
            testimonials.map((t) => ({
              author: t.clientName,
              body: t.quote,
              rating: t.rating,
              date: t.date,
            })),
          ),
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Testimonials', href: '/testimonials/' },
          ]),
        ]}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Testimonials' }]}
        overline="Client stories"
        title="What it was actually like"
        description="Unedited notes from handover day, with the project each one refers to. Filter by rating, project type or designer."
        aside={
          <div className="grid grid-cols-3 gap-4 rounded-lg border border-line bg-surface p-5">
            <div className="col-span-3 flex items-center gap-3">
              <span className="font-display text-display-l leading-none text-ink">
                {avg.toFixed(1)}
              </span>
              <div>
                <RatingStars value={avg} />
                <p className="mt-1 text-caption text-ink-muted">average across published reviews</p>
              </div>
            </div>
            <StatCounter value={fiveStar} label="Five-star" />
            <StatCounter value={site.stats.reviewCount} label="Reviews total" />
            <StatCounter value={site.stats.onTimePercent} suffix="%" label="On time" />
          </div>
        }
        className="pb-6 md:pb-8"
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <TestimonialsBrowser />
        </Container>
      </Section>
      <CtaBand
        title="Want to talk to a past client?"
        description="Ask us and we will connect you with a family whose project was similar to yours — same locality, same budget band."
        primary={{ label: 'Book a consultation', href: '/consultation/' }}
        secondary={{ label: 'See the projects', href: '/projects/' }}
      />
    </>
  );
}

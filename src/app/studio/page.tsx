import { ArrowRight, Compass, HeartHandshake, Ruler, Sprout } from 'lucide-react';
import Link from 'next/link';

import { DesignerCard, TestimonialCard } from '@/components/cards';
import { Container, Section } from '@/components/layout';
import { CtaBand, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/display';
import { Img } from '@/components/ui/img';
import { StatCounter } from '@/components/ui/media';
import { site } from '@/config/site';
import { designers, featuredTestimonials, img, projects } from '@/data/demo';
import { breadcrumbLd, JsonLd, organisationLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'About the studio & our designers',
  description: `${site.name} is a ${new Date().getFullYear() - site.foundedYear}-year-old interior design practice in Indore. Meet the six designers, read how we think, and see what we promise every client.`,
  path: '/studio/',
});

const VALUES = [
  {
    icon: Compass,
    title: 'Designed for Indore',
    body: 'Hard water, dusty summers, Malwa light and joint families. We design for the city we live in, not a catalogue city.',
  },
  {
    icon: Ruler,
    title: 'Measured honesty',
    body: 'Every quote is itemised to the running foot. If a cheaper material will look the same, we will tell you so before you ask.',
  },
  {
    icon: HeartHandshake,
    title: 'One team, start to finish',
    body: 'The designer who draws your home is the one who stands on site at handover. No hand-offs to a stranger.',
  },
  {
    icon: Sprout,
    title: 'Built to be kept',
    body: 'We specify finishes that age well and plan storage that survives real life, so you are not redoing it in five years.',
  },
];

export default function StudioPage() {
  const heroes = projects.slice(0, 3).map((p) => p.heroImage);
  const quotes = featuredTestimonials.slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          organisationLd(),
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Studio', href: '/studio/' },
          ]),
        ]}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Studio' }]}
        overline={`Est. ${site.foundedYear} · Indore`}
        title="A small studio that takes your home personally"
        description={`${site.name} was started in ${site.foundedYear} by Meera Rathore with one drafting table and a borrowed site van. Today six designers, two site engineers and a workshop of trusted carpenters deliver homes and workplaces across Indore and the Malwa region.`}
        image={img('hero-01')}
        actions={
          <>
            <Button asChild>
              <Link href="/consultation/">Book a studio visit</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#designers">Meet the designers</Link>
            </Button>
          </>
        }
      />

      <Section tone="sunk">
        <Container>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <StatCounter
              value={site.stats.projectsCompleted}
              suffix="+"
              label="Homes & workplaces delivered"
            />
            <StatCounter value={site.stats.yearsExperience} label="Years in Indore" />
            <StatCounter
              value={Math.round(site.stats.sqftDelivered / 1000)}
              suffix="k sq ft"
              label="Designed and executed"
            />
            <StatCounter
              value={site.stats.onTimePercent}
              suffix="%"
              label="Handed over on schedule"
            />
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
          <div>
            <SectionHeader
              overline="Our story"
              title="From one bungalow to two hundred and forty homes"
            />
            <div className="prose-measure mt-6 grid gap-4 text-body text-ink-muted">
              <p>
                The first project was a 1978 bungalow in Scheme 54 whose owners wanted their
                childhood home to work for three generations without losing its Kota floors and
                jaali screens. That brief — keep what matters, fix what doesn&apos;t — is still the
                way we start every conversation.
              </p>
              <p>
                We grew slowly and on purpose. Each designer who joined brought a specialism we were
                missing: modular kitchens engineered for Indian cooking, compact apartments in the
                new Super Corridor towers, clinics and cafés that need to open on a date. We stayed
                small enough that the founder still reviews every drawing set.
              </p>
              <p>
                Everything you see on this site — the price ranges, the visualiser, the honest
                timelines — exists because clients kept asking the same questions at the first
                meeting. We would rather you had the answers before you call us.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {heroes.map((h, i) => (
              <Img
                key={h.id}
                image={h}
                sizes="(min-width:1024px) 20vw, 45vw"
                aspect={i === 0 ? '3/4' : '1/1'}
                className={i === 0 ? 'row-span-2 rounded-lg' : 'rounded-lg'}
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <SectionHeader
            overline="What we promise"
            title="Four things every client can hold us to"
            align="center"
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <li key={v.title} className="rounded-lg border border-line bg-canvas p-6">
                <v.icon className="size-6 text-accent" aria-hidden />
                <h3 className="mt-4 font-display text-h3 text-ink">{v.title}</h3>
                <p className="mt-2 text-body-s text-ink-muted">{v.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section id="designers">
        <Container>
          <SectionHeader
            overline="The team"
            title="Six designers, one standard"
            description="Every designer leads their own projects end to end. Pick the one whose work speaks to you, or let us match you at the first call."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {designers.map((d) => (
              <div key={d.slug} id={d.slug} className="scroll-mt-28">
                <DesignerCard designer={d} />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="sunk">
        <Container>
          <SectionHeader
            overline="In their words"
            title="What clients remember"
            action={
              <Button asChild variant="link">
                <Link href="/testimonials/">
                  All testimonials <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            }
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {quotes.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-8 rounded-lg border border-line bg-surface p-6 md:grid-cols-3 md:p-10">
          <div className="md:col-span-2">
            <p className="overline">Join us</p>
            <h2 className="mt-2 font-display text-h2 text-ink">
              Designers and site engineers who care about the last 5%
            </h2>
            <p className="mt-3 text-body text-ink-muted">
              We hire slowly and keep people for years. If you draw well, measure twice and can talk
              to a carpenter and a client in the same afternoon, we would like to meet you.
            </p>
          </div>
          <div className="flex items-center md:justify-end">
            <Button asChild variant="outline">
              <Link href="/studio/careers/">
                Open roles <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      <CtaBand
        title="Come and see the studio"
        description={`We are in Scheme 54, ${site.businessHours.weekdays} on weekdays. Bring your floor plan and a cup of chai is on us.`}
        primary={{ label: 'Book a visit', href: '/consultation/' }}
        secondary={{ label: 'Find us', href: '/contact/' }}
      />
    </>
  );
}

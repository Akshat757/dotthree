import Link from 'next/link';
import { ArrowRight, Calculator, Palette, Phone, ShieldCheck } from 'lucide-react';

import {
  DesignerCard,
  ProjectCard,
  ServiceCard,
  StyleCard,
  TestimonialCard,
} from '@/components/cards';
import { MiniEstimator } from '@/components/home/mini-estimator';
import { StudioMap } from '@/components/home/studio-map';
import { Container, Section } from '@/components/layout';
import { CtaBand } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge, RatingStars, SectionHeader } from '@/components/ui/display';
import { Img } from '@/components/ui/img';
import { BeforeAfterSlider, KenBurnsHero, StatCounter } from '@/components/ui/media';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { site } from '@/config/site';
import {
  designers,
  featuredProjects,
  featuredTestimonials,
  img,
  indoreLocalities,
  nearbyCities,
  projects,
  roomTemplates,
  services,
  STANDARD_PROCESS,
  styles,
} from '@/data/demo';
import { JOURNAL_DOCS } from '@/data/journal.generated';
import { JsonLd, localBusinessLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import { messages } from '@/lib/whatsapp';

export const metadata = pageMeta({
  title: `${site.name} — Interior Designers in Indore`,
  description: `${site.tagline}. Full-home interiors, modular kitchens and turnkey execution in Indore — try our room visualiser and get a transparent estimate before you call.`,
  path: '/',
});

const HERO = ['hero-01', 'hero-02', 'hero-03'].map((id) => img(id));

const ESTIMATOR_POINTS = [
  'GST shown separately, exclusions listed up front',
  `Locality-adjusted for ${indoreLocalities.length} Indore neighbourhoods`,
  'Save, compare tiers and send it to yourself on WhatsApp',
];

export default function HomePage() {
  const showcase =
    projects.find((p) => p.nature === 'RENOVATION' && p.beforeAfters.length > 0) ?? projects[0]!;
  const ba = showcase.beforeAfters[0]!;
  const latest = JOURNAL_DOCS.slice(0, 3);
  const heroTemplate = roomTemplates[0]!;

  return (
    <>
      <JsonLd data={localBusinessLd()} />

      {/* 1 — Hero */}
      <KenBurnsHero
        slides={HERO.map((h, i) => (
          <Img key={h.id} image={h} priority={i === 0} sizes="100vw" alt="" />
        ))}
        className="min-h-[82svh]"
      >
        <Container
          size="xl"
          className="flex min-h-[82svh] flex-col justify-end pt-32 pb-16 md:pb-24"
        >
          <p className="text-canvas/80 overline">Interior design studio · {site.address.city}</p>
          <h1 className="mt-3 max-w-3xl font-display text-display-l text-canvas md:text-display-xl">
            {site.tagline}
          </h1>
          <p className="mt-5 max-w-xl text-body-l text-canvas/85">
            {site.stats.projectsCompleted}+ homes and workplaces across Indore, delivered on a fixed
            schedule with a line-item quote. See it on your walls first.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/visualiser/">
                <Palette className="size-4" aria-hidden /> Try the visualiser
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/estimate/">
                <Calculator className="size-4" aria-hidden /> Get a cost estimate
              </Link>
            </Button>
            <WhatsAppButton
              message={messages.generic()}
              size="lg"
              variant="ghost"
              className="text-canvas hover:bg-canvas/10 hover:text-canvas"
            />
          </div>
        </Container>
      </KenBurnsHero>

      {/* 2 — Trust strip */}
      <Section tone="surface" className="border-b border-line py-10 md:py-12">
        <Container size="xl">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <StatCounter
              value={site.stats.projectsCompleted}
              suffix="+"
              label="Projects completed"
            />
            <StatCounter value={site.stats.yearsExperience} label="Years in Indore" />
            <StatCounter
              value={site.stats.onTimePercent}
              suffix="%"
              label="Handed over on schedule"
            />
            <div className="grid gap-1">
              <div className="tabular font-display text-display-l text-ink">
                {site.stats.avgRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-2 text-body-s text-ink-muted">
                <RatingStars value={site.stats.avgRating} size="sm" />
                {site.stats.reviewCount} reviews
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3 — Featured projects */}
      <Section>
        <Container size="xl">
          <SectionHeader
            overline="Recent work"
            title="Homes we'd happily live in"
            description="A few of the Indore homes and workplaces our clients let us photograph."
            action={
              <Button asChild variant="link">
                <Link href="/projects/">
                  All {projects.length} projects <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            }
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.slice(0, 6).map((p, i) => (
              <ProjectCard key={p.slug} project={p} priority={i < 2} />
            ))}
          </div>
        </Container>
      </Section>

      {/* 4 — Services */}
      <Section tone="sunk">
        <Container size="xl">
          <SectionHeader
            overline="What we do"
            title="From a single wardrobe to a whole villa"
            description="Every service is priced from the same public price book, so a modular kitchen quote and a full-home quote never contradict each other."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 8).map((s) => (
              <ServiceCard key={s.slug} service={s} compact />
            ))}
          </div>
          {services.length > 8 && (
            <div className="mt-6 text-center">
              <Button asChild variant="outline">
                <Link href="/services/">See all {services.length} services</Link>
              </Button>
            </div>
          )}
        </Container>
      </Section>

      {/* 5 — Before / after showcase */}
      <Section>
        <Container size="xl" className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <BeforeAfterSlider
            before={<Img image={ba.before} sizes="(min-width: 1024px) 60vw, 100vw" />}
            after={<Img image={ba.after} sizes="(min-width: 1024px) 60vw, 100vw" />}
            className="aspect-[4/3]"
          />
          <div>
            <p className="overline">Before &amp; after</p>
            <h2 className="mt-2 font-display text-h1 text-ink">{showcase.title}</h2>
            <p className="mt-3 text-body text-ink-muted">{showcase.brief}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-body-s">
              <div>
                <dt className="text-ink-muted">Scope</dt>
                <dd className="font-medium text-ink">
                  {showcase.bhk ?? showcase.propertyType} · {ba.label}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted">Duration</dt>
                <dd className="font-medium text-ink">{showcase.durationWeeks} weeks</dd>
              </div>
            </dl>
            <Button asChild className="mt-6" variant="secondary">
              <Link href={`/projects/${showcase.slug}/`}>
                Read the case study <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* 6 — Visualiser teaser */}
      <Section tone="ink">
        <Container size="xl" className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-canvas/70 overline">Room visualiser</p>
            <h2 className="mt-2 font-display text-h1 text-canvas">
              Paint it, tile it, panel it — before anyone lifts a brush.
            </h2>
            <p className="mt-4 text-body text-canvas/80">
              Pick one of {roomTemplates.length} Indore rooms, tap a wall, floor or shutter and try
              paint shades and real materials with live cost deltas. Save variants, compare them
              side by side and share a link on WhatsApp — all in your browser, nothing uploaded.
            </p>
            <ul className="mt-6 grid gap-2 text-body-s text-canvas/80">
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden /> Works
                offline after first load; your designs stay on your device.
              </li>
              <li className="flex gap-2">
                <Calculator className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden /> Every
                material swap updates the budget meter from the price book.
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={`/visualiser/edit/?template=${heroTemplate.slug}`}>
                  Open a room now
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-canvas hover:bg-canvas/10 hover:text-canvas"
              >
                <Link href="/visualiser/">Browse all rooms</Link>
              </Button>
            </div>
          </div>
          <Link
            href={`/visualiser/edit/?template=${heroTemplate.slug}`}
            className="group relative block overflow-hidden rounded-lg shadow-e3 focus-visible:ring-2 focus-visible:ring-canvas focus-visible:outline-none"
          >
            <Img
              image={heroTemplate.baseImage}
              sizes="(min-width: 1024px) 50vw, 100vw"
              imgClassName="transition-transform duration-slow group-hover:scale-[1.02]"
            />
            <span className="absolute bottom-4 left-4 rounded-sm bg-ink/70 px-2 py-1 text-caption text-canvas">
              {heroTemplate.name} · {heroTemplate.surfaces.length} editable surfaces
            </span>
          </Link>
        </Container>
      </Section>

      {/* 7 — Mini estimator */}
      <Section>
        <Container size="xl" className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="overline">Cost estimator</p>
            <h2 className="mt-2 font-display text-h1 text-ink">
              A real number, before the first call.
            </h2>
            <p className="mt-4 text-body text-ink-muted">
              Most studios won&apos;t quote until they&apos;ve visited. We publish our Indore price
              book instead. Slide to your home size and tier for a ballpark, then refine it room by
              room in three minutes — wardrobes, kitchen running feet, false ceiling, the lot.
            </p>
            <ul className="mt-6 grid gap-3 text-body-s text-ink-muted">
              {ESTIMATOR_POINTS.map((t) => (
                <li key={t} className="flex gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-line bg-surface p-6 shadow-e2 md:p-8">
            <MiniEstimator />
          </div>
        </Container>
      </Section>

      {/* 8 — Styles strip */}
      <Section tone="sunk">
        <Container size="xl">
          <SectionHeader
            overline="Find your look"
            title={`${styles.length} styles, one honest conversation`}
            description="Not sure what you like? Take the two-minute style quiz or browse the guides."
            action={
              <Button asChild variant="link">
                <Link href="/quiz/">
                  Take the style quiz <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            }
          />
          <div className="no-scrollbar -mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
            {styles.slice(0, 8).map((s) => (
              <StyleCard key={s.slug} style={s} className="w-64 shrink-0 snap-start md:w-auto" />
            ))}
          </div>
        </Container>
      </Section>

      {/* 9 — Process */}
      <Section>
        <Container size="xl">
          <SectionHeader
            overline="How it works"
            title="Six steps, no surprises"
            description="The same process for a pooja unit or a penthouse. Each stage has a deliverable you sign off before we move on."
            action={
              <Button asChild variant="link">
                <Link href="/process/">
                  The full process <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            }
          />
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STANDARD_PROCESS.map((s, i) => (
              <li key={s.step} className="relative rounded-lg border border-line bg-surface p-5">
                <span className="tabular font-display text-h2 text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 text-body-l font-medium text-ink">{s.step}</h3>
                <p className="mt-1.5 text-body-s text-ink-muted">{s.detail}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* 10 — Testimonials */}
      <Section tone="sunk">
        <Container size="xl">
          <SectionHeader
            overline="Client stories"
            title={`Rated ${site.stats.avgRating} by ${site.stats.reviewCount} Indore families`}
            action={
              <Button asChild variant="link">
                <Link href="/testimonials/">
                  All testimonials <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            }
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredTestimonials.slice(0, 3).map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        </Container>
      </Section>

      {/* 11 — Designers */}
      <Section>
        <Container size="xl">
          <SectionHeader
            overline="The studio"
            title="Designers who'll actually be on your site"
            description="No hand-off to a junior after the first meeting. The person you talk to designs and oversees your home."
            action={
              <Button asChild variant="link">
                <Link href="/studio/">
                  Meet the studio <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            }
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {designers.slice(0, 3).map((d) => (
              <DesignerCard key={d.slug} designer={d} />
            ))}
          </div>
        </Container>
      </Section>

      {/* 12 — Journal */}
      <Section tone="sunk">
        <Container size="xl">
          <SectionHeader
            overline="Journal"
            title="Honest guides with real Indore numbers"
            action={
              <Button asChild variant="link">
                <Link href="/journal/">
                  All articles <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            }
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {latest.map((j) => (
              <article
                key={j.slug}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-e1 transition-shadow hover:shadow-e2"
              >
                <Img image={img(j.image)} aspect="16 / 10" sizes="(min-width: 768px) 33vw, 100vw" />
                <div className="flex flex-1 flex-col p-4">
                  <Badge className="self-start">{j.category}</Badge>
                  <h3 className="mt-2 font-display text-h3 text-ink">
                    <Link
                      href={`/journal/${j.slug}/`}
                      className="after:absolute after:inset-0 focus-visible:outline-none"
                    >
                      {j.title}
                    </Link>
                  </h3>
                  <p className="mt-1 line-clamp-2 text-body-s text-ink-muted">{j.excerpt}</p>
                  <p className="mt-auto pt-3 text-caption text-ink-subtle">
                    {j.readingMinutes} min read
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* 13 — Localities */}
      <Section>
        <Container size="xl">
          <SectionHeader
            overline="Where we work"
            title="Across Indore, and a little beyond"
            description={`Home visits and site measurement across ${indoreLocalities.length} Indore neighbourhoods; video consultations and selected projects in ${nearbyCities.map((c) => c.name).join(', ')}.`}
          />
          <ul className="mt-6 flex flex-wrap gap-2">
            {indoreLocalities.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/locations/${l.slug}/`}
                  className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-body-s text-ink transition-colors hover:border-sand hover:bg-surface-sunk focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 14 — Consultation + map */}
      <Section tone="sunk" id="consult">
        <Container size="xl" className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface p-6 shadow-e1 md:p-8">
            <p className="overline">Book a consultation</p>
            <h2 className="mt-2 font-display text-h1 text-ink">
              Forty-five minutes, free, no pitch.
            </h2>
            <p className="mt-3 text-body text-ink-muted">
              Video call, phone, or at the studio in {site.address.line2}. Bring a floor plan or a
              few photos — or nothing at all. We&apos;ll tell you what&apos;s realistic for your
              budget.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/consultation/">Pick a slot</Link>
              </Button>
              <WhatsAppButton message={messages.generic()} label="WhatsApp us" size="lg" />
              <Button asChild size="lg" variant="ghost">
                <a href={`tel:${site.phoneE164}`}>
                  <Phone className="size-4" aria-hidden /> {site.phone}
                </a>
              </Button>
            </div>
            <address className="mt-6 text-body-s text-ink-muted not-italic">
              {site.address.line1}, {site.address.line2}, {site.address.city} {site.address.pincode}
              <br />
              Mon–Sat {site.businessHours.weekdays} · Sun {site.businessHours.sunday.toLowerCase()}
            </address>
          </div>
          <StudioMap className="min-h-[320px]" />
        </Container>
      </Section>

      <CtaBand
        title="Ready when you are."
        description="Start with the visualiser, the estimator, or a conversation — whichever feels easiest."
        primary={{ label: 'Get an estimate', href: '/estimate/' }}
        secondary={{ label: 'See projects', href: '/projects/' }}
        whatsappMessage={messages.generic()}
      />
    </>
  );
}

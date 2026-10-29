import { ArrowRight, Calculator, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProjectCard, ServiceCard, TestimonialCard } from '@/components/cards';
import { Container, Section } from '@/components/layout';
import { BulletList, CtaBand, FactsBar, FaqSection, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge, SectionHeader } from '@/components/ui/display';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { site } from '@/config/site';
import { getLocality, localities, projects, services, testimonials } from '@/data/demo';
import { quickEstimate } from '@/lib/pricing';
import { breadcrumbLd, faqLd, JsonLd, localBusinessLd, serviceLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import { formatInrCompact } from '@/lib/utils';
import { messages } from '@/lib/whatsapp';

export function generateStaticParams() {
  return localities.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = getLocality(slug);
  if (!l) return {};
  return pageMeta({
    title: `Interior designers in ${l.name}${l.kind === 'city' ? '' : ', Indore'}`,
    description: `${l.description.slice(0, 150)}… Local pricing, society considerations and completed projects in ${l.name}.`,
    path: `/locations/${l.slug}/`,
  });
}

export default async function LocalityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = getLocality(slug);
  if (!l) notFound();

  const isCity = l.kind === 'city';
  const local = projects.filter((p) => (isCity ? p.city === l.name : p.locality === l.name));
  const quotes = testimonials.filter((t) => t.locality === l.name).slice(0, 2);
  const nearby = localities
    .filter((x) => x.slug !== l.slug && x.kind === l.kind)
    .sort(
      (a, b) => Math.hypot(a.lat - l.lat, a.lng - l.lng) - Math.hypot(b.lat - l.lat, b.lng - l.lng),
    )
    .slice(0, 4);
  const est2 = quickEstimate({ bhk: '2BHK', tier: 'STANDARD', locality: l.slug });
  const est3 = quickEstimate({ bhk: '3BHK', tier: 'STANDARD', locality: l.slug });
  const whatsapp = messages.locality(l.name);
  const pct = Math.round((l.multiplier - 1) * 100);
  const featuredServices = services.slice(0, 3);

  const faqs = [
    {
      q: `Do you take projects in ${l.name}?`,
      a: isCity
        ? `Yes. We run full-home and commercial projects in ${l.name}, about ${l.distanceKm} km from Indore. Site visits are batched and travel is itemised in the quote.`
        : `Yes — ${l.name} is ${l.distanceKm} km from our Scheme 54 studio, well inside our daily site-visit radius. First site visit is free after a consultation call.`,
    },
    {
      q: `Is pricing different in ${l.name}?`,
      a:
        pct === 0
          ? `No. ${l.name} is priced at our standard Indore rates.`
          : `Slightly. Our estimates apply a ${pct > 0 ? '+' : ''}${pct}% locality adjustment for ${l.name} to reflect ${pct > 0 ? 'logistics, society rules and the finish levels clients here typically choose' : 'easier access and material logistics'}.`,
    },
    {
      q: 'What should I check with my society before starting?',
      a: 'Permitted work hours, lift size limits for boards, debris disposal rules and any refundable interior deposit. We handle the paperwork once you share the society contact.',
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd({ areaServed: { '@type': 'Place', name: `${l.name}, ${l.city}` } }),
          serviceLd({
            name: `Interior design in ${l.name}`,
            description: l.description,
            path: `/locations/${l.slug}/`,
            min: est2.total.low,
            max: est3.total.high,
          }),
          faqLd(faqs),
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Locations', href: '/locations/' },
            { name: l.name, href: `/locations/${l.slug}/` },
          ]),
        ]}
      />
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Locations', href: '/locations/' },
          { label: l.name },
        ]}
        overline={
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />{' '}
            {isCity
              ? `${l.distanceKm} km from Indore`
              : `${l.city} · ${l.distanceKm} km from the studio`}
          </span>
        }
        title={`Interior design in ${l.name}`}
        description={l.description}
        image={local[0]?.heroImage}
        actions={
          <>
            <Button asChild>
              <Link href={`/estimate/?locality=${l.slug}`}>
                <Calculator className="size-4" aria-hidden /> Estimate for {l.name}
              </Link>
            </Button>
            <WhatsAppButton message={whatsapp} label="Ask about my society" variant="outline" />
          </>
        }
      />

      <Section className="pt-0 md:pt-0">
        <Container>
          <FactsBar
            facts={[
              {
                label: 'Typical 2BHK, Standard tier',
                value: `${formatInrCompact(est2.total.low)} – ${formatInrCompact(est2.total.high)}`,
              },
              {
                label: 'Typical 3BHK, Standard tier',
                value: `${formatInrCompact(est3.total.low)} – ${formatInrCompact(est3.total.high)}`,
              },
              {
                label: 'Locality pricing',
                value: pct === 0 ? 'Standard rates' : `${pct > 0 ? '+' : ''}${pct}%`,
              },
              { label: 'PIN codes', value: l.pincodes.join(', ') },
            ]}
          />
        </Container>
      </Section>

      <Section className="pt-0 md:pt-0">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid gap-10">
            <div>
              <h2 className="font-display text-h2 text-ink">What we plan for in {l.name}</h2>
              <p className="mt-2 text-body-s text-ink-muted">
                Site realities we have learned the hard way, so you don&apos;t have to.
              </p>
              <BulletList items={l.considerations} icon="check" />
            </div>
            <div>
              <h2 className="font-display text-h2 text-ink">Homes we typically see here</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {l.propertyTypes.map((t) => (
                  <li key={t}>
                    <Badge tone="outline">{t}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <aside className="grid content-start gap-4 lg:sticky lg:top-28">
            <div className="rounded-lg border border-line bg-surface p-5 shadow-e1">
              <p className="overline">Services in {l.name}</p>
              <ul className="mt-3 grid gap-2">
                {featuredServices.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}/`}
                      className="flex items-center justify-between gap-2 text-body-s text-ink hover:text-accent"
                    >
                      {s.name} <ArrowRight className="size-4 text-ink-subtle" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              <Button asChild variant="link" className="mt-3 px-0">
                <Link href="/services/">All services</Link>
              </Button>
            </div>
            <div className="rounded-lg border border-line bg-surface-sunk p-5 text-body-s text-ink-muted">
              <p className="font-medium text-ink">Studio hours</p>
              <p className="mt-1">
                Mon–Sat {site.businessHours.weekdays}. Site visits in {l.name} are usually scheduled
                for mornings.
              </p>
            </div>
          </aside>
        </Container>
      </Section>

      {local.length > 0 && (
        <Section tone="sunk">
          <Container>
            <SectionHeader overline="Nearby work" title={`Projects in ${l.name}`} />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {local.slice(0, 6).map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {quotes.length > 0 && (
        <Section>
          <Container>
            <SectionHeader overline="Neighbours say" title={`Clients from ${l.name}`} />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {quotes.map((t) => (
                <TestimonialCard key={t.id} t={t} full />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {local.length === 0 && (
        <Section tone="sunk">
          <Container>
            <SectionHeader overline="Popular here" title="Where most clients start" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((s) => (
                <ServiceCard key={s.slug} service={s} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <FaqSection faqs={faqs} title={`Working in ${l.name}`} />

      <Section tone="surface">
        <Container>
          <SectionHeader
            overline="Also nearby"
            title={isCity ? 'Other cities' : 'Neighbouring localities'}
          />
          <ul className="mt-6 flex flex-wrap gap-2">
            {nearby.map((n) => (
              <li key={n.slug}>
                <Badge tone="outline">
                  <Link href={`/locations/${n.slug}/`}>
                    {n.name} · {n.distanceKm} km
                  </Link>
                </Badge>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand
        title={`Planning a home in ${l.name}?`}
        description="Get a locality-adjusted estimate in three minutes, then book a free site visit."
        whatsappMessage={whatsapp}
        primary={{ label: `Estimate for ${l.name}`, href: `/estimate/?locality=${l.slug}` }}
        secondary={{ label: 'Book a site visit', href: '/consultation/' }}
      />
    </>
  );
}

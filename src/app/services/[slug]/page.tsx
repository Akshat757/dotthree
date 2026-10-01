import { ArrowRight, Calculator, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MaterialCard, ProjectCard, ServiceCard } from '@/components/cards';
import { Container, Section } from '@/components/layout';
import { BulletList, CtaBand, FaqSection, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { PriceRange, SectionHeader, Timeline } from '@/components/ui/display';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { getMaterial, getProject, getService, services } from '@/data/demo';
import { breadcrumbLd, faqLd, JsonLd, serviceLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import { messages } from '@/lib/whatsapp';

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return pageMeta({
    title: `${s.name} in Indore`,
    description: s.tagline,
    path: `/services/${s.slug}/`,
    image: `/og/services/${s.slug}.png`,
  });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  const projs = s.projectSlugs.map(getProject).filter((p) => p !== undefined);
  const mats = s.materialSlugs.map(getMaterial).filter((m) => m !== undefined);
  const others = services.filter((x) => x.slug !== s.slug).slice(0, 3);
  const whatsapp = messages.service(s.name);
  const [tMin, tMax] = s.timelineWeeks;

  return (
    <>
      <JsonLd
        data={[
          serviceLd({
            name: s.name,
            description: s.description,
            path: `/services/${s.slug}/`,
            image: `/og/services/${s.slug}.png`,
            min: s.costBand.min,
            max: s.costBand.max,
          }),
          faqLd(s.faqs),
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Services', href: '/services/' },
            { name: s.name, href: `/services/${s.slug}/` },
          ]),
        ]}
      />
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services/' },
          { label: s.shortName },
        ]}
        overline="Service"
        title={s.name}
        description={s.tagline}
        image={s.heroImage}
        actions={
          <>
            <WhatsAppButton message={whatsapp} label="Ask about this" />
            <Button asChild variant="outline">
              <Link href="/estimate/">
                <Calculator className="size-4" aria-hidden /> Estimate it
              </Link>
            </Button>
          </>
        }
        className="pb-8"
      />

      <Section className="pt-0 md:pt-0">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid gap-10">
            <p className="prose-measure text-body-l text-ink-muted">{s.description}</p>
            <div>
              <h2 className="font-display text-h2 text-ink">What's included</h2>
              <BulletList className="mt-5" items={s.inclusions} columns={2} />
            </div>
            <div>
              <h2 className="font-display text-h2 text-ink">How it runs</h2>
              <Timeline
                className="mt-6"
                items={s.process.map((st, i) => ({
                  id: `${s.slug}-${i}`,
                  title: st.step,
                  body: st.detail,
                  tone: i === 0 ? 'accent' : 'neutral',
                }))}
              />
            </div>
          </div>
          <aside className="grid content-start gap-4 lg:sticky lg:top-28">
            <div className="rounded-lg border border-line bg-surface p-5 shadow-e1">
              <p className="overline">Typical cost</p>
              <PriceRange
                low={s.costBand.min}
                high={s.costBand.max}
                unit={s.costBand.unit}
                size="lg"
                className="mt-1 block"
              />
              <p className="mt-2 text-caption text-ink-muted">{s.costBand.note}</p>
              <p className="mt-4 flex items-center gap-2 text-body-s text-ink">
                <Clock className="size-4 text-ink-muted" aria-hidden />
                {tMin === tMax ? `${tMin} weeks` : `${tMin}–${tMax} weeks`} on site
              </p>
              <Button asChild className="mt-5" fullWidth>
                <Link href="/estimate/">Get a line-item estimate</Link>
              </Button>
              <Button asChild className="mt-2" fullWidth variant="outline">
                <Link href="/consultation/">Book a consultation</Link>
              </Button>
            </div>
          </aside>
        </Container>
      </Section>

      {projs.length > 0 && (
        <Section tone="sunk">
          <Container>
            <SectionHeader
              overline="Recent work"
              title={`${s.shortName} projects`}
              action={
                <Button asChild variant="link">
                  <Link href="/projects/">
                    All projects <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              }
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projs.slice(0, 3).map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {mats.length > 0 && (
        <Section>
          <Container>
            <SectionHeader
              overline="Materials we reach for"
              title="Finishes that suit this scope"
            />
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {mats.slice(0, 6).map((m) => (
                <MaterialCard key={m.slug} material={m} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section tone="sunk">
        <Container size="lg">
          <FaqSection faqs={s.faqs} title={`${s.shortName}: questions we get`} />
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader overline="Other services" title="Often paired with this" />
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {others.map((o) => (
              <ServiceCard key={o.slug} service={o} compact />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        title={`Thinking about ${s.shortName.toLowerCase()}?`}
        description="Tell us the room and the rough size on WhatsApp and we'll come back with a realistic range the same day."
        whatsappMessage={whatsapp}
      />
    </>
  );
}

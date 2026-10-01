import { ArrowRight, Calculator, Ruler } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MaterialCard, ProjectCard, RoomCard } from '@/components/cards';
import { Container, Section } from '@/components/layout';
import { BulletList, CtaBand, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { PriceRange, SectionHeader } from '@/components/ui/display';
import { getMaterial, getProject, getRoomGuide, roomGuides } from '@/data/demo';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';

export function generateStaticParams() {
  return roomGuides.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRoomGuide(slug);
  if (!r) return {};
  return pageMeta({
    title: `${r.name} Interior Design — Costs, Sizes & Mistakes to Avoid`,
    description: r.tagline,
    path: `/rooms/${r.slug}/`,
    image: `/og/rooms/${r.slug}.png`,
  });
}

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRoomGuide(slug);
  if (!r) notFound();

  const mats = r.materialSlugs.map(getMaterial).filter((m) => m !== undefined);
  const projs = r.projectSlugs.map(getProject).filter((p) => p !== undefined);
  const others = roomGuides.filter((x) => x.slug !== r.slug).slice(0, 3);
  const estimateHref = `/estimate/?rooms=${encodeURIComponent(r.estimatorScope.join(','))}`;

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Rooms', href: '/rooms/' },
          { name: r.name, href: `/rooms/${r.slug}/` },
        ])}
      />
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Rooms', href: '/rooms/' },
          { label: r.name },
        ]}
        overline="Room guide"
        title={r.name}
        description={r.tagline}
        image={r.heroImage}
        actions={
          <>
            <Button asChild>
              <Link href={estimateHref}>
                <Calculator className="size-4" aria-hidden /> Estimate this room
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/projects/?room=${r.roomType}`}>
                See {r.name.toLowerCase()} projects <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </>
        }
        className="pb-8"
      />

      <Section className="pt-0 md:pt-0">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid gap-10">
            <p className="prose-measure text-body-l text-ink-muted">{r.description}</p>
            <div>
              <h2 className="font-display text-h2 text-ink">Decide these first</h2>
              <BulletList className="mt-5" items={r.considerations} icon="dot" />
            </div>
            <div>
              <h2 className="font-display text-h2 text-ink">Where the storage goes</h2>
              <BulletList className="mt-5" items={r.storageStrategies} />
            </div>
            <div>
              <h2 className="font-display text-h2 text-ink">Mistakes we keep fixing</h2>
              <BulletList className="mt-5" items={r.commonMistakes} icon="x" />
            </div>
          </div>
          <aside className="grid content-start gap-4 lg:sticky lg:top-28">
            <div className="rounded-lg border border-line bg-surface p-5 shadow-e1">
              <p className="overline">Typical Indore cost</p>
              <PriceRange
                low={r.costBand.min}
                high={r.costBand.max}
                size="lg"
                className="mt-1 block"
              />
              <p className="mt-2 text-caption text-ink-muted">
                Complete room, Standard to Premium finish, excluding civil work and GST.
              </p>
              <p className="mt-4 flex items-start gap-2 text-body-s text-ink">
                <Ruler className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden />
                <span>
                  <span className="text-ink-muted">Typical size · </span>
                  {r.typicalDimensions}
                </span>
              </p>
              <Button asChild className="mt-5" fullWidth>
                <Link href={estimateHref}>Run the numbers for my {r.name.toLowerCase()}</Link>
              </Button>
            </div>
          </aside>
        </Container>
      </Section>

      {mats.length > 0 && (
        <Section tone="sunk">
          <Container>
            <SectionHeader
              overline="Materials that hold up"
              title={`What we specify for ${r.name.toLowerCase()}s`}
              action={
                <Button asChild variant="link">
                  <Link href="/materials/">
                    Full catalogue <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              }
            />
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {mats.slice(0, 6).map((m) => (
                <MaterialCard key={m.slug} material={m} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {projs.length > 0 && (
        <Section>
          <Container>
            <SectionHeader overline="In practice" title={`${r.name}s we've built`} />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projs.slice(0, 3).map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section tone="sunk">
        <Container>
          <SectionHeader overline="Other rooms" title="Keep planning" />
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {others.map((o) => (
              <RoomCard key={o.slug} room={o} />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        title={`Ready to plan your ${r.name.toLowerCase()}?`}
        description="Start with the estimator — it pre-selects this room — or send us a photo of the space on WhatsApp."
        primary={{ label: 'Estimate this room', href: estimateHref }}
      />
    </>
  );
}

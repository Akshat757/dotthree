import { ArrowRight, Palette } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  BUDGET_BAND_LABEL,
  MaterialCard,
  ProjectCard,
  roomLabel,
  StyleCard,
} from '@/components/cards';
import { Container, Section } from '@/components/layout';
import { BulletList, CtaBand, FactsBar, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge, SectionHeader } from '@/components/ui/display';
import { Img } from '@/components/ui/img';
import { getMaterial, getProject, getStyle, styles } from '@/data/demo';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import { titleCase } from '@/lib/utils';

export function generateStaticParams() {
  return styles.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getStyle(slug);
  if (!s) return {};
  return pageMeta({
    title: `${s.name} Interior Style — Guide for Indian Homes`,
    description: s.tagline,
    path: `/styles/${s.slug}/`,
    image: `/og/styles/${s.slug}.png`,
  });
}

export default async function StylePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getStyle(slug);
  if (!s) notFound();

  const palette = s.paletteMaterialSlugs.map(getMaterial).filter((m) => m !== undefined);
  const typical = s.typicalMaterialSlugs.map(getMaterial).filter((m) => m !== undefined);
  const projs = s.projectSlugs.map(getProject).filter((p) => p !== undefined);
  const siblings = styles.filter((x) => x.slug !== s.slug && x.styleBucket === s.styleBucket);
  const others = (siblings.length ? siblings : styles.filter((x) => x.slug !== s.slug)).slice(0, 4);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Styles', href: '/styles/' },
          { name: s.name, href: `/styles/${s.slug}/` },
        ])}
      />
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Styles', href: '/styles/' },
          { label: s.name },
        ]}
        overline="Style guide"
        title={s.name}
        description={s.tagline}
        image={s.heroImage}
        actions={
          <>
            <Button asChild>
              <Link href={`/projects/?style=${s.slug}`}>
                See {s.name} projects <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/visualiser/">
                <Palette className="size-4" aria-hidden /> Try it on a room
              </Link>
            </Button>
          </>
        }
        className="pb-8"
      />

      <Section className="pt-0 md:pt-0">
        <Container>
          <FactsBar
            facts={[
              { label: 'Typical budget', value: BUDGET_BAND_LABEL[s.budgetBand] },
              { label: 'Family', value: titleCase(s.styleBucket.replace(/-/g, ' ')) },
              { label: 'Best rooms', value: s.bestRooms.map(roomLabel).slice(0, 3).join(', ') },
              { label: 'Projects', value: String(projs.length) },
            ]}
            className="lg:grid-cols-4"
          />
        </Container>
      </Section>

      <Section className="pt-0 md:pt-0">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid gap-10">
            <p className="prose-measure text-body-l text-ink-muted">{s.description}</p>
            <div>
              <h2 className="font-display text-h2 text-ink">What defines it</h2>
              <BulletList className="mt-5" items={s.characteristics} icon="dot" />
            </div>
            <div>
              <h2 className="font-display text-h2 text-ink">Where it shines</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.bestRooms.map((r) => (
                  <Badge key={r} tone="outline">
                    <Link href={`/projects/?style=${s.slug}&room=${r}`}>{roomLabel(r)}</Link>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {palette.length > 0 && (
            <aside className="lg:sticky lg:top-28">
              <div className="rounded-lg border border-line bg-surface p-5 shadow-e1">
                <p className="overline">Signature palette</p>
                <ul className="mt-4 grid grid-cols-5 gap-2">
                  {palette.map((m) => (
                    <li key={m.slug}>
                      <Link
                        href={`/materials/${m.slug}/`}
                        className="group block focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none"
                        title={m.name}
                      >
                        <Img
                          image={m.swatch}
                          sizes="64px"
                          alt={m.name}
                          aspect="1 / 1"
                          className="rounded-md ring-1 ring-line transition-transform group-hover:scale-105"
                          imgClassName="size-full object-cover"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="mt-4 grid gap-1.5 text-body-s">
                  {palette.map((m) => (
                    <li key={m.slug} className="flex items-center gap-2 text-ink-muted">
                      {m.hex && (
                        <span
                          className="size-3 rounded-full ring-1 ring-line"
                          style={{ background: m.hex }}
                          aria-hidden
                        />
                      )}
                      <span className="truncate">{m.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </Container>
      </Section>

      {typical.length > 0 && (
        <Section tone="sunk">
          <Container>
            <SectionHeader
              overline="Materials"
              title={`What ${s.name} is usually made of`}
              action={
                <Button asChild variant="link">
                  <Link href="/materials/">
                    Full catalogue <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              }
            />
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {typical.slice(0, 6).map((m) => (
                <MaterialCard key={m.slug} material={m} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {projs.length > 0 && (
        <Section>
          <Container>
            <SectionHeader
              overline="In practice"
              title={`${s.name} homes we've done`}
              action={
                <Button asChild variant="link">
                  <Link href={`/projects/?style=${s.slug}`}>
                    All {s.name} projects <ArrowRight className="size-4" aria-hidden />
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

      <Section tone="sunk">
        <Container>
          <SectionHeader
            overline="Related styles"
            title={siblings.length ? 'From the same family' : 'You might also like'}
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((o) => (
              <StyleCard key={o.slug} style={o} />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        title={`Want a ${s.name} home?`}
        description="Tell us your BHK and locality; we'll show you what this style costs at each finish tier before any site visit."
      />
    </>
  );
}

import { ArrowDown, ArrowRight, Droplets, Flame, Palette, ShieldCheck, Wrench } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MaterialCard, ProjectCard, roomLabel } from '@/components/cards';
import { Container, Section } from '@/components/layout';
import { CtaBand, FactsBar, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge, PriceRange, SectionHeader } from '@/components/ui/display';
import { Img } from '@/components/ui/img';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { getMaterial, materials, projects, substituteChain } from '@/data/demo';
import { categoryLabel, surfaceLabel } from '@/lib/materials/labels';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import { titleCase } from '@/lib/utils';
import { messages } from '@/lib/whatsapp';

export function generateStaticParams() {
  return materials.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getMaterial(slug);
  if (!m) return {};
  return pageMeta({
    title: `${m.name}${m.brand ? ` by ${m.brand}` : ''} — ${categoryLabel(m.category)} price in Indore`,
    description:
      m.description ??
      `${m.name}: ${titleCase(m.tier)} tier ${categoryLabel(m.category).toLowerCase()} for ${m.usageSurfaces.map(surfaceLabel).join(', ').toLowerCase()}. Indore price range, durability and cheaper alternatives.`,
    path: `/materials/${m.slug}/`,
  });
}

export default async function MaterialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getMaterial(slug);
  if (!m) notFound();

  const cheaper = substituteChain(m.slug);
  const pricier = m.substituteForSlug ? getMaterial(m.substituteForSlug) : undefined;
  const usedIn = projects.filter((p) => p.materialSlugs.includes(m.slug)).slice(0, 3);
  const similar = materials
    .filter((x) => x.slug !== m.slug && x.category === m.category)
    .sort(
      (a, b) =>
        Math.abs((a.price?.min ?? 0) - (m.price?.min ?? 0)) -
        Math.abs((b.price?.min ?? 0) - (m.price?.min ?? 0)),
    )
    .slice(0, 6);
  const whatsapp = messages.material({ name: m.name, unit: m.price?.unit });

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Materials', href: '/materials/' },
          { name: m.name, href: `/materials/${m.slug}/` },
        ])}
      />
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Materials', href: '/materials/' },
          { label: m.name },
        ]}
        overline={
          <>
            <Link href={`/materials/?category=${m.category}`} className="hover:text-accent">
              {categoryLabel(m.category)}
            </Link>
            {m.brand && <> · {m.brand}</>}
            {m.productCode && <> · {m.productCode}</>}
          </>
        }
        title={m.name}
        description={
          m.description ??
          `A ${titleCase(m.tier).toLowerCase()}-tier ${categoryLabel(m.category).toLowerCase()} we specify for ${m.usageSurfaces.slice(0, 2).map(surfaceLabel).join(' and ').toLowerCase()}.`
        }
        image={m.swatch}
        actions={
          <>
            <WhatsAppButton message={whatsapp} label="Ask about availability" />
            <Button asChild variant="outline">
              <Link href="/visualiser/">
                <Palette className="size-4" aria-hidden /> Try in visualiser
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
              {
                label: 'Indore price',
                value: m.price ? (
                  <PriceRange low={m.price.min} high={m.price.max} unit={m.price.unit} size="sm" />
                ) : (
                  'On request'
                ),
              },
              { label: 'Tier', value: titleCase(m.tier) },
              { label: 'Finish', value: m.finish ? titleCase(m.finish) : '—' },
              { label: 'Durability', value: m.durability ? `${m.durability}/5` : '—' },
              { label: 'Maintenance', value: m.maintenance ? titleCase(m.maintenance) : '—' },
              {
                label: 'Availability',
                value: m.availability
                  ? titleCase(m.availability.replace('_INDORE', ' (Indore)'))
                  : '—',
              },
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {m.waterResistant && (
              <Badge tone="forest">
                <Droplets className="mr-1 size-3" aria-hidden /> Water resistant
              </Badge>
            )}
            {m.heatResistant && (
              <Badge tone="forest">
                <Flame className="mr-1 size-3" aria-hidden /> Heat resistant
              </Badge>
            )}
            {m.warranty && (
              <Badge tone="gold">
                <ShieldCheck className="mr-1 size-3" aria-hidden /> {m.warranty}
              </Badge>
            )}
            {m.tonality && <Badge>{titleCase(m.tonality)}</Badge>}
            {m.hex && (
              <Badge tone="outline">
                <span
                  className="mr-1.5 inline-block size-3 rounded-full ring-1 ring-line"
                  style={{ background: m.hex }}
                  aria-hidden
                />
                {m.hex.toUpperCase()}
              </Badge>
            )}
          </div>
        </Container>
      </Section>

      <Section className="pt-0 md:pt-0">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid gap-10">
            {m.texture && (
              <div>
                <h2 className="font-display text-h2 text-ink">Texture at scale</h2>
                <p className="mt-2 text-body-s text-ink-muted">
                  One tile ≈ {m.texture.scaleCm} cm. This is the pattern the visualiser maps onto
                  your walls and floors.
                </p>
                <div
                  role="img"
                  aria-label={`${m.name} texture repeated`}
                  className="mt-4 h-56 w-full rounded-lg border border-line bg-surface-sunk"
                  style={{
                    backgroundImage: `url(${m.texture.albedo}.webp)`,
                    backgroundSize: '160px 160px',
                  }}
                />
                {m.texture.credit.source !== 'original' && (
                  <p className="mt-2 text-caption text-ink-subtle">
                    Texture: {m.texture.credit.source} · {m.texture.credit.licence.toUpperCase()}
                    {m.texture.procedural && ' · procedural approximation'}
                  </p>
                )}
              </div>
            )}
            <div>
              <h2 className="font-display text-h2 text-ink">Where it works</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="overline">Surfaces</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {m.usageSurfaces.map((s) => (
                      <li key={s}>
                        <Badge tone="outline">
                          <Link href={`/materials/?surface=${s}`}>{surfaceLabel(s)}</Link>
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="overline">Rooms</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {m.usageRooms.map((r) => (
                      <li key={r}>
                        <Badge tone="outline">
                          <Link href={`/materials/?room=${r}`}>{roomLabel(r)}</Link>
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {m.sustainability && (
              <div>
                <h2 className="font-display text-h2 text-ink">Sustainability</h2>
                <p className="prose-measure mt-3 text-body text-ink-muted">{m.sustainability}</p>
              </div>
            )}
          </div>

          <aside className="grid content-start gap-4 lg:sticky lg:top-28">
            {(cheaper.length > 0 || pricier) && (
              <div className="rounded-lg border border-line bg-surface p-5 shadow-e1">
                <p className="overline">Budget ladder</p>
                <p className="mt-1 text-body-s text-ink-muted">
                  Same look, different price points.
                </p>
                <ol className="mt-4 grid gap-2">
                  {pricier && <LadderRow m={pricier} tag="Step up" />}
                  <LadderRow m={m} current />
                  {cheaper.map((c, i) => (
                    <LadderRow key={c.slug} m={c} tag={i === 0 ? 'Save with' : undefined} />
                  ))}
                </ol>
              </div>
            )}
            <div className="rounded-lg border border-line bg-surface-sunk p-5">
              <p className="flex items-center gap-2 text-body-s font-medium text-ink">
                <Wrench className="size-4 text-ink-muted" aria-hidden /> Need it for a specific job?
              </p>
              <p className="mt-1 text-body-s text-ink-muted">
                Rates above are material only. Add it to an estimate to see installed cost with
                labour and wastage.
              </p>
              <Button asChild className="mt-4" fullWidth variant="outline">
                <Link href="/estimate/">
                  Build an estimate <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </aside>
        </Container>
      </Section>

      {usedIn.length > 0 && (
        <Section tone="sunk">
          <Container>
            <SectionHeader overline="Seen in" title="Projects using this finish" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {usedIn.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {similar.length > 0 && (
        <Section>
          <Container>
            <SectionHeader
              overline="Alternatives"
              title={`Other ${categoryLabel(m.category).toLowerCase()}`}
              action={
                <Button asChild variant="link">
                  <Link href={`/materials/?category=${m.category}`}>
                    All {categoryLabel(m.category).toLowerCase()}{' '}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              }
            />
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {similar.map((x) => (
                <MaterialCard key={x.slug} material={x} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CtaBand
        title={`Want ${m.name} in your home?`}
        description="We'll confirm current stock and landed price in Indore, and tell you honestly if a cheaper option would look the same."
        whatsappMessage={whatsapp}
      />
    </>
  );
}

function LadderRow({
  m,
  tag,
  current,
}: {
  m: NonNullable<ReturnType<typeof getMaterial>>;
  tag?: string;
  current?: boolean;
}) {
  const inner = (
    <>
      <Img
        image={m.swatch}
        sizes="40px"
        alt=""
        className="size-10 shrink-0 rounded-md"
        imgClassName="size-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-s font-medium text-ink">{m.name}</p>
        <p className="tabular text-caption text-ink-muted">
          {m.price ? (
            <PriceRange
              low={m.price.min}
              high={m.price.max}
              unit={m.price.unit}
              size="sm"
              className="text-caption"
            />
          ) : (
            titleCase(m.tier)
          )}
        </p>
      </div>
      {tag && (
        <span className="inline-flex items-center gap-1 text-caption text-ink-muted">
          <ArrowDown
            className={current ? '' : tag === 'Step up' ? 'size-3 rotate-180' : 'size-3'}
            aria-hidden
          />{' '}
          {tag}
        </span>
      )}
    </>
  );
  return (
    <li
      className={
        current
          ? 'flex items-center gap-3 rounded-md border border-accent bg-accent-soft/40 p-2'
          : ''
      }
    >
      {current ? (
        inner
      ) : (
        <Link
          href={`/materials/${m.slug}/`}
          className="flex items-center gap-3 rounded-md border border-line p-2 transition-colors hover:border-sand hover:bg-surface-sunk"
        >
          {inner}
        </Link>
      )}
    </li>
  );
}

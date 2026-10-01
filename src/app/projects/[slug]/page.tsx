import { ArrowRight, Calculator, Palette } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  BUDGET_BAND_LABEL,
  DesignerCard,
  MaterialCard,
  ProjectCard,
  PROPERTY_LABEL,
  roomLabel,
  TestimonialCard,
} from '@/components/cards';
import { Container, Section } from '@/components/layout';
import { ProjectGallery } from '@/components/projects/gallery';
import { CtaBand, FactsBar, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge, SectionHeader } from '@/components/ui/display';
import { Img } from '@/components/ui/img';
import { BeforeAfterSlider } from '@/components/ui/media';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import {
  getDesigner,
  getMaterial,
  getProject,
  getStyle,
  projects,
  testimonials,
} from '@/data/demo';
import { relatedProjects } from '@/lib/projects/filters';
import { breadcrumbLd, creativeWorkLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import { messages } from '@/lib/whatsapp';
import { formatInrCompact, formatSqft, titleCase } from '@/lib/utils';
import type { BeforeAfterPair, SurfaceType } from '@/types/content';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return pageMeta({
    title:
      p.seo?.title ??
      `${p.title} — ${p.bhk ?? PROPERTY_LABEL[p.propertyType]} interiors in ${p.locality ?? p.city}`,
    description: p.seo?.description ?? p.brief,
    path: `/projects/${p.slug}/`,
    image: `/og/projects/${p.slug}.png`,
    type: 'article',
  });
}

const BA_LABELS: Record<BeforeAfterPair['mode'], [string, string]> = {
  'before-after': ['Before', 'After'],
  'render-vs-built': ['3D render', 'As built'],
  'day-vs-night': ['Day', 'Night'],
  'essential-vs-premium': ['Essential', 'Premium'],
  'layout-old-vs-new': ['Old layout', 'New layout'],
};

const SURFACE_LABEL: Partial<Record<SurfaceType, string>> = {
  WALL: 'Walls',
  ACCENT_WALL: 'Accent wall',
  CEILING: 'Ceiling',
  FLOOR: 'Flooring',
  CABINET_UPPER: 'Upper cabinets',
  CABINET_LOWER: 'Lower cabinets',
  WARDROBE: 'Wardrobe shutters',
  COUNTERTOP: 'Countertop',
  BACKSPLASH: 'Backsplash',
  CURTAIN: 'Curtains',
  UPHOLSTERY: 'Upholstery',
  WALL_PANEL: 'Wall panelling',
  DOOR: 'Doors',
  WINDOW_FRAME: 'Window frames',
  BATH_TILE: 'Bathroom tiles',
  RUG: 'Rug',
  LIGHT_FIXTURE: 'Lighting',
};

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const styleGuides = p.styles.map(getStyle).filter((s) => s !== undefined);
  const materials = p.materialSlugs.map(getMaterial).filter((m) => m !== undefined);
  const team = p.designerSlugs.map(getDesigner).filter((d) => d !== undefined);
  const testimonial = testimonials.find(
    (t) => t.id === p.testimonialId || t.projectSlug === p.slug,
  );
  const related = relatedProjects(projects, p, 3);
  const palette = Object.entries(p.palette ?? {})
    .map(([surface, mslug]) => ({ surface: surface as SurfaceType, material: getMaterial(mslug) }))
    .filter((e) => e.material !== undefined);
  const whatsapp = messages.project({ title: p.title, bhk: p.bhk, locality: p.locality });

  const facts = [
    { label: 'Type', value: `${p.bhk ? `${p.bhk} ` : ''}${PROPERTY_LABEL[p.propertyType]}` },
    { label: 'Location', value: [p.locality, p.city].filter(Boolean).join(', ') },
    ...(p.carpetAreaSqft ? [{ label: 'Carpet area', value: formatSqft(p.carpetAreaSqft) }] : []),
    {
      label: 'Budget',
      value: p.budgetInr ? `≈ ${formatInrCompact(p.budgetInr)}` : BUDGET_BAND_LABEL[p.budgetBand],
    },
    ...(p.durationWeeks ? [{ label: 'Duration', value: `${p.durationWeeks} weeks` }] : []),
    {
      label: 'Completed',
      value: p.completedOn
        ? new Date(p.completedOn).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        : '—',
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          creativeWorkLd({
            name: p.title,
            description: p.brief,
            path: `/projects/${p.slug}/`,
            image: `/og/projects/${p.slug}.png`,
            dateCreated: p.completedOn,
            keywords: [...p.styles, ...p.roomTypes, p.propertyType.toLowerCase(), p.city],
          }),
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Projects', href: '/projects/' },
            { name: p.title, href: `/projects/${p.slug}/` },
          ]),
        ]}
      />

      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects/' },
          { label: p.title },
        ]}
        overline={
          <>
            {p.nature === 'RENOVATION' ? 'Renovation' : 'New interiors'} · {p.locality ?? p.city}
          </>
        }
        title={p.title}
        description={p.brief}
        image={p.heroImage}
        actions={
          <>
            <WhatsAppButton message={whatsapp} label="I want something like this" />
            <Button asChild variant="outline">
              <Link
                href={`/estimate/?${new URLSearchParams({
                  ...(p.bhk ? { bhk: p.bhk } : {}),
                  ...(p.carpetAreaSqft ? { sqft: String(p.carpetAreaSqft) } : {}),
                }).toString()}`}
              >
                <Calculator className="size-4" aria-hidden /> Estimate my version
              </Link>
            </Button>
          </>
        }
        className="pb-8"
      />

      <Section className="pt-0 pb-10 md:pt-0 md:pb-12">
        <Container>
          <FactsBar facts={facts} />
          <div className="mt-4 flex flex-wrap gap-2">
            {styleGuides.map((s) => (
              <Badge key={s.slug} tone="accent">
                <Link href={`/styles/${s.slug}/`}>{s.name}</Link>
              </Badge>
            ))}
            {p.roomTypes.map((r) => (
              <Badge key={r}>{roomLabel(r)}</Badge>
            ))}
            {p.vastuAligned && <Badge tone="forest">Vastu-aligned</Badge>}
            {p.compactHome && <Badge tone="gold">Compact home</Badge>}
            {p.jointFamily && <Badge tone="gold">Joint family</Badge>}
          </div>
        </Container>
      </Section>

      {/* Story */}
      <Section className="pt-0 md:pt-0">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid gap-8">
            <Story heading="The challenge" body={p.challenge} />
            <Story heading="What we did" body={p.solution} />
          </div>
          <aside className="grid content-start gap-6">
            {p.designerNote && team[0] && (
              <figure className="rounded-lg border border-line bg-surface-sunk p-5">
                <blockquote className="font-display text-h3 text-ink">
                  “{p.designerNote}”
                </blockquote>
                <figcaption className="mt-3 flex items-center gap-3">
                  <Img
                    image={team[0].photo}
                    sizes="40px"
                    alt=""
                    className="size-10 rounded-full"
                    imgClassName="size-full object-cover"
                  />
                  <div>
                    <p className="text-body-s font-medium text-ink">{team[0].name}</p>
                    <p className="text-caption text-ink-muted">{team[0].role}</p>
                  </div>
                </figcaption>
              </figure>
            )}
            {palette.length > 0 && (
              <div className="rounded-lg border border-line bg-surface p-5">
                <p className="overline">Get this look</p>
                <ul className="mt-3 grid gap-2.5">
                  {palette.map(({ surface, material }) => (
                    <li key={surface} className="flex items-center gap-3">
                      <Img
                        image={material!.swatch}
                        sizes="36px"
                        alt=""
                        className="size-9 shrink-0 rounded-md"
                        imgClassName="size-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-caption text-ink-muted">
                          {SURFACE_LABEL[surface] ?? titleCase(surface)}
                        </p>
                        <Link
                          href={`/materials/${material!.slug}/`}
                          className="block truncate text-body-s font-medium text-ink hover:text-accent"
                        >
                          {material!.name}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
                {p.roomTemplateSlug && (
                  <Button asChild className="mt-4" fullWidth>
                    <Link
                      href={`/visualiser/edit/?template=${p.roomTemplateSlug}&preset=${p.slug}`}
                    >
                      <Palette className="size-4" aria-hidden /> Try this palette on a room
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </aside>
        </Container>
      </Section>

      {/* Gallery */}
      <Section tone="sunk">
        <Container>
          <SectionHeader overline="Gallery" title={`${p.images.length} photographs`} />
          <div className="mt-6">
            <ProjectGallery images={p.images} title={p.title} />
          </div>
        </Container>
      </Section>

      {/* Before / after */}
      {p.beforeAfters.length > 0 && (
        <Section>
          <Container>
            <SectionHeader
              overline={p.nature === 'RENOVATION' ? 'Before & after' : 'Render vs built'}
              title={p.nature === 'RENOVATION' ? 'What changed' : 'What we promised, what we built'}
              description="Drag the handle to compare."
            />
            <div className={p.beforeAfters.length > 1 ? 'mt-8 grid gap-6 md:grid-cols-2' : 'mt-8'}>
              {p.beforeAfters.map((ba) => (
                <figure key={ba.id}>
                  <BeforeAfterSlider
                    before={<Img image={ba.before} sizes="(min-width: 768px) 50vw, 100vw" />}
                    after={<Img image={ba.after} sizes="(min-width: 768px) 50vw, 100vw" />}
                    beforeLabel={BA_LABELS[ba.mode][0]}
                    afterLabel={BA_LABELS[ba.mode][1]}
                    className="aspect-[4/3]"
                  />
                  {ba.label && (
                    <figcaption className="mt-2 text-body-s text-ink-muted">{ba.label}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <Section tone="sunk">
          <Container>
            <SectionHeader
              overline="Materials used"
              title="What it's made of"
              description="Every finish here is in our catalogue with current Indore pricing."
              action={
                <Button asChild variant="link">
                  <Link href="/materials/">
                    Browse all materials <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              }
            />
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {materials.slice(0, 12).map((m) => (
                <MaterialCard key={m.slug} material={m} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Team + testimonial */}
      <Section>
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader
              overline="Design team"
              title={team.length > 1 ? 'Who designed it' : 'Designed by'}
            />
            <div className="mt-6 grid gap-4">
              {team.map((d) => (
                <DesignerCard key={d.slug} designer={d} />
              ))}
            </div>
          </div>
          <div>
            <SectionHeader
              overline="Client"
              title={testimonial ? 'In their words' : 'Want to hear from clients?'}
            />
            <div className="mt-6">
              {testimonial ? (
                <TestimonialCard t={testimonial} full />
              ) : (
                <p className="text-body text-ink-muted">
                  This client preferred not to be quoted.{' '}
                  <Link href="/testimonials/" className="text-accent hover:underline">
                    Read other reviews →
                  </Link>
                </p>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Related */}
      {related.length > 0 && (
        <Section tone="sunk">
          <Container>
            <SectionHeader
              overline="Similar projects"
              title="You might also like"
              action={
                <Button asChild variant="link">
                  <Link
                    href={`/projects/?${new URLSearchParams(p.bhk ? { bhk: p.bhk } : { propertyType: p.propertyType }).toString()}`}
                  >
                    More like this <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              }
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ProjectCard key={r.slug} project={r} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CtaBand
        title={`Planning a ${p.bhk ?? PROPERTY_LABEL[p.propertyType].toLowerCase()} of your own?`}
        description="Start with a free estimate — it takes three minutes — or send us this project on WhatsApp and we'll talk through what it would take."
        whatsappMessage={whatsapp}
      />
    </>
  );
}

function Story({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <h2 className="font-display text-h2 text-ink">{heading}</h2>
      <p className="prose-measure mt-3 text-body-l text-ink-muted">{body}</p>
    </div>
  );
}

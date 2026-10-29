import { CalendarDays, Languages, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DesignerCard, ProjectCard, TestimonialCard } from '@/components/cards';
import { Container, Section } from '@/components/layout';
import { BulletList, CtaBand, FactsBar, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge, SectionHeader } from '@/components/ui/display';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { designers, getDesigner, getProject, getStyle, testimonials } from '@/data/demo';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import { absUrl } from '@/lib/seo/jsonld';
import { messages } from '@/lib/whatsapp';
import type { Weekday } from '@/types/content';

const DAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export function generateStaticParams() {
  return designers.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDesigner(slug);
  if (!d) return {};
  return pageMeta({
    title: `${d.name} — ${d.role}`,
    description: `${d.name}, ${d.role.toLowerCase()} at Dot 3 Design Studio, Indore. ${d.experienceYears} years' experience in ${d.specialisations.slice(0, 2).join(' and ').toLowerCase()}.`,
    path: `/studio/${d.slug}/`,
  });
}

export default async function DesignerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDesigner(slug);
  if (!d) notFound();

  const projs = d.projectSlugs.map(getProject).filter((p) => p !== undefined);
  const styleList = d.styles.map(getStyle).filter((s) => s !== undefined);
  const quotes = testimonials.filter((t) => t.designerSlug === d.slug).slice(0, 2);
  const colleagues = designers.filter((x) => x.slug !== d.slug).slice(0, 3);
  const whatsapp = messages.designer(d.name);
  const slotRange = (slots: string[]) =>
    slots.length ? `${slots[0]}–${slots[slots.length - 1]}` : 'Off';

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: d.name,
            jobTitle: d.role,
            url: absUrl(`/studio/${d.slug}/`),
            worksFor: { '@type': 'Organization', name: 'Dot 3 Design Studio' },
            knowsLanguage: d.languages,
            knowsAbout: d.specialisations,
          },
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Studio', href: '/studio/' },
            { name: d.name, href: `/studio/${d.slug}/` },
          ]),
        ]}
      />
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Studio', href: '/studio/' },
          { label: d.name },
        ]}
        overline={d.role}
        title={d.name}
        description={d.philosophy ? <q className="italic">{d.philosophy}</q> : undefined}
        image={d.photo}
        actions={
          <>
            <Button asChild>
              <Link href={`/consultation/?designer=${d.slug}`}>
                <CalendarDays className="size-4" aria-hidden /> Book with {d.name.split(' ')[0]}
              </Link>
            </Button>
            <WhatsAppButton message={whatsapp} label="Say hello" variant="outline" />
          </>
        }
      />

      <Section className="pt-0 md:pt-0">
        <Container>
          <FactsBar
            facts={[
              { label: 'Experience', value: `${d.experienceYears} years` },
              { label: 'Projects on site', value: projs.length },
              { label: 'Works in', value: d.cities.join(', ') },
              { label: 'Speaks', value: d.languages.join(', ') },
            ]}
          />
        </Container>
      </Section>

      <Section className="pt-0 md:pt-0">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid gap-10">
            <div>
              <h2 className="font-display text-h2 text-ink">About</h2>
              <p className="prose-measure mt-3 text-body text-ink-muted">{d.bio}</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="overline">Specialises in</h3>
                <BulletList items={d.specialisations} icon="check" />
              </div>
              <div>
                <h3 className="overline">Qualifications</h3>
                <BulletList items={d.qualifications} icon="dot" />
              </div>
            </div>
            {styleList.length > 0 && (
              <div>
                <h3 className="overline">Signature styles</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {styleList.map((s) => (
                    <li key={s.slug}>
                      <Badge tone="outline">
                        <Link href={`/styles/${s.slug}/`}>{s.name}</Link>
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="grid content-start gap-4 lg:sticky lg:top-28">
            <div className="rounded-lg border border-line bg-surface p-5 shadow-e1">
              <p className="flex items-center gap-2 text-body-s font-medium text-ink">
                <CalendarDays className="size-4 text-ink-muted" aria-hidden /> Typical consultation
                hours
              </p>
              <table className="tabular mt-3 w-full text-body-s">
                <tbody>
                  {DAYS.map((day) => {
                    const slots = d.availability.slots[day.key];
                    return (
                      <tr key={day.key} className="border-t border-line">
                        <th
                          scope="row"
                          className="py-1.5 pr-3 text-left font-normal text-ink-muted"
                        >
                          {day.label}
                        </th>
                        <td className={slots.length ? 'py-1.5 text-ink' : 'py-1.5 text-ink-subtle'}>
                          {slotRange(slots)}
                        </td>
                        <td className="py-1.5 text-right text-caption text-ink-subtle">
                          {slots.length ? `${slots.length} slots` : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="mt-3 text-caption text-ink-subtle">
                Asia/Kolkata. Exact slots are confirmed when you book.
              </p>
              <Button asChild className="mt-4" fullWidth>
                <Link href={`/consultation/?designer=${d.slug}`}>Pick a slot</Link>
              </Button>
            </div>
            <div className="grid gap-2 rounded-lg border border-line bg-surface-sunk p-5 text-body-s text-ink-muted">
              <p className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden /> {d.cities.join(' · ')}
              </p>
              <p className="flex items-center gap-2">
                <Languages className="size-4" aria-hidden /> {d.languages.join(' · ')}
              </p>
            </div>
          </aside>
        </Container>
      </Section>

      {projs.length > 0 && (
        <Section tone="sunk">
          <Container>
            <SectionHeader overline="Portfolio" title={`Projects led by ${d.name.split(' ')[0]}`} />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projs.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {quotes.length > 0 && (
        <Section>
          <Container>
            <SectionHeader overline="Clients say" title="From the handover notes" />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {quotes.map((t) => (
                <TestimonialCard key={t.id} t={t} full />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section tone="surface">
        <Container>
          <SectionHeader overline="Also at the studio" title="Other designers" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {colleagues.map((c) => (
              <DesignerCard key={c.slug} designer={c} />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        title={`Work with ${d.name.split(' ')[0]}`}
        description="A first consultation is free and comes with no obligation. Bring photos, a floor plan, or just a feeling."
        whatsappMessage={whatsapp}
        primary={{ label: 'Book a consultation', href: `/consultation/?designer=${d.slug}` }}
        secondary={{ label: 'Get an estimate first', href: '/estimate/' }}
      />
    </>
  );
}

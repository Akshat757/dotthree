import Link from 'next/link';
import { ArrowRight, Layers, Palette, Share2 } from 'lucide-react';

import { Container, Section } from '@/components/layout';
import { CtaBand, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge, SectionHeader } from '@/components/ui/display';
import { Img } from '@/components/ui/img';
import { projects, roomTemplates } from '@/data/demo';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import { titleCase } from '@/lib/utils';

export const metadata = pageMeta({
  title: 'Room visualiser — try materials on real Indore rooms',
  description:
    'Pick a room, tap a wall, floor, cabinet or countertop and swap in paints, laminates, tiles and stones from our Indore price book. Save designs, share on WhatsApp, estimate the cost.',
  path: '/visualiser/',
});

export default function VisualiserIndexPage() {
  const presets = projects.filter((p) => p.palette && p.roomTemplateSlug).slice(0, 6);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Visualiser', href: '/visualiser/' },
        ])}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Visualiser' }]}
        overline="Room visualiser"
        title="See it on the wall before it's on the wall"
        description="Choose a room, tap any surface and try the materials we actually stock in Indore. No sign-up; everything saves on this device."
        actions={
          <>
            <Button asChild size="lg">
              <Link href={`/visualiser/edit/?template=${roomTemplates[0]?.slug ?? ''}`}>
                Start with a room <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/materials/">Browse materials</Link>
            </Button>
          </>
        }
        className="pb-6 md:pb-8"
      />

      <Section className="pt-0 md:pt-0">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Layers,
                title: 'Tap a surface',
                text: 'Walls, floors, cabinets, counters and curtains are pre-cut on every room.',
              },
              {
                icon: Palette,
                title: 'Swap materials',
                text: 'Only materials suited to that surface are offered, with Indore prices.',
              },
              {
                icon: Share2,
                title: 'Save and share',
                text: 'Keep variants on this device, share a link or send it to a designer on WhatsApp.',
              },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border border-line bg-surface p-5">
                <f.icon className="size-5 text-accent" aria-hidden />
                <p className="mt-3 font-medium text-ink">{f.title}</p>
                <p className="mt-1 text-body-s text-ink-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            overline="Rooms"
            title="Pick a room to start"
            description="Each room is a real photographic base with hand-cut surface masks."
          />
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roomTemplates.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/visualiser/edit/?template=${t.slug}`}
                  className="group block overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Img
                    image={t.baseImage}
                    aspect="4 / 3"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-ink">{t.name}</p>
                      <Badge tone="outline">{t.surfaces.length} surfaces</Badge>
                    </div>
                    <p className="mt-1 text-caption text-ink-muted">
                      {titleCase(t.roomType)}
                      {t.style ? ` · ${titleCase(t.style)}` : ''}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {presets.length > 0 && (
        <Section className="bg-surface-sunk">
          <Container>
            <SectionHeader
              overline="Get this look"
              title="Start from a finished project"
              description="Load the exact palette we used on a real Indore home, then make it yours."
            />
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {presets.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/visualiser/edit/?template=${p.roomTemplateSlug}&preset=${p.slug}`}
                    className="group block overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-md"
                  >
                    <Img
                      image={p.heroImage}
                      aspect="4 / 3"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="p-4">
                      <p className="font-medium text-ink">{p.title}</p>
                      <p className="mt-1 text-caption text-ink-muted">
                        {p.locality ?? p.city}
                        {p.bhk ? ` · ${p.bhk}` : ''} · {Object.keys(p.palette ?? {}).length}{' '}
                        surfaces preset
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <CtaBand
        title="Want a designer to do it with you?"
        description="Bring your saved variants to a free consultation; we refine them on a call."
        primary={{ label: 'Book a consultation', href: '/consultation/' }}
        secondary={{ label: 'Get an estimate', href: '/estimate/' }}
      />
    </>
  );
}

import { Car, Clock, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

import { StudioMap } from '@/components/home/studio-map';
import { Container, Section } from '@/components/layout';
import { CtaBand, FaqSection, LinkTiles, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/display';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { site } from '@/config/site';
import { breadcrumbLd, faqLd, JsonLd, localBusinessLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import { buildMailtoUrl, buildTelUrl, messages } from '@/lib/whatsapp';

export const metadata = pageMeta({
  title: 'Contact the studio',
  description: `Visit ${site.name} in ${site.address.line2.split(', ').at(-1)}, Indore, or reach us on WhatsApp, phone and email. Open ${site.businessHours.weekdays} Monday to Saturday.`,
  path: '/contact/',
});

const FAQS = [
  {
    q: 'Do I need an appointment to visit?',
    a: `Walk-ins are welcome ${site.businessHours.weekdays} on weekdays, but booking a slot means a designer is free to sit with you and your drawings.`,
  },
  {
    q: 'Is there parking?',
    a: 'Two-wheeler parking is in the building basement. For cars, use the open lot behind Rasoma Square, a two-minute walk.',
  },
  {
    q: 'Can a designer come to my home instead?',
    a: 'Yes. The first site visit anywhere in Indore is free once you have had a consultation call. Outstation visits are scheduled in batches.',
  },
  {
    q: 'How quickly do you reply?',
    a: 'WhatsApp and calls within business hours are answered the same day. Email within one working day.',
  },
];

export default function ContactPage() {
  const { address } = site;
  const mailto = buildMailtoUrl(
    'Enquiry from the website',
    'Hi Dot 3,\n\nI would like to talk about my home.\n\nLocality:\nProperty:\nRough timeline:\n\nThanks',
  );

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          faqLd(FAQS),
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Contact', href: '/contact/' },
          ]),
        ]}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
        overline="Contact"
        title="Talk to a designer, not a sales desk"
        description="Fastest is WhatsApp — a designer picks it up during studio hours. Prefer to sit across a table? Book a slot and bring your floor plan."
        actions={
          <>
            <WhatsAppButton message={messages.generic()} label="WhatsApp the studio" size="lg" />
            <Button asChild size="lg" variant="outline">
              <Link href="/consultation/">Book a consultation</Link>
            </Button>
          </>
        }
        className="pb-6 md:pb-8"
      />

      <Section className="pt-0 md:pt-0">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="grid content-start gap-4">
            <ContactRow icon={MapPin} label="Studio">
              <address className="not-italic">
                {site.name}
                <br />
                {address.line1}
                <br />
                {address.line2}
                <br />
                {address.city} {address.pincode}, {address.state}
              </address>
            </ContactRow>
            <ContactRow icon={Clock} label="Hours">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <dt className="text-ink-muted">Mon–Fri</dt>
                <dd>{site.businessHours.weekdays}</dd>
                <dt className="text-ink-muted">Saturday</dt>
                <dd>{site.businessHours.saturday}</dd>
                <dt className="text-ink-muted">Sunday</dt>
                <dd>{site.businessHours.sunday}</dd>
              </dl>
            </ContactRow>
            <ContactRow icon={Phone} label="Phone">
              <a href={buildTelUrl()} className="text-accent hover:underline">
                {site.phone}
              </a>
              <p className="mt-1 text-caption text-ink-subtle">
                Calls answered during studio hours; WhatsApp any time.
              </p>
            </ContactRow>
            <ContactRow icon={Mail} label="Email">
              <a href={mailto} className="text-accent hover:underline">
                {site.email}
              </a>
            </ContactRow>
            <ContactRow icon={Car} label="Getting here">
              <p>
                Opposite Rasoma Square on the Vijay Nagar side of Scheme 54. Second floor, lift
                available. Two-wheeler parking in the basement.
              </p>
            </ContactRow>
          </div>
          <div className="overflow-hidden rounded-lg border border-line">
            <StudioMap className="min-h-[360px]" />
          </div>
        </Container>
      </Section>

      <Section tone="sunk">
        <Container>
          <SectionHeader overline="Quicker routes" title="Already know what you need?" />
          <div className="mt-8">
            <LinkTiles
              items={[
                {
                  label: 'Get a cost estimate',
                  href: '/estimate/',
                  description: 'Three minutes, honest range, no phone number needed.',
                },
                {
                  label: 'Book a consultation',
                  href: '/consultation/',
                  description: 'Pick a designer and a slot; we confirm on WhatsApp.',
                },
                {
                  label: 'Try the visualiser',
                  href: '/visualiser/',
                  description: 'Recolour a room before you talk to anyone.',
                },
                {
                  label: 'Areas we serve',
                  href: '/locations/',
                  description: 'Indore localities plus Bhopal, Ujjain, Dewas and Pithampur.',
                },
              ]}
            />
          </div>
        </Container>
      </Section>

      <FaqSection faqs={FAQS} title="Visiting the studio" />

      <CtaBand
        title="Prefer we come to you?"
        description="After a short call, the first site visit anywhere in Indore is on us."
        whatsappMessage={messages.generic()}
        primary={{ label: 'Book a consultation', href: '/consultation/' }}
        secondary={null}
      />
    </>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-line bg-surface p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 text-body-s text-ink">
        <p className="overline">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

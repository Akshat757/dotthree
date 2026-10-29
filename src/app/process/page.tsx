import {
  ArrowRight,
  FileCheck2,
  Hammer,
  KeyRound,
  MessageSquare,
  PencilRuler,
  Ruler,
} from 'lucide-react';
import Link from 'next/link';

import { Container, Section } from '@/components/layout';
import { BulletList, CtaBand, FaqSection, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/display';
import { Img } from '@/components/ui/img';
import { STANDARD_PROCESS, img } from '@/data/demo';
import { breadcrumbLd, faqLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'How we work — our six-step interior design process',
  description:
    'From a free consultation to handover: what happens at each step, how long it takes, what you pay when, and what is and is not included in a Dot 3 quotation.',
  path: '/process/',
});

const ICONS = [MessageSquare, Ruler, PencilRuler, FileCheck2, Hammer, KeyRound];
const DURATIONS = ['Day 0', 'Week 1', 'Weeks 2–3', 'Week 4', 'Weeks 5–14', 'Final week'];
const YOU_GET = [
  ['Needs brief', 'Rough budget band', 'Designer match'],
  ['Measured drawings', 'Site photo set', 'Services audit'],
  ['Mood board', 'Visualiser renders', '3D of key rooms'],
  ['Itemised BOQ', 'Material samples', 'Payment schedule'],
  ['Weekly site report', 'Photo updates on WhatsApp', 'Stage sign-offs'],
  ['Snag-free handover', 'Care guide', 'Warranty folder'],
];

const INCLUDED = [
  'Design fee, drawings and 3D views for every room in scope',
  'All modular furniture: carcass, shutters, hardware and installation',
  'False ceiling, electrical rewiring within the scope rooms, and lighting fixtures listed in BOQ',
  'Painting, wall finishes and civil changes shown on the drawings',
  'Site supervision, cleaning and debris removal',
  'Twelve-month workmanship warranty plus brand warranties on hardware',
];
const EXCLUDED = [
  'Loose furniture, appliances and soft furnishings unless itemised',
  'Society deposits, permissions and parking charges',
  'Structural changes needing an engineer certificate',
  'Plumbing beyond fixture replacement, and waterproofing of terraces',
  'GST is shown separately on every quote (18 percent)',
];

const PAYMENTS = [
  { stage: 'On signing', share: '10%', note: 'Confirms the slot; design work starts.' },
  { stage: 'Design freeze', share: '40%', note: 'Factory orders placed for modular units.' },
  { stage: 'Site start', share: '40%', note: 'Civil, ceiling, electrical and painting begin.' },
  { stage: 'Handover', share: '10%', note: 'After your snag list is cleared.' },
];

const FAQS = [
  {
    q: 'Is the first consultation really free?',
    a: 'Yes. A 45-minute call or studio visit costs nothing and comes with a rough budget band. Design fees apply only after you choose to proceed, and they are absorbed into the project cost if we execute.',
  },
  {
    q: 'How long does a 3BHK take?',
    a: 'Typically 10 to 14 weeks from design freeze to handover for a full-home scope. Kitchens alone run 4 to 6 weeks. Renovations with civil changes can add two to three weeks.',
  },
  {
    q: 'Can I change my mind after design freeze?',
    a: 'Paint colours and soft finishes, yes. Modular units are in production after freeze, so changes there incur re-order costs which we quote before acting.',
  },
  {
    q: 'Do you work with my own contractor?',
    a: 'We offer design-only packages with drawings and site visits for your contractor. Our warranty applies only to work we execute.',
  },
  {
    q: 'What if the site runs late?',
    a: 'Each quote carries a committed handover date. If we miss it for reasons within our control, we credit a weekly amount against your final payment.',
  },
  {
    q: 'Which areas do you cover?',
    a: 'All of Indore plus Dewas, Pithampur, Ujjain and Bhopal for full-home and commercial projects. Outstation work carries a travel charge shown in the quote.',
  },
];

export default function ProcessPage() {
  return (
    <>
      <JsonLd
        data={[
          faqLd(FAQS),
          breadcrumbLd([
            { name: 'Home', href: '/' },
            { name: 'Process', href: '/process/' },
          ]),
        ]}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Process' }]}
        overline="How we work"
        title="Six steps, no surprises"
        description="Every project — a single kitchen or a whole villa — runs the same way. Here is what happens, when, and what you will have in hand at the end of each step."
        image={img('hero-02')}
        actions={
          <>
            <Button asChild>
              <Link href="/consultation/">Start with step one</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/estimate/">Get a number first</Link>
            </Button>
          </>
        }
      />

      <Section className="pt-0 md:pt-0">
        <Container>
          <ol className="grid gap-6">
            {STANDARD_PROCESS.map((step, i) => {
              const Icon = ICONS[i] ?? MessageSquare;
              return (
                <li
                  key={step.step}
                  className="grid gap-6 rounded-lg border border-line bg-surface p-6 md:grid-cols-[auto_minmax(0,2fr)_minmax(0,1fr)] md:p-8"
                >
                  <div className="flex items-start gap-4 md:flex-col md:items-center md:gap-2">
                    <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="font-display text-h3 text-ink-subtle md:text-caption">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <p className="overline">{DURATIONS[i]}</p>
                    <h2 className="mt-1 font-display text-h2 text-ink">{step.step}</h2>
                    <p className="mt-3 text-body text-ink-muted">{step.detail}</p>
                  </div>
                  <div className="rounded-md bg-surface-sunk p-4">
                    <p className="text-caption font-medium text-ink-muted">You walk away with</p>
                    <BulletList items={YOU_GET[i] ?? []} icon="check" />
                  </div>
                </li>
              );
            })}
          </ol>
        </Container>
      </Section>

      <Section tone="sunk">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader overline="In the quote" title="What is included" />
            <BulletList items={INCLUDED} icon="check" />
          </div>
          <div>
            <SectionHeader overline="Not in the quote" title="What is billed separately" />
            <BulletList items={EXCLUDED} icon="x" />
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center">
          <div>
            <SectionHeader
              overline="Paying for it"
              title="Four milestones, never upfront in full"
              description="Each instalment is tied to something you can see. Payments are by bank transfer or UPI against a GST invoice."
            />
            <Button asChild className="mt-6" variant="outline">
              <Link href="/estimate/">
                See EMI options in the estimator <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {PAYMENTS.map((p) => (
              <li key={p.stage} className="rounded-lg border border-line bg-surface p-5">
                <p className="font-display text-display-l leading-none text-accent">{p.share}</p>
                <p className="mt-2 text-body font-medium text-ink">{p.stage}</p>
                <p className="mt-1 text-body-s text-ink-muted">{p.note}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="surface">
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <Img
            image={img('hero-03')}
            sizes="(min-width:1024px) 50vw, 100vw"
            aspect="4/3"
            className="rounded-lg"
          />
          <div>
            <SectionHeader
              overline="During execution"
              title="You will always know what happened on site today"
            />
            <BulletList
              items={[
                'A named site engineer and a WhatsApp group with your designer',
                'Photo update every working day, written report every Friday',
                'Stage sign-offs before the next trade starts: ceiling, electrical, carpentry, paint',
                'Material deliveries checked against the BOQ in front of you if you wish',
                'A snag walk with a checklist before we ask for the final payment',
              ]}
              icon="check"
            />
          </div>
        </Container>
      </Section>

      <FaqSection faqs={FAQS} />

      <CtaBand
        title="Ready for step one?"
        description="A 45-minute conversation, a rough budget band, and a designer who understands your home. Free, and genuinely no pressure."
        primary={{ label: 'Book a consultation', href: '/consultation/' }}
        secondary={{ label: 'Meet the designers', href: '/studio/' }}
      />
    </>
  );
}

import { Briefcase, Clock, MapPin } from 'lucide-react';

import { Container, Section } from '@/components/layout';
import { BulletList, CtaBand, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge, SectionHeader } from '@/components/ui/display';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { site } from '@/config/site';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';
import { buildMailtoUrl } from '@/lib/whatsapp';

export const metadata = pageMeta({
  title: 'Careers at the studio',
  description:
    'Open roles for interior designers, site engineers and a visualiser at Dot 3 Design Studio, Indore. Small team, real projects, no agency churn.',
  path: '/studio/careers/',
});

const ROLES = [
  {
    title: 'Interior Designer',
    type: 'Full-time',
    experience: '2–5 years',
    summary:
      'Lead two to three residential projects at a time from concept through handover, with a site engineer alongside you.',
    needs: [
      'Fluent in AutoCAD and SketchUp; Revit a plus',
      'Can detail a modular kitchen to the hinge',
      'Comfortable presenting to families, not just clients',
      'Hindi and English; Malwi is a bonus',
    ],
  },
  {
    title: 'Site Engineer',
    type: 'Full-time',
    experience: '3+ years',
    summary:
      'Own quality and sequence on four to six live sites across Indore. You are the reason we hand over on time.',
    needs: [
      'Diploma or B.E. Civil',
      'Has run carpentry, electrical and POP crews in parallel',
      'Two-wheeler and a working phone camera',
      'Cares about the last 5 percent',
    ],
  },
  {
    title: '3D Visualiser (Junior)',
    type: 'Full-time or internship',
    experience: '0–2 years',
    summary:
      'Turn designer sketches into renders clients can fall in love with, and help us author room templates for the online visualiser.',
    needs: [
      'Blender or 3ds Max with Corona / V-Ray',
      'Eye for Indian material palettes',
      'Basic Photoshop retouching',
      'Portfolio of at least five interiors',
    ],
  },
];

const PERKS = [
  'Six-day week with alternate Saturdays off',
  'Designer credit on every published project',
  'Site allowance and fuel reimbursed',
  'Annual learning budget for software and workshops',
  'Diwali bonus tied to on-time handovers, not sales',
];

export default function CareersPage() {
  const apply = (role: string) =>
    buildMailtoUrl(
      `Application: ${role}`,
      `Hi Dot 3,\n\nI'd like to apply for the ${role} role.\n\nName:\nCurrent city:\nYears of experience:\nPortfolio link:\n\nThanks`,
    );

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Studio', href: '/studio/' },
          { name: 'Careers', href: '/studio/careers/' },
        ])}
      />
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Studio', href: '/studio/' },
          { label: 'Careers' },
        ]}
        overline="Careers"
        title="Do your best work in a studio that notices"
        description="We are a team of fourteen in Scheme 54. Projects are real, deadlines are real, and so is the credit. If you want to grow into a designer clients ask for by name, read on."
      />

      <Section className="pt-0 md:pt-0">
        <Container>
          <SectionHeader overline="Open roles" title="Currently hiring" />
          <ul className="mt-8 grid gap-6">
            {ROLES.map((r) => (
              <li
                key={r.title}
                className="grid gap-6 rounded-lg border border-line bg-surface p-6 shadow-e1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:p-8"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-h2 text-ink">{r.title}</h3>
                    <Badge tone="accent">{r.type}</Badge>
                  </div>
                  <p className="mt-2 flex flex-wrap gap-4 text-body-s text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="size-4" aria-hidden /> {r.experience}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" aria-hidden /> Indore, on site
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-4" aria-hidden /> {site.businessHours.weekdays}
                    </span>
                  </p>
                  <p className="mt-4 text-body text-ink-muted">{r.summary}</p>
                  <BulletList items={r.needs} icon="check" columns={2} />
                </div>
                <div className="flex flex-col justify-between gap-4 md:items-end">
                  <p className="text-body-s text-ink-muted md:text-right">
                    Email a short note and a portfolio link. We reply to everyone within a week.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <a href={apply(r.title)}>Apply by email</a>
                    </Button>
                    <WhatsAppButton
                      message={`Hi Dot 3, I'm interested in the ${r.title} role. Can I share my portfolio here?`}
                      label="Ask on WhatsApp"
                      variant="outline"
                      size="md"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="sunk">
        <Container className="grid gap-8 md:grid-cols-2">
          <div>
            <SectionHeader overline="How it works here" title="What you can expect" />
            <BulletList items={PERKS} icon="check" />
          </div>
          <div className="rounded-lg border border-line bg-surface p-6">
            <h3 className="font-display text-h3 text-ink">Nothing that fits?</h3>
            <p className="mt-2 text-body-s text-ink-muted">
              We keep a short list of people we would like to work with. Send your portfolio anyway
              and tell us what you would want to do here.
            </p>
            <a
              href={apply('General application')}
              className="mt-4 inline-flex text-body-s font-medium text-accent hover:underline"
            >
              {site.email}
            </a>
          </div>
        </Container>
      </Section>

      <CtaBand
        title="Curious what we build?"
        description="Browse the case studies before you apply. You will be asked about your favourite one."
        primary={{ label: 'See projects', href: '/projects/' }}
        secondary={{ label: 'Meet the team', href: '/studio/' }}
      />
    </>
  );
}

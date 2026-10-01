import Link from 'next/link';
import type { ReactNode } from 'react';

import { Container, Section } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Breadcrumb, type Crumb } from '@/components/ui/display';
import { Img } from '@/components/ui/img';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { FaqAccordion } from '@/components/ui/disclosure';
import type { ImageRef } from '@/types/content';
import { cn } from '@/lib/utils';

/* --------------------------------- PageHero -------------------------------- */

export function PageHero({
  crumbs,
  overline,
  title,
  description,
  image,
  actions,
  aside,
  size = 'md',
  className,
}: {
  crumbs?: Crumb[];
  overline?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  image?: ImageRef;
  actions?: ReactNode;
  aside?: ReactNode;
  size?: 'md' | 'lg';
  className?: string;
}) {
  return (
    <Section className={cn('pt-10 pb-12 md:pt-14 md:pb-16', className)}>
      <Container>
        {crumbs && <Breadcrumb items={crumbs} />}
        <div
          className={cn(
            'mt-6 grid gap-10',
            image && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center',
            !image && aside && 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-end',
          )}
        >
          <header className="max-w-2xl">
            {overline && <p className="overline">{overline}</p>}
            <h1
              className={cn(
                'mt-2 font-display text-ink',
                size === 'lg' ? 'text-display-xl' : 'text-display-l',
              )}
            >
              {title}
            </h1>
            {description && <p className="mt-5 text-body-l text-ink-muted">{description}</p>}
            {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
          </header>
          {image && (
            <Img
              image={image}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="rounded-lg shadow-e2"
              aspect="4 / 3"
              imgClassName="size-full object-cover"
            />
          )}
          {!image && aside}
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------------- CtaBand -------------------------------- */

export function CtaBand({
  title = 'Ready to see what your home could cost?',
  description = 'Get a free, honest estimate in under three minutes — or talk to a designer today.',
  whatsappMessage,
  primary = { label: 'Get an estimate', href: '/estimate/' },
  secondary = { label: 'Book a consultation', href: '/consultation/' },
  tone = 'ink',
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  whatsappMessage?: string;
  primary?: { label: string; href: string } | null;
  secondary?: { label: string; href: string } | null;
  tone?: 'ink' | 'sunk';
  className?: string;
}) {
  return (
    <Section tone={tone} className={cn('py-14 md:py-20', className)}>
      <Container className="grid items-center gap-8 lg:grid-cols-[minmax(0,2fr)_auto]">
        <div className="max-w-2xl">
          <h2 className={cn('font-display text-h1', tone === 'ink' ? 'text-canvas' : 'text-ink')}>
            {title}
          </h2>
          <p className={cn('mt-3 text-body-l', tone === 'ink' ? 'text-canvas/75' : 'text-ink-muted')}>
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          {primary && (
            <Button asChild size="lg">
              <Link href={primary.href}>{primary.label}</Link>
            </Button>
          )}
          {secondary && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className={cn(tone === 'ink' && 'border-canvas/30 text-canvas hover:bg-canvas/10 hover:text-canvas')}
            >
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          )}
          <WhatsAppButton size="lg" message={whatsappMessage} />
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------- FaqSection ------------------------------ */

export function FaqSection({
  faqs,
  title = 'Questions people ask us',
  description,
  id = 'faq',
  className,
}: {
  faqs: { q: string; a: string }[];
  title?: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
}) {
  if (!faqs.length) return null;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('scroll-mt-28', className)}>
      <h2 id={`${id}-title`} className="font-display text-h2 text-ink">
        {title}
      </h2>
      {description && <p className="prose-measure mt-3 text-body text-ink-muted">{description}</p>}
      <FaqAccordion
        className="mt-6"
        items={faqs.map((f) => ({
          q: f.q,
          a: <p className="prose-measure text-body text-ink-muted">{f.a}</p>,
        }))}
      />
    </section>
  );
}

/* --------------------------------- FactsBar -------------------------------- */

export function FactsBar({
  facts,
  className,
}: {
  facts: { label: string; value: ReactNode }[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-x-6 gap-y-5 rounded-lg border border-line bg-surface p-5 sm:grid-cols-3 lg:grid-cols-6',
        className,
      )}
    >
      {facts.map((f) => (
        <div key={f.label} className="min-w-0">
          <dt className="overline">{f.label}</dt>
          <dd className="mt-1 truncate text-body font-medium text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------- Checklist -------------------------------- */

export function BulletList({
  items,
  icon = 'check',
  columns = 1,
  className,
}: {
  items: string[];
  icon?: 'check' | 'dot' | 'x';
  columns?: 1 | 2;
  className?: string;
}) {
  return (
    <ul className={cn('grid gap-3', columns === 2 && 'sm:grid-cols-2', className)}>
      {items.map((it) => (
        <li key={it} className="flex gap-3 text-body text-ink">
          <span
            aria-hidden
            className={cn(
              'mt-1.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
              icon === 'check' && 'bg-success/15 text-success',
              icon === 'x' && 'bg-danger/15 text-danger',
              icon === 'dot' && 'bg-accent-soft text-accent',
            )}
          >
            {icon === 'check' ? '✓' : icon === 'x' ? '✕' : '•'}
          </span>
          <span className="text-ink-muted">{it}</span>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------- Prose block ----------------------------- */

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('article-prose prose-measure', className)}>{children}</div>;
}

/* ------------------------------- Simple link grid -------------------------- */

export function LinkTiles({
  items,
  className,
}: {
  items: { label: string; href: string; description?: string }[];
  className?: string;
}) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map((it) => (
        <li key={it.href}>
          <Link
            href={it.href}
            className="group block h-full rounded-lg border border-line bg-surface p-5 transition-colors hover:border-sand hover:bg-surface-sunk focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none"
          >
            <span className="font-medium text-ink group-hover:text-accent">{it.label}</span>
            {it.description && <p className="mt-1 text-body-s text-ink-muted">{it.description}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

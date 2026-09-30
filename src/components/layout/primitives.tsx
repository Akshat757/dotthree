import Link from 'next/link';

import { site } from '@/config/site';
import { cn } from '@/lib/utils';

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only-focusable fixed top-4 left-4 z-[100] rounded-md bg-ink px-4 py-2 text-body-s font-medium text-canvas shadow-e3"
    >
      Skip to main content
    </a>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2.5 rounded-sm focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none',
        className,
      )}
      aria-label={`${site.name} — home`}
    >
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="6" className="fill-accent" />
        <path
          d="M8 24 16 8l8 16M11.5 18h9"
          className="stroke-canvas"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {!compact && (
        <span className="font-display text-[1.25rem] leading-none tracking-tight text-ink">
          {site.shortName}
          <span className="font-normal text-ink-muted"> Design Studio</span>
        </span>
      )}
    </Link>
  );
}

export function Container({
  className,
  children,
  size = 'xl',
}: {
  className?: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | 'full';
}) {
  const w = { md: 'max-w-3xl', lg: 'max-w-5xl', xl: 'max-w-7xl', full: 'max-w-none' };
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', w[size], className)}>{children}</div>
  );
}

export function Section({
  className,
  children,
  id,
  tone = 'canvas',
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
  tone?: 'canvas' | 'surface' | 'sunk' | 'ink';
}) {
  const t = {
    canvas: 'bg-canvas',
    surface: 'bg-surface',
    sunk: 'bg-surface-sunk',
    ink: 'bg-ink text-canvas',
  };
  return (
    <section id={id} className={cn('py-16 md:py-24', t[tone], className)}>
      {children}
    </section>
  );
}

export function DemoBanner() {
  if (!site.isDemoContent) return null;
  return (
    <div className="bg-forest text-center text-caption text-canvas">
      <Container className="flex items-center justify-center gap-2 py-1.5">
        <span className="inline-block size-1.5 rounded-full bg-gold" aria-hidden />
        Demo content — every project, price and person on this site is illustrative.
      </Container>
    </div>
  );
}

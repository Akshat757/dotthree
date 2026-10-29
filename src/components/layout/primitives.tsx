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

/** The studio's circle mark as one evenodd path, so it takes any text colour (ring, hole, dot). */
const MARK_PATH = [
  'M0 50a50 50 0 1 0 100 0a50 50 0 1 0-100 0Z', // outer disc
  'M17 66.7a33.2 33.2 0 1 0 66.4 0a33.2 33.2 0 1 0-66.4 0Z', // inner hole, tangent to the bottom edge
  'M17 66.5a16.5 16.5 0 1 0 33 0a16.5 16.5 0 1 0-33 0Z', // dot inside the hole
].join('');

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn('shrink-0 fill-current', className)} aria-hidden>
      <path d={MARK_PATH} fillRule="evenodd" />
    </svg>
  );
}

function LogoLockup({ light, className }: { light?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 2222 762"
      className={cn('aspect-[2222/762] h-10 w-auto shrink-0 md:h-11', className)}
      aria-hidden
    >
      <image href={`/brand/logo-lockup${light ? '-light' : ''}.png`} width="2222" height="762" />
    </svg>
  );
}

/**
 * `tone="light"` is for use on top of dark imagery (the transparent header over the hero).
 * Otherwise the lockup follows the site theme.
 */
export function Logo({
  className,
  compact,
  tone = 'auto',
}: {
  className?: string;
  compact?: boolean;
  tone?: 'auto' | 'light';
}) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2.5 rounded-sm focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none',
        className,
      )}
      aria-label={`${site.name} — home`}
    >
      {compact ? (
        <LogoMark className={cn('size-9', tone === 'light' ? 'text-white' : 'text-ink')} />
      ) : tone === 'light' ? (
        <LogoLockup light />
      ) : (
        <>
          <LogoLockup className="dark:hidden" />
          <LogoLockup light className="hidden dark:block" />
        </>
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

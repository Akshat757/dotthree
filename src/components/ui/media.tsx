'use client';

import * as React from 'react';

import { cn, prefersReducedMotion } from '@/lib/utils';

/* -------------------------------- StatCounter ------------------------------ */

export function StatCounter({
  value,
  suffix = '',
  prefix = '',
  label,
  durationMs = 1400,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: React.ReactNode;
  durationMs?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [display, setDisplay] = React.useState(0);
  const started = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / durationMs);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.round(value * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, durationMs]);

  return (
    <div ref={ref} className={cn('grid gap-1', className)}>
      <div className="tabular font-display text-display-l text-ink" aria-live="off">
        <span className="sr-only">
          {prefix}
          {value.toLocaleString('en-IN')}
          {suffix}
        </span>
        <span aria-hidden>
          {prefix}
          {display.toLocaleString('en-IN')}
          {suffix}
        </span>
      </div>
      <div className="text-body-s text-ink-muted">{label}</div>
    </div>
  );
}

/* -------------------------------- MediaFacade ------------------------------ */

/**
 * Click-to-load facade for heavy third-party or JS-heavy media (OSM map, WebGL).
 * Shows a static poster until the user opts in — the only path that loads third-party origins.
 */
export function MediaFacade({
  poster,
  label,
  description,
  children,
  className,
  autoLoadOnIntersect = false,
}: {
  poster: React.ReactNode;
  label: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  autoLoadOnIntersect?: boolean;
}) {
  const [loaded, setLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!autoLoadOnIntersect || loaded) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => {
      if (e[0]?.isIntersecting) {
        setLoaded(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [autoLoadOnIntersect, loaded]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden rounded-lg bg-surface-sunk', className)}>
      {loaded ? (
        children
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0 [&_img]:size-full [&_img]:object-cover [&_picture]:size-full"
          >
            {poster}
          </div>
          <div className="scrim-bottom absolute inset-0 flex flex-col items-center justify-end gap-2 p-6 text-center text-canvas">
            {description && <p className="text-body-s text-canvas/85">{description}</p>}
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-surface px-5 text-body font-medium text-ink shadow-e2 transition-colors hover:bg-surface-sunk focus-visible:ring-2 focus-visible:ring-canvas focus-visible:outline-none"
            >
              {label}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------- KenBurnsHero ----------------------------- */

/**
 * CSS-only slow zoom/pan over a stack of still images. No video; each still fades over 8–9s.
 * Static under reduced motion / save-data.
 */
export function KenBurnsHero({
  slides,
  intervalMs = 9000,
  className,
  children,
}: {
  slides: React.ReactNode[];
  intervalMs?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const [idx, setIdx] = React.useState(0);
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (prefersReducedMotion() || nav.connection?.saveData || slides.length < 2) return;
    setAnimate(true);
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  return (
    <section
      className={cn('on-photo relative isolate overflow-hidden bg-ink text-canvas', className)}
    >
      <div className="absolute inset-0" aria-hidden>
        {slides.map((s, i) => (
          <div
            key={i}
            className={cn(
              'absolute inset-0 transition-opacity duration-[1600ms] ease-slow [&_img]:size-full [&_img]:object-cover [&_picture]:size-full',
              i === idx ? 'opacity-100' : 'opacity-0',
              animate && i === idx && 'animate-kenburns',
            )}
          >
            {s}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" />
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

/* ------------------------------ BeforeAfterSlider -------------------------- */

export function BeforeAfterSlider({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  initial = 50,
  className,
}: {
  before: React.ReactNode;
  after: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  initial?: number;
  className?: string;
}) {
  const [pos, setPos] = React.useState(initial);
  const ref = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const setFromPointer = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={ref}
      className={cn(
        'group relative touch-pan-y overflow-hidden rounded-lg bg-surface-sunk select-none',
        className,
      )}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setFromPointer(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && setFromPointer(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div className="[&_img]:size-full [&_img]:object-cover [&_picture]:size-full">{after}</div>
      <div
        className="absolute inset-0 [&_img]:size-full [&_img]:object-cover [&_picture]:size-full"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        aria-hidden
      >
        {before}
      </div>
      <span className="pointer-events-none absolute top-3 left-3 rounded-sm bg-ink/70 px-2 py-0.5 text-caption font-medium text-canvas">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-sm bg-ink/70 px-2 py-0.5 text-caption font-medium text-canvas">
        {afterLabel}
      </span>
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-canvas shadow-e2"
        style={{ left: `calc(${pos}% - 1px)` }}
        aria-hidden
      >
        <span className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-canvas text-ink shadow-e3">
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6 4 12l5 6M15 6l5 6-5 6" />
          </svg>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(pos)}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Compare ${beforeLabel} and ${afterLabel}`}
        aria-valuetext={`${Math.round(pos)}% ${beforeLabel}`}
        className="absolute inset-x-0 bottom-0 h-11 w-full cursor-ew-resize appearance-none bg-transparent opacity-0 focus-visible:opacity-100 focus-visible:outline-none [&::-webkit-slider-thumb]:size-11 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-focus"
      />
    </div>
  );
}

/* --------------------------------- ColorSwatch ----------------------------- */

export function ColorSwatch({
  hex,
  name,
  code,
  selected,
  size = 'md',
  onClick,
  className,
}: {
  hex: string;
  name: string;
  code?: string;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}) {
  const s = { sm: 'size-8', md: 'size-12', lg: 'size-20' };
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
      aria-label={onClick ? `${name}${code ? ` (${code})` : ''}` : undefined}
      title={`${name}${code ? ` · ${code}` : ''}`}
      className={cn(
        'duration-quick inline-block shrink-0 rounded-md border border-ink/10 shadow-inner transition-transform',
        s[size],
        onClick &&
          'hover:scale-105 focus-visible:ring-2 focus-visible:ring-focus/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none',
        selected && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
        className,
      )}
      style={{ backgroundColor: hex }}
    />
  );
}

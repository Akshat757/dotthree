import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronRight, Star, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { cn, formatInrCompact } from '@/lib/utils';

/* ----------------------------------- Badge --------------------------------- */

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-caption leading-tight font-medium whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-sunk text-ink-muted',
        accent: 'bg-accent-soft text-accent-hover',
        forest: 'bg-forest/10 text-forest dark:text-[#9dc4a9]',
        gold: 'bg-gold/15 text-[#7a5f22] dark:text-gold',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/15 text-[#7c5a1f] dark:text-warning',
        danger: 'bg-danger/10 text-danger',
        ink: 'bg-ink text-canvas',
        outline: 'border border-line text-ink-muted',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

/* ----------------------------------- Chip ---------------------------------- */

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

/** Interactive filter chip. Renders a toggle button; pass onRemove for a dismissible chip. */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, selected, onRemove, icon, size = 'md', children, ...props }, ref) => (
    <span className="inline-flex items-stretch">
      <button
        ref={ref}
        type="button"
        aria-pressed={onRemove ? undefined : selected}
        className={cn(
          'duration-quick inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          size === 'sm' ? 'h-8 px-3 text-caption' : 'h-9 px-3.5 text-body-s',
          selected
            ? 'border-ink bg-ink text-canvas hover:bg-ink/90'
            : 'border-line bg-surface text-ink hover:border-sand hover:bg-surface-sunk',
          onRemove && 'rounded-r-none border-r-0 pr-2',
          className,
        )}
        {...props}
      >
        {icon && <span className="[&_svg]:size-3.5">{icon}</span>}
        {children}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            'inline-flex items-center rounded-r-full border border-l-0 pr-2 pl-1 transition-colors focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none',
            selected
              ? 'border-ink bg-ink text-canvas hover:bg-ink/90'
              : 'border-line bg-surface text-ink-muted hover:bg-surface-sunk hover:text-ink',
          )}
        >
          <X className="size-3.5" aria-hidden />
          <span className="sr-only">
            Remove {typeof children === 'string' ? children : 'filter'}
          </span>
        </button>
      )}
    </span>
  ),
);
Chip.displayName = 'Chip';

/* ----------------------------------- Card ---------------------------------- */

export const cardVariants = cva('rounded-lg bg-surface text-ink', {
  variants: {
    variant: {
      elevated: 'shadow-e1',
      outline: 'border border-line',
      sunk: 'bg-surface-sunk',
      plain: '',
    },
    interactive: {
      true: 'duration-base transition-[box-shadow,transform,border-color] ease-base focus-within:ring-2 focus-within:ring-focus/40 hover:-translate-y-0.5 hover:shadow-e2 motion-reduce:hover:translate-y-0',
    },
    padding: { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' },
  },
  defaultVariants: { variant: 'outline', padding: 'md' },
});

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, interactive, padding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, interactive, padding }), className)}
    {...props}
  />
));
Card.displayName = 'Card';

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5', className)} {...props} />;
}
export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-display text-h3', className)} {...props}>
      {children}
    </h3>
  );
}
export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-body-s text-ink-muted', className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('pt-4', className)} {...props} />;
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-3 pt-4', className)} {...props} />;
}

/* --------------------------------- Skeleton -------------------------------- */

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn('skeleton', className)} {...props} />;
}

export function CardSkeleton({ lines = 2, media = true }: { lines?: number; media?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface" aria-busy>
      {media && <Skeleton className="aspect-[4/3] w-full rounded-none" />}
      <div className="grid gap-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-1/2' : 'w-full')} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- EmptyState ------------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-surface-sunk text-ink-muted [&_svg]:size-6">
          {icon}
        </div>
      )}
      <h3 className="font-display text-h3 text-ink">{title}</h3>
      {description && <p className="prose-measure text-body-s text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ------------------------------- SectionHeader ----------------------------- */

export function SectionHeader({
  overline,
  title,
  description,
  action,
  align = 'left',
  as: Tag = 'h2',
  className,
}: {
  overline?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('grid gap-2', align === 'center' && 'justify-items-center')}>
        {overline && <p className="overline">{overline}</p>}
        <Tag
          className={cn(
            'font-display text-ink',
            Tag === 'h1' ? 'text-h1' : Tag === 'h2' ? 'text-h2' : 'text-h3',
          )}
        >
          {title}
        </Tag>
        {description && <p className="prose-measure text-body-l text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* --------------------------------- Breadcrumb ------------------------------ */

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-caption text-ink-muted', className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="rounded-sm underline-offset-4 hover:text-ink hover:underline"
                >
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={cn(last && 'text-ink')}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3.5 text-ink-subtle" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------------------------------- Avatar --------------------------------- */

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string;
  src?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
  const sizes = {
    sm: 'size-8 text-caption',
    md: 'size-10 text-body-s',
    lg: 'size-14 text-body',
    xl: 'size-24 text-h3',
  };
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft font-display font-medium text-accent-hover [&_img]:size-full [&_img]:object-cover [&_picture]:absolute [&_picture]:inset-0',
        sizes[size],
        className,
      )}
      aria-hidden={src ? undefined : true}
    >
      {src ?? initials}
    </span>
  );
}

/* -------------------------------- RatingStars ------------------------------ */

export function RatingStars({
  value,
  max = 5,
  className,
  size = 'md',
}: {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <span
      className={cn('inline-flex items-center gap-0.5 text-gold', className)}
      role="img"
      aria-label={`${value} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === 'sm' ? 'size-3.5' : 'size-4',
            i < Math.round(value) ? 'fill-current' : 'fill-transparent text-sand',
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

/* --------------------------------- PriceRange ------------------------------ */

export function PriceRange({
  low,
  high,
  unit,
  className,
  size = 'md',
}: {
  low: number;
  high: number;
  unit?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const s = { sm: 'text-body-s', md: 'text-body', lg: 'text-h3 font-display' };
  return (
    <span className={cn('tabular text-ink', s[size], className)}>
      {formatInrCompact(low)} – {formatInrCompact(high)}
      {unit && <span className="ml-1 text-caption text-ink-muted">/{unit}</span>}
    </span>
  );
}

/* -------------------------------- Pagination ------------------------------- */

export function Pagination({
  page,
  pageCount,
  hrefFor,
  onChange,
  className,
}: {
  page: number;
  pageCount: number;
  hrefFor?: (p: number) => string;
  onChange?: (p: number) => void;
  className?: string;
}) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );
  const items: (number | 'gap')[] = [];
  pages.forEach((p, i) => {
    const prev = pages[i - 1];
    if (prev !== undefined && p - prev > 1) items.push('gap');
    items.push(p);
  });
  const btn =
    'inline-flex size-10 items-center justify-center rounded-md text-body-s font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40';
  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {items.map((it, i) =>
        it === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-ink-subtle" aria-hidden>
            …
          </span>
        ) : hrefFor ? (
          <Link
            key={it}
            href={hrefFor(it)}
            aria-current={it === page ? 'page' : undefined}
            className={cn(
              btn,
              it === page ? 'bg-ink text-canvas' : 'text-ink hover:bg-surface-sunk',
            )}
          >
            {it}
          </Link>
        ) : (
          <button
            key={it}
            type="button"
            onClick={() => onChange?.(it)}
            aria-current={it === page ? 'page' : undefined}
            className={cn(
              btn,
              it === page ? 'bg-ink text-canvas' : 'text-ink hover:bg-surface-sunk',
            )}
          >
            {it}
          </button>
        ),
      )}
    </nav>
  );
}

/* ------------------------------- StepIndicator ----------------------------- */

export function StepIndicator({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn('flex items-center gap-2', className)} aria-label="Progress">
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li
            key={s}
            className="flex flex-1 items-center gap-2 last:flex-none"
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span
              className={cn(
                'tabular flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-medium',
                state === 'done' && 'bg-accent text-white',
                state === 'current' && 'border-2 border-accent text-accent',
                state === 'todo' && 'border border-line text-ink-subtle',
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                'hidden text-caption md:inline',
                state === 'current' ? 'font-medium text-ink' : 'text-ink-muted',
              )}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn('h-px flex-1', i < current ? 'bg-accent' : 'bg-line')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------- Timeline -------------------------------- */

export interface TimelineItem {
  id: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  body?: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  const dot = {
    neutral: 'bg-sand',
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };
  return (
    <ol className={cn('relative grid gap-6 border-l border-line pl-6', className)}>
      {items.map((it) => (
        <li key={it.id} className="relative">
          <span
            aria-hidden
            className={cn(
              'absolute top-1.5 -left-[1.8rem] size-3 rounded-full ring-4 ring-surface',
              dot[it.tone ?? 'neutral'],
            )}
          />
          <div className="grid gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h4 className="text-body font-medium text-ink">{it.title}</h4>
              {it.meta && <span className="tabular text-caption text-ink-muted">{it.meta}</span>}
            </div>
            {it.body && <div className="text-body-s text-ink-muted">{it.body}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ---------------------------------- Marquee -------------------------------- */

/** CSS-only infinite marquee; pauses on hover/focus and is static under reduced motion. */
export function Marquee({
  children,
  durationS = 40,
  className,
}: {
  children: React.ReactNode;
  durationS?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'group/marquee relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className,
      )}
    >
      <div
        className="flex w-max shrink-0 animate-marquee items-center gap-10 pr-10 group-focus-within/marquee:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ ['--marquee-duration' as string]: `${durationS}s` }}
      >
        {children}
        <span aria-hidden className="contents">
          {children}
        </span>
      </div>
    </div>
  );
}

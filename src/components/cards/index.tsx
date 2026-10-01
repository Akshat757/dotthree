import Link from 'next/link';
import { ArrowUpRight, Clock, MapPin } from 'lucide-react';

import { Img } from '@/components/ui/img';
import { Avatar, Badge, RatingStars } from '@/components/ui/display';
import { ServiceIcon } from '@/components/cards/service-icon';
import { cn, formatInrCompact, formatRange, titleCase } from '@/lib/utils';
import type {
  BudgetBand,
  Designer,
  Material,
  Project,
  RoomGuide,
  Service,
  StyleGuide,
  Testimonial,
} from '@/types/content';
import { ROOM_LABELS, getDesigner, getStyle } from '@/data/demo';

export const BUDGET_BAND_LABEL: Record<BudgetBand, string> = {
  UNDER_3L: 'Under ₹3L',
  L3_7: '₹3–7L',
  L7_15: '₹7–15L',
  L15_30: '₹15–30L',
  ABOVE_30L: '₹30L+',
};

export const PROPERTY_LABEL: Record<Project['propertyType'], string> = {
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  DUPLEX: 'Duplex',
  FARMHOUSE: 'Farmhouse',
  OFFICE: 'Office',
  CLINIC: 'Clinic',
  RETAIL: 'Retail',
  RESTAURANT: 'Restaurant',
};

const cardBase =
  'group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-e1 transition-shadow duration-quick hover:shadow-e2 focus-within:ring-2 focus-within:ring-focus/40';

/* -------------------------------- ProjectCard ------------------------------ */

export function ProjectCard({
  project,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  priority,
  className,
  action,
}: {
  project: Project;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Slot for e.g. a favourite toggle (rendered above the link overlay). */
  action?: React.ReactNode;
}) {
  const p = project;
  const meta = [
    p.bhk,
    PROPERTY_LABEL[p.propertyType],
    p.carpetAreaSqft && `${p.carpetAreaSqft} sq ft`,
  ]
    .filter(Boolean)
    .join(' · ');
  const styleName = p.styles[0] ? (getStyle(p.styles[0])?.name ?? p.styles[0]) : undefined;
  return (
    <article className={cn(cardBase, className)}>
      <div className="relative">
        <Img
          image={p.heroImage}
          aspect="4 / 3"
          sizes={sizes}
          priority={priority}
          imgClassName="transition-transform duration-slow group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {p.nature === 'RENOVATION' && <Badge tone="gold">Renovation</Badge>}
          {p.vastuAligned && <Badge tone="forest">Vastu-aligned</Badge>}
        </div>
        {action && <div className="absolute top-3 right-3 z-10">{action}</div>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="flex items-center gap-1 text-caption text-ink-muted">
          <MapPin className="size-3.5" aria-hidden />
          {[p.locality, p.city].filter(Boolean).join(', ')}
        </p>
        <h3 className="font-display text-h3 text-ink">
          <Link
            href={`/projects/${p.slug}/`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {p.title}
          </Link>
        </h3>
        <p className="text-body-s text-ink-muted">{meta}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-caption">
          <span className="text-ink-muted">{styleName}</span>
          <span className="tabular font-medium text-ink">{BUDGET_BAND_LABEL[p.budgetBand]}</span>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------- ServiceCard ------------------------------ */

export function ServiceCard({
  service,
  className,
  compact,
}: {
  service: Service;
  className?: string;
  compact?: boolean;
}) {
  const s = service;
  return (
    <article className={cn(cardBase, 'p-5', className)}>
      <span className="inline-flex size-11 items-center justify-center rounded-md bg-accent-soft text-accent-hover">
        <ServiceIcon name={s.icon} className="size-5" />
      </span>
      <h3 className="mt-4 font-display text-h3 text-ink">
        <Link
          href={`/services/${s.slug}/`}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {s.shortName}
        </Link>
      </h3>
      <p className="mt-1.5 text-body-s text-ink-muted">{s.tagline}</p>
      {!compact && (
        <p className="tabular mt-4 text-caption text-ink-muted">
          From <span className="font-medium text-ink">{formatInrCompact(s.costBand.min)}</span>
          {s.costBand.unit && <> /{s.costBand.unit}</>} · {s.timelineWeeks[0]}–{s.timelineWeeks[1]}{' '}
          wks
        </p>
      )}
      <ArrowUpRight
        className="absolute top-5 right-5 size-4 text-ink-subtle transition-colors group-hover:text-accent"
        aria-hidden
      />
    </article>
  );
}

/* --------------------------------- StyleCard ------------------------------- */

export function StyleCard({
  style,
  className,
  sizes,
}: {
  style: StyleGuide;
  className?: string;
  sizes?: string;
}) {
  return (
    <article className={cn(cardBase, className)}>
      <Img
        image={style.heroImage}
        aspect="3 / 2"
        sizes={sizes ?? '(min-width: 1024px) 25vw, 50vw'}
        imgClassName="transition-transform duration-slow group-hover:scale-[1.03]"
      />
      <div className="p-4">
        <h3 className="font-display text-h3 text-ink">
          <Link
            href={`/styles/${style.slug}/`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {style.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-body-s text-ink-muted">{style.tagline}</p>
      </div>
    </article>
  );
}

/* --------------------------------- RoomCard -------------------------------- */

export function RoomCard({ room, className }: { room: RoomGuide; className?: string }) {
  return (
    <article className={cn(cardBase, className)}>
      <Img image={room.heroImage} aspect="3 / 2" sizes="(min-width: 1024px) 25vw, 50vw" />
      <div className="p-4">
        <h3 className="font-display text-h3 text-ink">
          <Link
            href={`/rooms/${room.slug}/`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {room.name}
          </Link>
        </h3>
        <p className="tabular mt-1 text-caption text-ink-muted">
          {formatRange(room.costBand.min, room.costBand.max, true)}
        </p>
      </div>
    </article>
  );
}

/* ------------------------------- MaterialCard ------------------------------ */

export function MaterialCard({
  material,
  className,
  action,
  onSelect,
  selected,
}: {
  material: Material;
  className?: string;
  action?: React.ReactNode;
  onSelect?: () => void;
  selected?: boolean;
}) {
  const m = material;
  return (
    <article className={cn(cardBase, selected && 'ring-2 ring-accent', className)}>
      <div className="relative">
        <Img image={m.swatch} aspect="1 / 1" sizes="(min-width: 1024px) 16vw, 33vw" />
        {action && <div className="absolute top-2 right-2 z-10">{action}</div>}
      </div>
      <div className="p-3">
        <p className="text-caption text-ink-muted">{m.brand ?? titleCase(m.category)}</p>
        <h3 className="text-body font-medium text-ink">
          <Link
            href={`/materials/${m.slug}/`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {m.name}
          </Link>
        </h3>
        {m.price && (
          <p className="tabular mt-1 text-caption text-ink-muted">
            {formatInrCompact(m.price.min)}–{formatInrCompact(m.price.max)} /{m.price.unit}
          </p>
        )}
        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className="relative z-10 mt-2 text-caption font-medium text-accent hover:underline focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none"
          >
            {selected ? 'Remove from compare' : 'Compare'}
          </button>
        )}
      </div>
    </article>
  );
}

/* ----------------------------- TestimonialCard ----------------------------- */

export function TestimonialCard({
  t,
  className,
  full,
}: {
  t: Testimonial;
  className?: string;
  full?: boolean;
}) {
  const designer = t.designerSlug ? getDesigner(t.designerSlug) : undefined;
  return (
    <figure
      className={cn(
        'flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-e1',
        className,
      )}
    >
      <RatingStars value={t.rating} size="sm" />
      <blockquote className={cn('mt-3 flex-1 text-body text-ink', !full && 'line-clamp-5')}>
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <Avatar
          name={t.clientName}
          src={t.photo ? <Img image={t.photo} sizes="40px" alt="" /> : undefined}
        />
        <div className="min-w-0">
          <p className="truncate text-body-s font-medium text-ink">{t.clientName}</p>
          <p className="truncate text-caption text-ink-muted">
            {[t.projectType, t.locality].filter(Boolean).join(' · ')}
            {designer && <> · with {designer.name.split(' ')[0]}</>}
          </p>
        </div>
        {t.timelineWeeks && (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-caption text-ink-muted">
            <Clock className="size-3.5" aria-hidden />
            {t.timelineWeeks} wks
          </span>
        )}
      </figcaption>
      {t.projectSlug && (
        <Link
          href={`/projects/${t.projectSlug}/`}
          className="mt-3 text-caption font-medium text-accent hover:underline focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none"
        >
          See the project →
        </Link>
      )}
    </figure>
  );
}

/* ------------------------------- DesignerCard ------------------------------ */

export function DesignerCard({ designer, className }: { designer: Designer; className?: string }) {
  const d = designer;
  return (
    <article className={cn(cardBase, 'items-start p-5', className)}>
      <div className="flex items-center gap-4">
        <Avatar name={d.name} size="lg" src={<Img image={d.photo} sizes="56px" alt="" />} />
        <div>
          <h3 className="font-display text-h3 text-ink">
            <Link
              href={`/studio/${d.slug}/`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {d.name}
            </Link>
          </h3>
          <p className="text-body-s text-ink-muted">
            {d.role} · {d.experienceYears} yrs
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-body-s text-ink-muted">{d.bio}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {d.specialisations.slice(0, 3).map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
      </div>
    </article>
  );
}

export function roomLabel(room: string) {
  return ROOM_LABELS[room] ?? room;
}

import type { ReactNode } from 'react';

import { Img } from '@/components/ui/img';
import { BeforeAfterSlider } from '@/components/ui/media';
import { FaqAccordion } from '@/components/ui/disclosure';
import { hasImage, img } from '@/data/demo/images';
import { cn } from '@/lib/utils';

/* ------------------------------- CostTable -------------------------------- */

export function CostTable({
  caption,
  columns,
  rows,
  note,
}: {
  caption?: string;
  columns: string[];
  rows: (string | number)[][];
  note?: string;
}) {
  return (
    <figure className="not-prose my-8">
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[560px] border-collapse text-body-s">
          {caption && (
            <caption className="px-4 pt-4 pb-2 text-left font-display text-body-l text-ink">
              {caption}
            </caption>
          )}
          <thead>
            <tr className="border-b border-line bg-surface-sunk/60 text-left">
              {columns.map((c, i) => (
                <th
                  key={i}
                  scope="col"
                  className={cn('px-4 py-2.5 font-semibold overline', i > 0 && 'whitespace-nowrap')}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-line/60 last:border-0">
                {r.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      'px-4 py-2.5 align-top',
                      ci === 0 ? 'font-medium text-ink' : 'text-ink-muted',
                      ci > 0 && /^[₹\d]/.test(String(cell)) && 'whitespace-nowrap tabular-nums',
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <figcaption className="mt-2 text-caption text-ink-muted">{note}</figcaption>}
    </figure>
  );
}

/* ------------------------------- Checklist -------------------------------- */

export function Checklist({ title, items }: { title?: string; items: string[] }) {
  return (
    <aside className="not-prose my-8 rounded-xl border border-line bg-surface p-5 sm:p-6">
      {title && <h3 className="mb-3 font-display text-h3 text-ink">{title}</h3>}
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 text-body-s text-ink">
            <span
              aria-hidden
              className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-accent/40 bg-accent/10 text-accent"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* -------------------------------- Callout --------------------------------- */

const TONES = {
  tip: 'border-success/40 bg-success/5 [&_h4]:text-success',
  info: 'border-accent/40 bg-accent/5 [&_h4]:text-accent',
  warning: 'border-warning/50 bg-warning/5 [&_h4]:text-warning',
} as const;

export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside
      role="note"
      className={cn('not-prose my-8 rounded-xl border border-l-4 p-5', TONES[tone])}
    >
      {title && <h4 className="mb-1.5 text-body font-semibold">{title}</h4>}
      <div className="text-body-s text-ink [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
    </aside>
  );
}

/* ---------------------------------- FAQ ----------------------------------- */

export function FAQ({
  items,
  title = 'Frequently asked',
}: {
  items?: { q: string; a: string }[];
  title?: string;
}) {
  if (!items?.length) return null;
  return (
    <section className="not-prose my-10" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-4 font-display text-h3 text-ink">
        {title}
      </h2>
      <FaqAccordion items={items} />
    </section>
  );
}

/* ------------------------------ BeforeAfter ------------------------------- */

export function BeforeAfter({
  before,
  after,
  caption,
}: {
  before: string;
  after: string;
  caption?: string;
}) {
  if (!hasImage(before) || !hasImage(after)) return null;
  const b = img(before);
  const a = img(after);
  return (
    <figure className="not-prose my-8">
      <BeforeAfterSlider
        before={<Img image={b} fill />}
        after={<Img image={a} fill />}
        className="aspect-[3/2] rounded-xl"
      />
      {caption && <figcaption className="mt-2 text-caption text-ink-muted">{caption}</figcaption>}
    </figure>
  );
}

/* -------------------------------- Figure ---------------------------------- */

export function Figure({ image, caption, alt }: { image: string; caption?: string; alt?: string }) {
  if (!hasImage(image)) return null;
  return (
    <figure className="not-prose my-8">
      <Img
        image={img(image)}
        alt={alt}
        className="rounded-xl"
        sizes="(min-width: 1024px) 720px, 100vw"
      />
      {caption && <figcaption className="mt-2 text-caption text-ink-muted">{caption}</figcaption>}
    </figure>
  );
}

/* ----------------------------- Component map ------------------------------ */

/** Build the component map for a post; FAQ is bound to the post's frontmatter. */
export function mdxComponents(faq?: { q: string; a: string }[]) {
  return {
    CostTable,
    Checklist,
    Callout,
    BeforeAfter,
    Figure,
    FAQ: (p: { title?: string }) => <FAQ items={faq} {...p} />,
  };
}

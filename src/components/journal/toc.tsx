'use client';

import { useEffect, useState } from 'react';

import type { TocItem } from '@/lib/journal';
import { cn } from '@/lib/utils';

export function TableOfContents({ items, className }: { items: TocItem[]; className?: string }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (!items.length || typeof IntersectionObserver === 'undefined') return;
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        if (visible.size) {
          const top = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
          if (top) setActive(top[0]);
        }
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: [0, 1] },
    );
    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [items]);

  if (!items.length) return null;
  return (
    <nav aria-label="On this page" className={cn('text-body-s', className)}>
      <p className="mb-3 overline">On this page</p>
      <ol className="space-y-1 border-l border-line">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-current={active === it.id ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l-2 py-1 pl-3 text-ink-muted transition-colors hover:text-ink',
                it.depth === 3 && 'pl-6 text-caption',
                active === it.id ? 'border-accent text-ink' : 'border-transparent',
              )}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

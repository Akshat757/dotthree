'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';

import { PostCard } from '@/components/journal/post-card';
import { Chip, EmptyState } from '@/components/ui/display';
import type { PostSummary } from '@/lib/journal';

function Filters({
  posts,
  categories,
  tags,
}: {
  posts: PostSummary[];
  categories: readonly string[];
  tags: string[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const category = sp.get('category');
  const tag = sp.get('tag');

  const go = (q: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(q)) if (v) u.set(k, v);
    const qs = u.toString();
    router.replace(`/journal/${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const filtered = useMemo(
    () =>
      posts.filter((p) => (!category || p.category === category) && (!tag || p.tags.includes(tag))),
    [posts, category, tag],
  );
  const featured =
    !category && !tag ? (filtered.find((p) => p.featured) ?? filtered[0]) : undefined;
  const rest = featured ? filtered.filter((p) => p !== featured) : filtered;

  return (
    <>
      <div
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Filter by category"
      >
        <Chip selected={!category && !tag} onClick={() => go({})}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c} selected={category === c} onClick={() => go({ category: c })}>
            {c}
          </Chip>
        ))}
      </div>
      {tag && (
        <p className="mt-4 text-body-s text-ink-muted" aria-live="polite">
          Tagged <span className="font-medium text-ink">#{tag}</span> ·{' '}
          <button
            type="button"
            onClick={() => go({})}
            className="text-accent underline-offset-4 hover:underline"
          >
            clear
          </button>
        </p>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="Nothing here yet"
          description="Try another category, or browse everything."
          action={
            <Link href="/journal/" className="text-accent underline-offset-4 hover:underline">
              All articles
            </Link>
          }
        />
      ) : (
        <>
          {featured && <PostCard post={featured} featured priority className="mt-8" />}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </>
      )}

      <div className="mt-14 border-t border-line pt-8">
        <p className="overline">Browse by tag</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <li key={t}>
              <Chip size="sm" selected={tag === t} onClick={() => go(tag === t ? {} : { tag: t })}>
                #{t}
              </Chip>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function Fallback() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton aspect-[3/2]" />
      ))}
    </div>
  );
}

export function JournalIndex(props: {
  posts: PostSummary[];
  categories: readonly string[];
  tags: string[];
}) {
  return (
    <Suspense fallback={<Fallback />}>
      <Filters {...props} />
    </Suspense>
  );
}

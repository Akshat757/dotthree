import Link from 'next/link';

import { Img } from '@/components/ui/img';
import { Badge } from '@/components/ui/display';
import type { PostSummary } from '@/lib/journal';
import { cn } from '@/lib/utils';

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00+05:30`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

export function PostCard({
  post,
  featured,
  priority,
  className,
}: {
  post: PostSummary;
  featured?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const href = `/journal/${post.slug}/`;
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-lg',
        featured && 'md:grid md:grid-cols-2',
        className,
      )}
    >
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        <Img
          image={post.heroImage}
          alt=""
          priority={priority}
          aspect={featured ? '4 / 3' : '3 / 2'}
          sizes={
            featured
              ? '(min-width: 1024px) 600px, 100vw'
              : '(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw'
          }
          imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className={cn('flex flex-1 flex-col p-5', featured && 'md:p-8 lg:p-10')}>
        <div className="flex flex-wrap items-center gap-2 text-caption text-ink-muted">
          <Badge tone="neutral">{post.category}</Badge>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
        <h3 className={cn('mt-3 font-display text-ink', featured ? 'text-h2' : 'text-h3')}>
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {post.title}
          </Link>
        </h3>
        <p
          className={cn(
            'mt-2 text-ink-muted',
            featured ? 'text-body-l' : 'line-clamp-3 text-body-s',
          )}
        >
          {post.excerpt}
        </p>
        {post.authorProfile && (
          <p className="mt-auto pt-4 text-caption text-ink-muted">
            By <span className="text-ink">{post.authorProfile.name}</span> ·{' '}
            {post.authorProfile.role}
          </p>
        )}
      </div>
    </article>
  );
}

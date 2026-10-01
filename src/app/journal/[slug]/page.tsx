import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { Container, Section } from '@/components/layout';
import { PostCard, formatDate } from '@/components/journal/post-card';
import { TableOfContents } from '@/components/journal/toc';
import { mdxComponents } from '@/components/mdx';
import { Avatar, Badge, Breadcrumb } from '@/components/ui/display';
import { Button } from '@/components/ui/button';
import { Img } from '@/components/ui/img';
import { imgSrc } from '@/data/demo/images';
import { getAllPosts, getPost, getRelatedPosts } from '@/lib/journal';
import { JsonLd, absUrl, breadcrumbLd, organisationLd } from '@/lib/seo/jsonld';

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `/journal/${post.slug}/`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: post.authorProfile ? [post.authorProfile.name] : undefined,
      tags: post.tags,
      images: [{ url: imgSrc(post.heroImage, 1200, 'webp'), width: 1200, alt: post.title }],
    },
  };
}

export default async function JournalPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { content } = await compileMDX({
    source: post.body,
    components: mdxComponents(post.faq),
    options: {
      mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] },
    },
  });

  const related = getRelatedPosts(post, 3);
  const author = post.authorProfile;
  const url = `/journal/${post.slug}/`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: [absUrl(imgSrc(post.heroImage, 1200, 'webp'))],
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: author
      ? {
          '@type': 'Person',
          name: author.name,
          jobTitle: author.role,
          url: absUrl(`/studio/#${author.slug}`),
        }
      : undefined,
    publisher: organisationLd(),
    mainEntityOfPage: absUrl(url),
    wordCount: post.wordCount,
    keywords: post.tags.join(', '),
    articleSection: post.category,
  };
  const faqLd = post.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  return (
    <>
      <JsonLd data={articleLd} />
      {faqLd && <JsonLd data={faqLd} />}
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Journal', href: '/journal/' },
          { name: post.title, href: url },
        ])}
      />

      <article>
        <Section className="pb-0">
          <Container size="lg">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Journal', href: '/journal/' },
                { label: post.category },
              ]}
            />
            <header className="mt-6 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-caption text-ink-muted">
                <Badge tone="accent">{post.category}</Badge>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden>·</span>
                <span>{post.readingMinutes} min read</span>
                {post.updated && (
                  <>
                    <span aria-hidden>·</span>
                    <span>Updated {formatDate(post.updated)}</span>
                  </>
                )}
              </div>
              <h1 className="mt-4 font-display text-display-l text-ink">{post.title}</h1>
              <p className="mt-5 text-body-l text-ink-muted">{post.excerpt}</p>
              {author && (
                <div className="mt-6 flex items-center gap-3">
                  <Avatar
                    name={author.name}
                    src={<Img image={author.photo} alt="" sizes="48px" />}
                  />
                  <div className="text-body-s">
                    <p className="font-medium text-ink">{author.name}</p>
                    <p className="text-ink-muted">{author.role}</p>
                  </div>
                </div>
              )}
            </header>
            <Img
              image={post.heroImage}
              priority
              aspect="21 / 9"
              className="mt-10 rounded-2xl"
              sizes="(min-width: 1280px) 1024px, 100vw"
            />
          </Container>
        </Section>

        <Section className="pt-10">
          <Container size="lg">
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
              <div className="article-prose prose-measure">
                {content}

                <aside className="not-prose mt-12 rounded-2xl bg-accent-soft/60 p-6 sm:p-8">
                  <p className="overline">Want this for your home?</p>
                  <h2 className="mt-2 font-display text-h3 text-ink">
                    Get a line-by-line estimate in two minutes, or talk to a designer.
                  </h2>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href="/estimate/">Build an estimate</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/consultation/">Book a consultation</Link>
                    </Button>
                  </div>
                </aside>

                {post.tags.length > 0 && (
                  <ul className="not-prose mt-10 flex flex-wrap gap-2" aria-label="Tags">
                    {post.tags.map((t) => (
                      <li key={t}>
                        <Link href={`/journal/?tag=${encodeURIComponent(t)}`}>
                          <Badge tone="outline">#{t}</Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {author && (
                  <div className="not-prose mt-10 flex gap-4 border-t border-line pt-8">
                    <Avatar
                      name={author.name}
                      size="lg"
                      src={<Img image={author.photo} alt="" sizes="64px" />}
                    />
                    <div>
                      <p className="overline">Written by</p>
                      <p className="mt-1 font-display text-h3 text-ink">{author.name}</p>
                      <p className="text-body-s text-ink-muted">
                        {author.role} · {author.experienceYears} years
                      </p>
                      <p className="mt-2 text-body-s text-ink-muted">{author.bio}</p>
                      <Link
                        href={`/studio/#${author.slug}`}
                        className="mt-2 inline-block text-body-s text-accent underline-offset-4 hover:underline"
                      >
                        More about {author.name.split(' ')[0]}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-28">
                  <TableOfContents items={post.toc} />
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {related.length > 0 && (
          <Section tone="sunk">
            <Container>
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="overline">Keep reading</p>
                  <h2 className="mt-2 font-display text-h2 text-ink">Related articles</h2>
                </div>
                <Link
                  href="/journal/"
                  className="text-body-s text-accent underline-offset-4 hover:underline"
                >
                  All articles
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {related.map((r) => (
                  <PostCard key={r.slug} post={r} />
                ))}
              </div>
            </Container>
          </Section>
        )}
      </article>
    </>
  );
}

/**
 * Journal content loader — reads `content/journal/*.mdx` at build time (server only).
 * Pages compile the body with next-mdx-remote; this module owns frontmatter,
 * ordering, related posts, TOC extraction and the RSS feed body.
 *
 * Node-only (uses `fs`); never import from a client component. We deliberately
 * do not use the `server-only` marker so unit tests and scripts can load it.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import GithubSlugger, { slug } from 'github-slugger';
import matter from 'gray-matter';
import { z } from 'zod';

import { getDesigner } from '@/data/demo/designers';
import { img } from '@/data/demo/images';
import type { Designer, ImageRef } from '@/types/content';

const JOURNAL_DIR = join(process.cwd(), 'content', 'journal');

export const JOURNAL_CATEGORIES = [
  'Costs & Budgeting',
  'Materials',
  'Planning & Process',
  'Small Spaces',
  'Indian Living',
  'Colour & Light',
] as const;
export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];

const frontmatterSchema = z.object({
  title: z.string().min(8),
  excerpt: z.string().min(40).max(320),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  author: z.string(),
  category: z.enum(JOURNAL_CATEGORIES),
  tags: z.array(z.string()).min(1).max(8),
  image: z.string(),
  imageRoom: z.string().optional(),
  imageStyle: z.string().optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  related: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});
export type JournalFrontmatter = z.infer<typeof frontmatterSchema>;

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface JournalPost extends JournalFrontmatter {
  slug: string;
  body: string;
  readingMinutes: number;
  wordCount: number;
  heroImage: ImageRef;
  authorProfile?: Designer;
  toc: TocItem[];
}

/** Card-sized projection safe to ship to client components (no body/toc/faq). */
export type PostSummary = Omit<
  JournalPost,
  'body' | 'toc' | 'faq' | 'related' | 'authorProfile'
> & {
  authorProfile?: Pick<Designer, 'slug' | 'name' | 'role'>;
};

export function toSummary(p: JournalPost): PostSummary {
  const { body: _b, toc: _t, faq: _f, related: _r, authorProfile, ...rest } = p;
  return {
    ...rest,
    authorProfile: authorProfile
      ? { slug: authorProfile.slug, name: authorProfile.name, role: authorProfile.role }
      : undefined,
  };
}

/** GitHub-style slug — the same slugger rehype-slug uses, so TOC ids always match. */
export function slugifyHeading(text: string): string {
  return slug(text.replace(/<[^>]+>/g, ''));
}

function extractToc(body: string): TocItem[] {
  const out: TocItem[] = [];
  const slugger = new GithubSlugger();
  let inCode = false;
  for (const raw of body.split('\n')) {
    const line = raw.trimEnd();
    if (line.startsWith('```')) inCode = !inCode;
    if (inCode) continue;
    const m = /^(##|###)\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = m[2]!.replace(/[*_`]/g, '');
    out.push({ id: slugger.slug(text), text, depth: m[1] === '##' ? 2 : 3 });
  }
  return out;
}

function wordCountOf(body: string): number {
  return (
    body
      // Keep the prose inside JSX props (table rows, checklist items) — only drop the tag syntax.
      .replace(/<[^>]+>/g, (tag) => (tag.match(/'[^']*'|"[^"]*"/g) ?? []).join(' '))
      .replace(/[`*_#>|'"-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length
  );
}

let cache: JournalPost[] | null = null;

export function getAllPosts(): JournalPost[] {
  if (cache) return cache;
  const files = readdirSync(JOURNAL_DIR).filter((f) => f.endsWith('.mdx'));
  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '');
    const raw = readFileSync(join(JOURNAL_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const parsed = frontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `Invalid frontmatter in content/journal/${file}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      );
    }
    const fm = parsed.data;
    const wordCount = wordCountOf(content);
    const post: JournalPost = {
      ...fm,
      slug,
      body: content,
      wordCount,
      readingMinutes: Math.max(1, Math.round(wordCount / 220)),
      heroImage: { ...img(fm.image), alt: fm.title },
      authorProfile: getDesigner(fm.author),
      toc: extractToc(content),
    };
    return post;
  });
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  cache = posts;
  return posts;
}

export function getPost(slug: string): JournalPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getRelatedPosts(post: JournalPost, n = 3): JournalPost[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  const explicit = (post.related ?? [])
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is JournalPost => Boolean(p));
  const scored = all
    .filter((p) => !explicit.includes(p))
    .map((p) => ({
      p,
      score:
        (p.category === post.category ? 2 : 0) + p.tags.filter((t) => post.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
  return [...explicit, ...scored].slice(0, n);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of getAllPosts()) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByCategory(category: JournalCategory): JournalPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

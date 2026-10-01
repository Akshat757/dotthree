import { site } from '@/config/site';
import { imgSrc } from '@/data/demo/images';
import { getAllPosts } from '@/lib/journal';
import { absUrl } from '@/lib/seo/jsonld';

export const dynamic = 'force-static';

function esc(s: string): string {
  return s.replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!,
  );
}

export function GET() {
  const posts = getAllPosts();
  const latest = posts[0]?.date ?? '2026-01-01';
  const items = posts
    .map((p) => {
      const url = absUrl(`/journal/${p.slug}/`);
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${p.date}T06:00:00+05:30`).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
      <category>${esc(p.category)}</category>
      ${p.authorProfile ? `<dc:creator>${esc(p.authorProfile.name)}</dc:creator>` : ''}
      <enclosure url="${absUrl(imgSrc(p.heroImage, 1200, 'webp'))}" type="image/webp" length="0" />
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(site.name)} Journal</title>
    <link>${absUrl('/journal/')}</link>
    <atom:link href="${absUrl('/journal/rss.xml')}" rel="self" type="application/rss+xml" />
    <description>Honest guides to interior costs, materials and process in Indore.</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date(`${latest}T06:00:00+05:30`).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}

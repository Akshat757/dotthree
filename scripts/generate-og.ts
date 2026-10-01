/**
 * Renders Open Graph cards (1200×630 PNG) to public/og/:
 *   default.png, projects/<slug>.png, services/<slug>.png, journal/<slug>.png,
 *   styles/<slug>.png, rooms/<slug>.png
 *
 * Text is laid out with satori. Fonts: Fraunces + Inter static TTFs fetched once
 * from Google Fonts into .cache/fonts/ (zero-cost, cached). If the fetch fails
 * (offline), the script falls back to a plain SVG rendered by sharp with system
 * serif/sans fonts so the build never breaks.
 *
 * Run: npm run assets:og
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import satori from 'satori';
import sharp from 'sharp';

import { site } from '../src/config/site';
import { imgSrc, projects, roomGuides, services, styles } from '../src/data/demo';
import { JOURNAL_DOCS } from '../src/data/journal.generated';
import type { ImageRef } from '../src/types/content';

const W = 1200;
const H = 630;
const ACCENT = '#b5643c';
const CANVAS = '#fbf9f6';
const INK = '#1c1b19';
const MUTED = '#6b655c';
const LINE = '#e7e1d8';

const ROOT = process.cwd();
const OUT = join(ROOT, 'public', 'og');
const CACHE = join(ROOT, '.cache', 'fonts');

interface Card {
  file: string;
  overline: string;
  title: string;
  description?: string;
  image?: string; // absolute path to a webp/avif derivative
}

/* ------------------------------- fonts ------------------------------------ */

const FONT_URLS: Record<string, string> = {
  'fraunces-500.woff': 'https://fonts.googleapis.com/css2?family=Fraunces:wght@500',
  'inter-400.woff': 'https://fonts.googleapis.com/css2?family=Inter:wght@400',
  'inter-600.woff': 'https://fonts.googleapis.com/css2?family=Inter:wght@600',
};
// An old UA makes Google Fonts serve plain TTF/WOFF (satori cannot read woff2).
const TTF_UA = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:12.0) Gecko/20100101 Firefox/12.0';

async function fetchTtf(cssUrl: string): Promise<Buffer> {
  const css = await (await fetch(cssUrl, { headers: { 'user-agent': TTF_UA } })).text();
  const m = css.match(/src:\s*url\((https:[^)]+\.(?:ttf|woff))\)/);
  if (!m?.[1]) throw new Error(`no ttf/woff url in css for ${cssUrl}`);
  const res = await fetch(m[1]);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${m[1]}`);
  return Buffer.from(await res.arrayBuffer());
}

async function loadFonts(): Promise<Buffer[] | null> {
  mkdirSync(CACHE, { recursive: true });
  const out: Buffer[] = [];
  for (const [file, url] of Object.entries(FONT_URLS)) {
    const p = join(CACHE, file);
    if (!existsSync(p)) {
      try {
        writeFileSync(p, await fetchTtf(url));
      } catch (err) {
        console.warn(`⚠ could not fetch ${file}: ${(err as Error).message}`);
        return null;
      }
    }
    out.push(readFileSync(p));
  }
  return out;
}

/* ------------------------------ layout ------------------------------------ */

function trunc(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

function h(type: string, props: Record<string, unknown>, ...children: unknown[]) {
  return { type, props: { ...props, children: children.length <= 1 ? children[0] : children } };
}

const monogram = h(
  'svg',
  { width: 56, height: 56, viewBox: '0 0 32 32' },
  h('rect', { x: 1, y: 1, width: 30, height: 30, rx: 6, fill: ACCENT }),
  h('path', {
    d: 'M8 24 16 8l8 16M11.5 18h9',
    stroke: CANVAS,
    strokeWidth: 2.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  }),
);

function cardTree(c: Card, withImage: boolean) {
  const textW = withImage ? 680 : W - 160;
  const titleSize = c.title.length > 60 ? 52 : c.title.length > 38 ? 60 : 72;
  return h(
    'div',
    {
      style: {
        width: W,
        height: H,
        display: 'flex',
        background: CANVAS,
        color: INK,
        fontFamily: 'Inter',
        position: 'relative',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          width: withImage ? 760 : W,
          height: H,
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 16 } },
        monogram,
        h(
          'div',
          { style: { display: 'flex', fontFamily: 'Fraunces', fontSize: 30, letterSpacing: -0.5 } },
          site.shortName,
          h('span', { style: { color: MUTED, fontWeight: 400, marginLeft: 8 } }, 'Design Studio'),
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', width: textW } },
        h(
          'div',
          {
            style: {
              display: 'flex',
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              color: ACCENT,
            },
          },
          c.overline,
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              fontFamily: 'Fraunces',
              fontSize: titleSize,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              marginTop: 14,
            },
          },
          trunc(c.title, 90),
        ),
        c.description
          ? h(
              'div',
              { style: { display: 'flex', fontSize: 24, lineHeight: 1.4, color: MUTED, marginTop: 20 } },
              trunc(c.description, 140),
            )
          : null,
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 20,
            color: MUTED,
            borderTop: `1px solid ${LINE}`,
            paddingTop: 20,
            width: textW,
          },
        },
        h('span', {}, `${site.address.city} · ${site.address.state}`),
        h('span', {}, site.url.replace(/^https?:\/\//, '')),
      ),
    ),
  );
}

/** Offline fallback: plain SVG with system fonts. */
function fallbackSvg(c: Card, withImage: boolean): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const textW = withImage ? 640 : W - 160;
  const words = c.title.split(' ');
  const lines: string[] = [];
  let cur = '';
  const maxChars = Math.floor(textW / 30);
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  const titleLines = lines
    .slice(0, 3)
    .map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 66}">${esc(l)}</tspan>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${CANVAS}"/>
  <rect x="80" y="64" width="56" height="56" rx="11" fill="${ACCENT}"/>
  <path d="M94 106l14-28 14 28M100 95.5h16" stroke="${CANVAS}" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <text x="152" y="103" font-family="Georgia, serif" font-size="30" fill="${INK}">${esc(site.shortName)} <tspan fill="${MUTED}">Design Studio</tspan></text>
  <text x="80" y="230" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="600" letter-spacing="2.2" fill="${ACCENT}">${esc(c.overline.toUpperCase())}</text>
  <text x="80" y="300" font-family="Georgia, serif" font-size="58" fill="${INK}">${titleLines}</text>
  ${c.description ? `<text x="80" y="${300 + Math.min(lines.length, 3) * 66 + 10}" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="${MUTED}">${esc(trunc(c.description, Math.floor(textW / 12)))}</text>` : ''}
  <line x1="80" y1="546" x2="${80 + textW}" y2="546" stroke="${LINE}"/>
  <text x="80" y="580" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="${MUTED}">${esc(`${site.address.city} · ${site.address.state}`)}</text>
  <text x="${80 + textW}" y="580" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="${MUTED}">${esc(site.url.replace(/^https?:\/\//, ''))}</text>
</svg>`;
}

/* ------------------------------ render ------------------------------------ */

async function render(c: Card, fonts: Buffer[] | null) {
  const withImage = !!c.image && existsSync(c.image);
  let svg: string;
  if (fonts) {
    const [fraunces, inter400, inter600] = fonts as [Buffer, Buffer, Buffer];
    svg = await satori(cardTree(c, withImage) as never, {
      width: W,
      height: H,
      fonts: [
        { name: 'Fraunces', data: fraunces, weight: 500, style: 'normal' },
        { name: 'Inter', data: inter400, weight: 400, style: 'normal' },
        { name: 'Inter', data: inter600, weight: 600, style: 'normal' },
      ],
    });
  } else {
    svg = fallbackSvg(c, withImage);
  }

  let pipeline = sharp(Buffer.from(svg)).resize(W, H);
  if (withImage) {
    const photo = await sharp(c.image!)
      .resize(440, H, { fit: 'cover', position: 'attention' })
      .toBuffer();
    pipeline = pipeline.composite([{ input: photo, left: W - 440, top: 0 }]);
  }
  const dest = join(OUT, c.file);
  mkdirSync(join(dest, '..'), { recursive: true });
  await pipeline.png({ compressionLevel: 9, palette: true }).toFile(dest);
}

function heroPath(ref: ImageRef) {
  // imgSrc gives the public URL; map to the file on disk.
  return join(ROOT, 'public', imgSrc(ref, 1200, 'webp'));
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const fonts = await loadFonts();
  if (!fonts) console.warn('⚠ rendering OG cards with system fonts (offline fallback)');

  const cards: Card[] = [
    {
      file: 'default.png',
      overline: 'Interior design · Indore',
      title: site.tagline,
      description: `${site.stats.projectsCompleted}+ homes and workplaces delivered across Indore in ${site.stats.yearsExperience} years.`,
    },
    ...projects.map((p) => ({
      file: `projects/${p.slug}.png`,
      overline: [p.bhk, p.locality, p.city].filter(Boolean).join(' · '),
      title: p.title,
      description: p.brief,
      image: heroPath(p.heroImage),
    })),
    ...services.map((s) => ({
      file: `services/${s.slug}.png`,
      overline: 'Service',
      title: s.name,
      description: s.tagline,
      image: heroPath(s.heroImage),
    })),
    ...styles.map((s) => ({
      file: `styles/${s.slug}.png`,
      overline: 'Style guide',
      title: s.name,
      description: s.tagline,
      image: heroPath(s.heroImage),
    })),
    ...roomGuides.map((r) => ({
      file: `rooms/${r.slug}.png`,
      overline: 'Room guide',
      title: r.name,
      description: r.tagline,
      image: heroPath(r.heroImage),
    })),
    ...JOURNAL_DOCS.map((j) => ({
      file: `journal/${j.slug}.png`,
      overline: j.category,
      title: j.title,
      description: j.excerpt,
    })),
  ];

  let n = 0;
  for (const c of cards) {
    await render(c, fonts);
    n++;
  }
  console.log(`✔ ${n} OG cards → public/og`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import type { MetadataRoute } from 'next';

import { site } from '@/config/site';
import {
  designers,
  localities,
  projects,
  roomGuides,
  roomTemplates,
  services,
  styles,
  materials,
} from '@/data/demo';
import { JOURNAL_DOCS } from '@/data/journal.generated';

export const dynamic = 'force-static';

type Entry = MetadataRoute.Sitemap[number];

const STATIC: { path: string; priority: number; freq: Entry['changeFrequency'] }[] = [
  { path: '/', priority: 1, freq: 'weekly' },
  { path: '/projects/', priority: 0.9, freq: 'weekly' },
  { path: '/services/', priority: 0.9, freq: 'monthly' },
  { path: '/visualiser/', priority: 0.9, freq: 'monthly' },
  { path: '/estimate/', priority: 0.9, freq: 'monthly' },
  { path: '/materials/', priority: 0.8, freq: 'weekly' },
  { path: '/styles/', priority: 0.7, freq: 'monthly' },
  { path: '/rooms/', priority: 0.7, freq: 'monthly' },
  { path: '/quiz/', priority: 0.6, freq: 'yearly' },
  { path: '/studio/', priority: 0.7, freq: 'monthly' },
  { path: '/studio/careers/', priority: 0.3, freq: 'monthly' },
  { path: '/process/', priority: 0.7, freq: 'yearly' },
  { path: '/gallery/', priority: 0.7, freq: 'monthly' },
  { path: '/testimonials/', priority: 0.6, freq: 'monthly' },
  { path: '/contact/', priority: 0.8, freq: 'yearly' },
  { path: '/consultation/', priority: 0.8, freq: 'yearly' },
  { path: '/locations/', priority: 0.7, freq: 'monthly' },
  { path: '/journal/', priority: 0.8, freq: 'weekly' },
  { path: '/moodboards/', priority: 0.4, freq: 'yearly' },
  { path: '/legal/privacy/', priority: 0.2, freq: 'yearly' },
  { path: '/legal/terms/', priority: 0.2, freq: 'yearly' },
  { path: '/legal/image-credits/', priority: 0.2, freq: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const abs = (p: string) => new URL(p, site.url).toString();
  const entry = (
    path: string,
    priority: number,
    changeFrequency: Entry['changeFrequency'],
    lastModified: Date | string = now,
  ): Entry => ({ url: abs(path), priority, changeFrequency, lastModified });

  return [
    ...STATIC.map((s) => entry(s.path, s.priority, s.freq)),
    ...projects.map((p) => entry(`/projects/${p.slug}/`, 0.8, 'monthly', p.completedOn)),
    ...services.map((s) => entry(`/services/${s.slug}/`, 0.8, 'monthly')),
    ...styles.map((s) => entry(`/styles/${s.slug}/`, 0.6, 'monthly')),
    ...roomGuides.map((r) => entry(`/rooms/${r.slug}/`, 0.6, 'monthly')),
    ...materials.map((m) => entry(`/materials/${m.slug}/`, 0.4, 'monthly')),
    ...designers.map((d) => entry(`/studio/${d.slug}/`, 0.5, 'monthly')),
    ...localities.map((l) => entry(`/locations/${l.slug}/`, 0.6, 'monthly')),
    ...roomTemplates.map((t) => entry(`/visualiser/edit/?template=${t.slug}`, 0.5, 'monthly')),
    ...JOURNAL_DOCS.map((j) => entry(`/journal/${j.slug}/`, 0.7, 'yearly', j.date)),
  ];
}

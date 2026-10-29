'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';

import { Container, Section } from '@/components/layout';
import { PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/display';
import { Input } from '@/components/ui/input';
import { getAdapters, type SearchHit, type SearchScope } from '@/lib/adapters';
import { cn } from '@/lib/utils';

const SCOPES: { value: SearchScope; label: string }[] = [
  { value: 'projects', label: 'Projects' },
  { value: 'materials', label: 'Materials' },
  { value: 'journal', label: 'Journal' },
  { value: 'styles', label: 'Styles' },
  { value: 'services', label: 'Services' },
  { value: 'rooms', label: 'Rooms' },
];

const SUGGESTIONS = [
  'modular kitchen',
  'wardrobe laminate',
  'Vijay Nagar 3BHK',
  'vastu',
  'Italian marble',
  'budget 2BHK',
];

export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialQ = params.get('q') ?? '';

  const [q, setQ] = React.useState(initialQ);
  const [scope, setScope] = React.useState<SearchScope | 'all'>('all');
  const [hits, setHits] = React.useState<SearchHit[]>([]);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search + URL sync
  React.useEffect(() => {
    const query = q.trim();
    const t = setTimeout(async () => {
      const u = new URLSearchParams();
      if (query) u.set('q', query);
      const next = u.toString() ? `${pathname}?${u}` : pathname;
      if (next !== `${pathname}${window.location.search}`) router.replace(next, { scroll: false });

      if (query.length < 2) {
        setHits([]);
        return;
      }
      setBusy(true);
      try {
        const res = await getAdapters().content.search(
          query,
          scope === 'all' ? undefined : [scope],
        );
        setHits(res);
      } finally {
        setBusy(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q, scope, pathname, router]);

  const grouped = React.useMemo(() => {
    const map = new Map<SearchScope, SearchHit[]>();
    for (const h of hits) (map.get(h.scope) ?? map.set(h.scope, []).get(h.scope)!).push(h);
    return SCOPES.filter((s) => map.has(s.value)).map((s) => ({ ...s, hits: map.get(s.value)! }));
  }, [hits]);

  const counts = React.useMemo(() => {
    const c: Partial<Record<SearchScope, number>> = {};
    for (const h of hits) c[h.scope] = (c[h.scope] ?? 0) + 1;
    return c;
  }, [hits]);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
        overline="Search"
        title="Find a project, material or guide"
        className="pb-6 md:pb-8"
      />
      <Section className="pt-0 md:pt-0">
        <Container className="max-w-4xl">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              inputRef.current?.blur();
            }}
          >
            <Input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try “modular kitchen under 3 lakh” or “Italian marble”"
              aria-label="Search the site"
              leading={<SearchIcon className="size-4" aria-hidden />}
              className="text-body-l"
              autoComplete="off"
            />
          </form>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
            <Chip size="sm" selected={scope === 'all'} onClick={() => setScope('all')}>
              All{hits.length ? ` · ${hits.length}` : ''}
            </Chip>
            {SCOPES.map((s) => (
              <Chip
                key={s.value}
                size="sm"
                selected={scope === s.value}
                onClick={() => setScope(scope === s.value ? 'all' : s.value)}
              >
                {s.label}
                {counts[s.value] ? ` · ${counts[s.value]}` : ''}
              </Chip>
            ))}
          </div>

          <div className="mt-8" aria-live="polite" aria-busy={busy}>
            {q.trim().length < 2 ? (
              <div>
                <p className="text-body-s text-ink-muted">Popular searches</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <Chip key={s} onClick={() => setQ(s)}>
                      {s}
                    </Chip>
                  ))}
                </div>
                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[
                    { href: '/projects/', label: 'All projects' },
                    { href: '/materials/', label: 'Material library' },
                    { href: '/journal/', label: 'Journal & guides' },
                  ].map((l) => (
                    <Button key={l.href} asChild variant="outline">
                      <Link href={l.href}>
                        {l.label} <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            ) : hits.length === 0 && !busy ? (
              <div className="rounded-lg border border-dashed border-line p-8 text-center">
                <p className="font-medium text-ink">Nothing matched “{q.trim()}”.</p>
                <p className="mt-1 text-body-s text-ink-muted">
                  Try a room, a material name, a locality, or a simpler word.
                </p>
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/contact/">Ask the studio instead</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-10">
                {grouped.map((g) => (
                  <section key={g.value} aria-labelledby={`search-${g.value}`}>
                    <h2 id={`search-${g.value}`} className="overline">
                      {g.label} <span className="text-ink-subtle">· {g.hits.length}</span>
                    </h2>
                    <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
                      {g.hits.map((h) => (
                        <li key={`${h.scope}-${h.slug}`}>
                          <Link
                            href={h.href}
                            className={cn(
                              'flex items-center gap-4 p-4 transition-colors hover:bg-surface-sunk',
                            )}
                          >
                            {h.image && (
                              <span
                                aria-hidden
                                className="size-14 shrink-0 rounded-md bg-surface-sunk bg-cover bg-center"
                                style={{ backgroundImage: `url(${h.image}-400.webp)` }}
                              />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium text-ink">{h.title}</span>
                              {h.subtitle && (
                                <span className="block truncate text-body-s text-ink-muted">
                                  {h.subtitle}
                                </span>
                              )}
                            </span>
                            <ArrowRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, Trash2, Upload } from 'lucide-react';

import { Container, Section } from '@/components/layout';
import { PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/disclosure';
import { useToast } from '@/components/ui/toast';
import { getAdapters } from '@/lib/adapters';
import { downloadBlob, formatInr, titleCase } from '@/lib/utils';
import type { Design, Enquiry, SavedEstimate } from '@/types/local';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function Dashboard() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [estimates, setEstimates] = React.useState<SavedEstimate[]>([]);
  const [designs, setDesigns] = React.useState<Design[]>([]);
  const [enquiries, setEnquiries] = React.useState<Enquiry[]>([]);
  const [usage, setUsage] = React.useState<{
    usedBytes: number;
    quotaBytes: number;
    persistent: boolean;
  } | null>(null);
  const tab = params.get('tab') ?? 'estimates';

  const refresh = React.useCallback(async () => {
    const { user } = getAdapters();
    const [e, d, q, u] = await Promise.all([
      user.listEstimates(),
      user.listDesigns(),
      user.listEnquiries(),
      user.storageUsage(),
    ]);
    setEstimates(e);
    setDesigns(d);
    setEnquiries(q);
    setUsage(u);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const del = async (label: string, fn: () => Promise<void>) => {
    await fn();
    toast({ title: `${label} removed`, tone: 'success' });
    void refresh();
  };

  const exportAll = async () => {
    const blob = await getAdapters().user.exportAll({ includeUploads: false });
    downloadBlob(blob, `aangan-data-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const importFile = async (file: File) => {
    const report = await getAdapters().user.importAll(file);
    toast({
      title: report.ok ? 'Import complete' : 'Import finished with errors',
      description:
        Object.entries(report.counts)
          .map(([k, v]) => `${v} ${k}`)
          .join(', ') || undefined,
      tone: report.ok ? 'success' : 'warning',
    });
    void refresh();
  };

  const clearAll = async () => {
    if (!window.confirm('Delete everything saved on this device? This cannot be undone.')) return;
    await getAdapters().user.deleteAll();
    toast({ title: 'All local data cleared', tone: 'success' });
    void refresh();
  };

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
        overline="Your dashboard"
        title="Everything you've saved, on this device"
        description="Nothing here leaves your browser unless you send it to us on WhatsApp or email."
        className="pb-6 md:pb-8"
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <Tabs
            value={tab}
            onValueChange={(v) => router.replace(`/dashboard/?tab=${v}`, { scroll: false })}
          >
            <TabsList variant="pill">
              <TabsTrigger value="estimates">Estimates ({estimates.length})</TabsTrigger>
              <TabsTrigger value="designs">Designs ({designs.length})</TabsTrigger>
              <TabsTrigger value="enquiries">Enquiries ({enquiries.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="estimates" className="mt-6">
              {estimates.length === 0 ? (
                <Empty cta="/estimate/" label="Get an estimate" />
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {estimates.map((e) => (
                    <li key={e.id} className="rounded-lg border border-line bg-surface p-4">
                      <p className="font-medium text-ink">{e.name}</p>
                      <p className="mt-1 text-body-s text-ink-muted">
                        {e.input.bhk} · {titleCase(e.input.tier)}
                      </p>
                      <p className="tabular mt-2 font-display text-h3 text-ink">
                        {formatInr(e.result.total.low)}–{formatInr(e.result.total.high)}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/estimate/?bhk=${e.input.bhk}&tier=${e.input.tier}&sqft=${e.input.carpetAreaSqft}`}
                          >
                            Resume
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            del('Estimate', () => getAdapters().user.deleteEstimate(e.id))
                          }
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="designs" className="mt-6">
              {designs.length === 0 ? (
                <Empty cta="/visualiser/" label="Try the visualiser" />
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {designs.map((d) => (
                    <li key={d.id} className="rounded-lg border border-line bg-surface p-4">
                      <p className="font-medium text-ink">{d.name}</p>
                      <p className="mt-1 text-body-s text-ink-muted">
                        {d.variantIds.length} variant(s)
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/visualiser/edit/?template=${d.templateSlug ?? ''}`}>
                            Resume
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => del('Design', () => getAdapters().user.deleteDesign(d.id))}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="enquiries" className="mt-6">
              {enquiries.length === 0 ? (
                <Empty cta="/consultation/" label="Book a consultation" />
              ) : (
                <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
                  {enquiries.map((e) => (
                    <li key={e.reference} className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-ink">{e.reference}</p>
                        <Badge tone="outline">{titleCase(e.status)}</Badge>
                      </div>
                      <p className="mt-1 text-body-s text-ink-muted">
                        {titleCase(e.type)} ·{' '}
                        {e.preferredSlot
                          ? `${e.preferredSlot.date} ${e.preferredSlot.time}`
                          : 'No slot set'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-12 grid gap-4 rounded-lg border border-line bg-surface-sunk p-5 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="overline">Storage</p>
              <p className="mt-1 text-body-s text-ink-muted">
                {usage
                  ? `${formatBytes(usage.usedBytes)} used${usage.persistent ? ' · persisted' : ''}`
                  : 'Calculating…'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={exportAll}>
                <Download className="size-4" aria-hidden /> Export
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" aria-hidden /> Import
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void importFile(f);
                  e.target.value = '';
                }}
              />
              <Button size="sm" variant="danger" onClick={clearAll}>
                <Trash2 className="size-4" aria-hidden /> Clear all
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Empty({ cta, label }: { cta: string; label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line p-10 text-center">
      <p className="text-body-s text-ink-muted">Nothing saved here yet.</p>
      <Button asChild className="mt-4" variant="outline">
        <Link href={cta}>{label}</Link>
      </Button>
    </div>
  );
}

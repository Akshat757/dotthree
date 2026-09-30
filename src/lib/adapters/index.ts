/**
 * Adapter resolver — SRS §10. The ONLY module UI code imports adapters from.
 * Implementations are chosen from src/config/runtime.ts; everything is absent-safe.
 */
import { runtime } from '@/config/runtime';

import type { Adapters, LeadSink, UserStore } from './contracts';
import { FragmentShareAdapter } from './impl/fragment-share';
import { IndexedDbUserStore, isIndexedDbAvailable } from './impl/indexeddb-user-store';
import {
  CompositeLeadSink,
  FormRelaySink,
  GoogleSheetsSink,
  LocalRecordSink,
  MailtoSink,
  WhatsAppSink,
} from './impl/lead-sinks';
import { LocalNotifier } from './impl/local-notifier';
import { MemoryUserStore } from './impl/memory-user-store';
import { CloudflareWebAnalytics, HoneypotTimeTrapGuard, NoopAnalytics } from './impl/misc';
import { StaticContentRepo } from './impl/static-content-repo';

export type * from './contracts';

let cached: Adapters | null = null;

function createUserStore(): UserStore {
  if (typeof window !== 'undefined' && isIndexedDbAvailable()) return new IndexedDbUserStore();
  return new MemoryUserStore();
}

function createAdapters(): Adapters {
  const user = createUserStore();
  const { cfAnalyticsToken, leadSheetsWebAppUrl, leadFormRelayEndpoint, leadFormRelayKey } = runtime.integrations;

  const sinks: LeadSink[] = [new LocalRecordSink(user), new WhatsAppSink(), new MailtoSink()];
  if (leadSheetsWebAppUrl) sinks.push(new GoogleSheetsSink(leadSheetsWebAppUrl));
  if (leadFormRelayEndpoint && leadFormRelayKey) sinks.push(new FormRelaySink(leadFormRelayEndpoint, leadFormRelayKey));

  return {
    content: new StaticContentRepo(),
    user,
    leads: new CompositeLeadSink(sinks),
    notifier: new LocalNotifier(),
    share: new FragmentShareAdapter(),
    analytics: cfAnalyticsToken ? new CloudflareWebAnalytics(cfAnalyticsToken) : new NoopAnalytics(),
    botGuard: new HoneypotTimeTrapGuard(),
  };
}

/** Lazily-created singleton. Safe to call during SSR (falls back to the in-memory store). */
export function getAdapters(): Adapters {
  if (!cached) cached = createAdapters();
  return cached;
}

/** Test hook — replace the singleton (e.g. with a MemoryUserStore) and return the previous one. */
export function __setAdaptersForTests(next: Adapters | null): Adapters | null {
  const prev = cached;
  cached = next;
  return prev;
}

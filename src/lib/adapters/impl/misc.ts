import type { Analytics, BotGuard, FormState } from '@/lib/adapters/contracts';

export class NoopAnalytics implements Analytics {
  track(): void {}
  pageview(): void {}
}

/**
 * Cloudflare Web Analytics is a single beacon script that auto-tracks pageviews.
 * Custom events are not supported by the free beacon, so `track` is a no-op that
 * only logs in dev builds. Loading the beacon is handled by <AnalyticsScript/>.
 */
export class CloudflareWebAnalytics implements Analytics {
  constructor(private readonly token: string) {}
  track(event: string, props?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') console.debug('[analytics]', event, props ?? {});
  }
  pageview(): void {
    /* beacon handles it */
  }
  get enabled(): boolean {
    return !!this.token;
  }
}

/** Honeypot + minimum-dwell + client throttle. Sufficient for a static site (SRS §3.2). */
export class HoneypotTimeTrapGuard implements BotGuard {
  private lastSubmit = 0;
  constructor(
    private readonly minDwellMs = 3000,
    private readonly throttleMs = 15000,
  ) {}
  async verify(state: FormState): Promise<{ ok: boolean; reason?: string }> {
    if (state.honeypot && state.honeypot.trim() !== '') return { ok: false, reason: 'honeypot' };
    if (state.submittedAt - state.startedAt < this.minDwellMs) return { ok: false, reason: 'too_fast' };
    if (state.submittedAt - this.lastSubmit < this.throttleMs) return { ok: false, reason: 'throttled' };
    this.lastSubmit = state.submittedAt;
    return { ok: true };
  }
}

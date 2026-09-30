/**
 * LeadSink implementations — SRS §10. Composite runs in order and never throws:
 *   1. LocalRecordSink — always; writes to IndexedDB (via UserStore)
 *   2. WhatsAppSink — builds the wa.me URL with the full transcribed enquiry
 *   3. MailtoSink — fallback link with the same body
 *   4. GoogleSheetsSink — optional, fires only if a Web App URL is configured
 *   5. FormRelaySink — optional, fires only if an endpoint + key are configured
 */
import type { LeadResult, LeadSink, UserStore } from '@/lib/adapters/contracts';
import { buildMailtoUrl, buildWhatsAppUrl } from '@/lib/whatsapp';
import type { Enquiry } from '@/types/local';

export class LocalRecordSink implements LeadSink {
  readonly name = 'local';
  constructor(private readonly store: UserStore) {}
  async submit(enquiry: Enquiry): Promise<Partial<LeadResult>> {
    await this.store.saveEnquiry(enquiry);
    return { reference: enquiry.reference, sinks: [{ name: this.name, ok: true }] };
  }
}

export class WhatsAppSink implements LeadSink {
  readonly name = 'whatsapp';
  async submit(enquiry: Enquiry): Promise<Partial<LeadResult>> {
    const url = buildWhatsAppUrl(enquiry.summaryText);
    return { whatsappUrl: url, sinks: [{ name: this.name, ok: true }] };
  }
}

export class MailtoSink implements LeadSink {
  readonly name = 'mailto';
  async submit(enquiry: Enquiry): Promise<Partial<LeadResult>> {
    const url = buildMailtoUrl(`Consultation enquiry ${enquiry.reference}`, enquiry.summaryText);
    return { mailtoUrl: url, sinks: [{ name: this.name, ok: true }] };
  }
}

/** Free: a Google Apps Script Web App that appends a row to a Sheet. See docs/LEAD-SINK-SETUP.md. */
export class GoogleSheetsSink implements LeadSink {
  readonly name = 'google-sheets';
  constructor(private readonly webAppUrl: string) {}
  async submit(enquiry: Enquiry): Promise<Partial<LeadResult>> {
    if (!this.webAppUrl) return { sinks: [{ name: this.name, ok: false, detail: 'not configured' }] };
    try {
      // Apps Script web apps accept simple POSTs; `no-cors` avoids preflight (response is opaque).
      await fetch(this.webAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(redactForRelay(enquiry)),
      });
      return { sinks: [{ name: this.name, ok: true }] };
    } catch (e) {
      return { sinks: [{ name: this.name, ok: false, detail: (e as Error).message }] };
    }
  }
}

/** Free form relays (Web3Forms / Formspree). */
export class FormRelaySink implements LeadSink {
  readonly name = 'form-relay';
  constructor(
    private readonly endpoint: string,
    private readonly accessKey: string,
  ) {}
  async submit(enquiry: Enquiry): Promise<Partial<LeadResult>> {
    if (!this.endpoint || !this.accessKey) {
      return { sinks: [{ name: this.name, ok: false, detail: 'not configured' }] };
    }
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: this.accessKey, subject: `Enquiry ${enquiry.reference}`, ...redactForRelay(enquiry) }),
      });
      return { sinks: [{ name: this.name, ok: res.ok, detail: res.ok ? undefined : `HTTP ${res.status}` }] };
    } catch (e) {
      return { sinks: [{ name: this.name, ok: false, detail: (e as Error).message }] };
    }
  }
}

function redactForRelay(e: Enquiry) {
  // Attachments are transcribed into summaryText; never send raw IDs or images.
  const { attachedDesignIds: _a, attachedEstimateIds: _b, attachedMoodBoardIds: _c, attachedUploadIds: _d, ...rest } = e;
  return rest;
}

export class CompositeLeadSink implements LeadSink {
  readonly name = 'composite';
  constructor(private readonly sinks: LeadSink[]) {}
  async submit(enquiry: Enquiry): Promise<LeadResult> {
    const result: LeadResult = { reference: enquiry.reference, whatsappUrl: '', mailtoUrl: '', sinks: [] };
    for (const sink of this.sinks) {
      try {
        const partial = await sink.submit(enquiry);
        if (partial.whatsappUrl) result.whatsappUrl = partial.whatsappUrl;
        if (partial.mailtoUrl) result.mailtoUrl = partial.mailtoUrl;
        if (partial.sinks) result.sinks.push(...partial.sinks);
      } catch (e) {
        // Never surface optional-sink failures; never log PII.
        result.sinks.push({ name: sink.name, ok: false, detail: (e as Error).name });
      }
    }
    return result;
  }
}

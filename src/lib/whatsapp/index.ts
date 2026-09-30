/**
 * WhatsApp click-to-chat deep links — FR-H-02.
 * The number comes only from site.ts. Messages are URL-encoded with
 * encodeURIComponent; user text is control-stripped and length-capped.
 */
import { site } from '@/config/site';
import { sanitiseForUrl } from '@/lib/utils';

const MAX_MESSAGE_CHARS = 3500; // stays well under practical URL limits on Android/iOS

export function isMobileUserAgent(ua?: string): boolean {
  const s = ua ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(s);
}

/**
 * Builds the wa.me URL. `wa.me` itself redirects to the app on mobile and to
 * web.whatsapp.com on desktop, but we route explicitly so behaviour is testable.
 */
export function buildWhatsAppUrl(message: string, opts?: { number?: string; forceWeb?: boolean; ua?: string }): string {
  const number = (opts?.number ?? site.whatsapp).replace(/\D/g, '');
  const text = encodeURIComponent(message.slice(0, MAX_MESSAGE_CHARS));
  const useWeb = opts?.forceWeb ?? !isMobileUserAgent(opts?.ua);
  return useWeb
    ? `https://web.whatsapp.com/send?phone=${number}&text=${text}`
    : `https://wa.me/${number}?text=${text}`;
}

/** Canonical wa.me form — used in static markup (FAB, footer) where UA is unknown. */
export function buildWaMeUrl(message: string, number = site.whatsapp): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message.slice(0, MAX_MESSAGE_CHARS))}`;
}

export function buildMailtoUrl(subject: string, body: string, to = site.email): string {
  // Strip CR/LF from the subject to prevent header injection; body keeps newlines (encoded).
  const safeSubject = subject.replace(/[\r\n]/g, ' ').slice(0, 200);
  return `mailto:${to}?subject=${encodeURIComponent(safeSubject)}&body=${encodeURIComponent(body.slice(0, 6000))}`;
}

export function buildTelUrl(): string {
  return `tel:${site.phoneE164}`;
}

// ---- Context-aware message builders -----------------------------------------

export const messages = {
  generic: () => `Hi ${site.shortName}, I'd like to talk about interiors for my home in Indore.`,

  project: (p: { title: string; bhk?: string; locality?: string }, mine?: { bhk?: string; locality?: string }) =>
    `Hi, I saw the ${sanitiseForUrl(p.title, 120)} project and I'd like something similar for my ${
      mine?.bhk ?? p.bhk ?? 'home'
    } in ${mine?.locality ?? 'Indore'}.`,

  estimate: (e: { low: string; high: string; bhk: string; sqft: number; tier: string }) =>
    `Hi, I generated an estimate of ${e.low} – ${e.high} for my ${e.bhk} (${e.sqft} sq ft, ${e.tier} finish). Can we discuss?`,

  material: (m: { name: string; unit?: string }) =>
    `Hi, is ${sanitiseForUrl(m.name, 120)} available, and what does it cost per ${m.unit ?? 'sq ft'}?`,

  visualiser: (d: { url: string; spec: string }) =>
    `Hi, here's the design I created: ${d.url}\n\n${d.spec}`,

  designer: (name: string) => `Hi, I'd like to book a consultation with ${sanitiseForUrl(name, 80)}.`,

  service: (name: string) => `Hi, I'm interested in ${sanitiseForUrl(name, 80)}. Could you share how you'd approach it?`,

  locality: (name: string) => `Hi, I'm in ${sanitiseForUrl(name, 80)} and looking for an interior designer. Can we talk?`,

  approvalNotice: (item: string, action: string, ref: string) =>
    `Hi, I've responded to "${sanitiseForUrl(item, 100)}" — ${action}. Project ref: ${ref}. Please take a look.`,
};

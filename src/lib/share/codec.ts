/**
 * URL-fragment share codec — FR-C-08. JSON → deflate (fflate) → Base64URL.
 * The fragment is never sent to any server. Decoding is strict (zod) and caps
 * the decompressed size at 256 KB to defeat zip bombs (SRS §12.3 A04).
 */
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';
import type { ZodType } from 'zod';

import { hasDangerousKeys } from '@/lib/schemas/local';

export const MAX_DECOMPRESSED_BYTES = 256 * 1024;
export const MAX_FRAGMENT_CHARS = 32 * 1024;

export function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  const b64 = typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) return null;
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  try {
    const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export function encodePayload(value: unknown): string {
  const json = JSON.stringify(value);
  const compressed = deflateSync(strToU8(json), { level: 9 });
  return toBase64Url(compressed);
}

export type DecodeError = 'too_long' | 'bad_base64' | 'bad_deflate' | 'too_large' | 'bad_json' | 'dangerous' | 'schema';

export function decodePayload<T>(fragment: string, schema: ZodType<T>): { ok: true; value: T } | { ok: false; error: DecodeError } {
  const s = fragment.startsWith('#') ? fragment.slice(1) : fragment;
  if (s.length === 0 || s.length > MAX_FRAGMENT_CHARS) return { ok: false, error: 'too_long' };
  const bytes = fromBase64Url(s);
  if (!bytes) return { ok: false, error: 'bad_base64' };

  let inflated: Uint8Array;
  try {
    // fflate lets us pre-size the output buffer, which bounds the work done on a hostile payload.
    inflated = inflateSync(bytes, { out: new Uint8Array(MAX_DECOMPRESSED_BYTES + 1) });
  } catch {
    return { ok: false, error: 'bad_deflate' };
  }
  if (inflated.length > MAX_DECOMPRESSED_BYTES) return { ok: false, error: 'too_large' };

  let raw: unknown;
  try {
    raw = JSON.parse(strFromU8(inflated));
  } catch {
    return { ok: false, error: 'bad_json' };
  }
  if (hasDangerousKeys(raw)) return { ok: false, error: 'dangerous' };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'schema' };
  return { ok: true, value: parsed.data };
}

export const DECODE_ERROR_MESSAGES: Record<DecodeError, string> = {
  too_long: 'This link is too long to be a valid shared design.',
  bad_base64: 'This link looks damaged — some characters are missing or altered.',
  bad_deflate: 'This link could not be unpacked. Ask the sender to share it again.',
  too_large: 'This link contains more data than a shared design should. It was not opened for safety.',
  bad_json: 'This link could not be read. Ask the sender to share it again.',
  dangerous: 'This link contains data that is not allowed and was not opened.',
  schema: 'This link was made with an incompatible version. Ask the sender to share it again.',
};

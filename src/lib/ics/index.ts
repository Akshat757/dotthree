/**
 * Client-side .ics generation + Google Calendar template URL — no API, ₹0.
 */
import { site } from '@/config/site';

export interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  location?: string;
  /** Local Asia/Kolkata wall-clock start, e.g. '2026-10-14' + '11:00' */
  date: string;
  time: string;
  durationMinutes: number;
  url?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Formats a local IST date+time into the UTC `YYYYMMDDTHHMMSSZ` form. IST is fixed UTC+5:30 (no DST). */
export function istToUtcStamp(date: string, time: string, addMinutes = 0): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const [hh, mm] = time.split(':').map(Number) as [number, number];
  const utcMs = Date.UTC(y, m - 1, d, hh, mm) - 330 * 60_000 + addMinutes * 60_000;
  const dt = new Date(utcMs);
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(
    dt.getUTCMinutes(),
  )}${pad(dt.getUTCSeconds())}Z`;
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** RFC 5545 line folding at 75 octets. */
function fold(line: string): string {
  const out: string[] = [];
  let cur = '';
  for (const ch of line) {
    if (Buffer_byteLength(cur + ch) > 73) {
      out.push(cur);
      cur = ' ' + ch;
    } else cur += ch;
  }
  out.push(cur);
  return out.join('\r\n');
}

function Buffer_byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

export function buildIcs(ev: CalendarEvent): string {
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(
    now.getUTCMinutes(),
  )}${pad(now.getUTCSeconds())}Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${escapeIcs(site.name)}//atelier//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ev.uid}@${new URL(site.url).hostname}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${istToUtcStamp(ev.date, ev.time)}`,
    `DTEND:${istToUtcStamp(ev.date, ev.time, ev.durationMinutes)}`,
    `SUMMARY:${escapeIcs(ev.title)}`,
    `DESCRIPTION:${escapeIcs(ev.description)}`,
    ev.location ? `LOCATION:${escapeIcs(ev.location)}` : '',
    ev.url ? `URL:${ev.url}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(ev.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function buildGoogleCalendarUrl(ev: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${istToUtcStamp(ev.date, ev.time)}/${istToUtcStamp(ev.date, ev.time, ev.durationMinutes)}`,
    details: ev.description.slice(0, 1500),
    ctz: site.timezone,
  });
  if (ev.location) params.set('location', ev.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

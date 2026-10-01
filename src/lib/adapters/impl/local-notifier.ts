/**
 * LocalNotifier — toast + .ics + Google Calendar link; Web Notifications for reminders. ₹0.
 */
import { site } from '@/config/site';
import type { CalendarLinks, Notifier } from '@/lib/adapters/contracts';
import { buildGoogleCalendarUrl, buildIcs, type CalendarEvent } from '@/lib/ics';
import type { ConsultationType, Enquiry } from '@/types/local';

export const CONSULTATION_TYPES: Record<
  ConsultationType,
  { label: string; minutes: number; where: 'remote' | 'studio' | 'site' }
> = {
  VIDEO: { label: 'Video call', minutes: 45, where: 'remote' },
  PHONE: { label: 'Phone call', minutes: 20, where: 'remote' },
  STUDIO_VISIT: { label: 'Studio visit', minutes: 60, where: 'studio' },
  HOME_VISIT: { label: 'Home visit', minutes: 90, where: 'site' },
  SITE_MEASUREMENT: { label: 'Site measurement', minutes: 120, where: 'site' },
  MATERIAL_SELECTION: { label: 'Material selection', minutes: 120, where: 'studio' },
};

export function enquiryToEvent(e: Enquiry): CalendarEvent | null {
  if (!e.preferredSlot) return null;
  const t = CONSULTATION_TYPES[e.type];
  const location =
    t.where === 'studio'
      ? `${site.name}, ${site.address.line1}, ${site.address.line2}, ${site.address.city} ${site.address.pincode}`
      : t.where === 'site'
        ? [e.locality, e.city, e.pincode].filter(Boolean).join(', ')
        : 'Online / phone';
  return {
    uid: e.reference,
    title: `${t.label} with ${site.name} (${e.reference})`,
    description: `Reference ${e.reference}\n${t.label} — ${t.minutes} minutes.\n\nWhatsApp: ${site.phone}\n\n${e.summaryText.slice(0, 800)}`,
    location,
    date: e.preferredSlot.date,
    time: e.preferredSlot.time,
    durationMinutes: t.minutes,
    url: `${site.url}/dashboard/enquiries/`,
  };
}

export class LocalNotifier implements Notifier {
  async confirm(enquiry: Enquiry): Promise<CalendarLinks | null> {
    const ev = enquiryToEvent(enquiry);
    if (!ev) return null;
    const ics = buildIcs(ev);
    return {
      icsBlob: new Blob([ics], { type: 'text/calendar;charset=utf-8' }),
      icsFilename: `${enquiry.reference}.ics`,
      googleCalendarUrl: buildGoogleCalendarUrl(ev),
    };
  }

  async remind(enquiry: Enquiry): Promise<boolean> {
    if (typeof Notification === 'undefined') return false;
    try {
      const perm =
        Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (perm !== 'granted') return false;
      const t = CONSULTATION_TYPES[enquiry.type];
      new Notification(`${t.label} booked — ${enquiry.reference}`, {
        body: enquiry.preferredSlot
          ? `${enquiry.preferredSlot.date} at ${enquiry.preferredSlot.time}. We'll confirm on WhatsApp.`
          : 'We will confirm the slot on WhatsApp.',
        icon: '/icons/icon-192.png',
      });
      return true;
    } catch {
      return false;
    }
  }
}

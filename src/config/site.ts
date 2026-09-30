/**
 * SINGLE SOURCE OF TRUTH for every firm-specific detail (SRS §11.1).
 *
 * Replacing demo values with the real firm's data must never require editing a
 * component. A CI check (scripts/check-hardcoded-contacts.ts) fails the build if
 * phone numbers, wa.me links, or email addresses appear anywhere else.
 */
export const site = {
  name: 'Aangan Design Studio',
  shortName: 'Aangan',
  tagline: 'Interiors for how Indore actually lives.',
  legalName: 'Aangan Design Studio LLP',
  gstin: '23AAAAA0000A1Z5',
  brandPrefix: 'AG',
  foundedYear: 2014,
  phone: '+91 90000 00000',
  phoneE164: '+919000000000',
  whatsapp: '919000000000',
  email: 'hello@example.com',
  address: {
    line1: '2nd Floor, Studio Block, Scheme 54',
    line2: 'Near Rasoma Square, Vijay Nagar',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    country: 'IN',
    lat: 22.7532,
    lng: 75.8937,
  },
  social: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    youtube: 'https://youtube.com/',
    pinterest: 'https://pinterest.com/',
  },
  stats: {
    projectsCompleted: 240,
    yearsExperience: 12,
    sqftDelivered: 480000,
    onTimePercent: 94,
    avgRating: 4.8,
    reviewCount: 186,
  },
  serviceAreas: ['Indore', 'Bhopal', 'Ujjain', 'Dewas', 'Pithampur', 'Mhow'],
  serviceablePinPrefixes: ['452', '453'], // Indore district; soft-warn outside 45xxxx
  businessHours: {
    weekdays: '10:00–19:00',
    saturday: '10:00–19:00',
    sunday: 'By appointment',
  },
  timezone: 'Asia/Kolkata',
  locale: 'en-IN',
  currency: 'INR',
  /** Drives the demo banner and the /dev/audit checklist. Flip once real content lands. */
  isDemoContent: true,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atelier-demo.pages.dev',
  grievanceOfficer: {
    name: 'Grievance Officer',
    email: 'hello@example.com',
  },
} as const;

export type Site = typeof site;

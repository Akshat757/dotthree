/**
 * Runtime mode selection — SRS §5.1, §16.2.
 *
 * Every value here is optional. With a completely empty `.env` the product runs
 * fully in Demo Mode with every adapter using its free default implementation.
 */
export const runtime = {
  /** 'demo' → typed data files + IndexedDB. 'db' → future Prisma adapters. */
  dataMode: (process.env.NEXT_PUBLIC_DATA_MODE === 'db' ? 'db' : 'demo') as 'demo' | 'db',
  /** 'local' → guest key + optional local profile. 'google' → Auth.js (DB Mode only). */
  authMode: (process.env.NEXT_PUBLIC_AUTH_MODE === 'google' ? 'google' : 'local') as
    | 'local'
    | 'google',
  /** Optional, free, no-card integrations — all absent-safe. */
  integrations: {
    cfAnalyticsToken: process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN ?? '',
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
    leadSheetsWebAppUrl: process.env.NEXT_PUBLIC_LEAD_SHEETS_WEBAPP_URL ?? '',
    leadFormRelayKey: process.env.NEXT_PUBLIC_LEAD_FORM_RELAY_KEY ?? '',
    leadFormRelayEndpoint: process.env.NEXT_PUBLIC_LEAD_FORM_RELAY_ENDPOINT ?? '',
  },
  isDevBuild: process.env.NEXT_PUBLIC_IS_DEV_BUILD === '1',
} as const;

export type Runtime = typeof runtime;

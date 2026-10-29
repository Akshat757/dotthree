/**
 * Where the studio's own renders replace the generated placeholder illustrations.
 *
 * Key   = the demo image id a page asks for (e.g. the hero of the bathroom room guide)
 * Value = an id from `photos.generated.ts`
 *
 * Remove a line to fall back to the placeholder; add a line to use a photo somewhere new.
 * Demo projects (src/data/demo/projects.ts) are deliberately NOT overridden: their budgets,
 * clients and timelines are invented, so they should not carry the studio's real work.
 */
export const CLIENT_IMAGE_OVERRIDES: Record<string, string> = {
  // Homepage hero carousel (also used on /studio and /process)
  'hero-01': 'dot3-villa-front-day',
  'hero-02': 'dot3-pool-sunset',
  'hero-03': 'dot3-master-bedroom-warm',

  // Room guides
  'room-bathroom': 'dot3-powder-room-mirrors',
  'room-master-bedroom': 'dot3-master-bedroom-warm',
  'room-guest-room': 'dot3-twin-bedroom-rose',
  'room-terrace': 'dot3-roof-terrace',
  'room-courtyard-aangan': 'dot3-courtyard-aerial',
  'room-foyer-entrance': 'dot3-stair-atrium',

  // Services
  'svc-full-home-interiors': 'dot3-stair-atrium',
  'svc-bedroom': 'dot3-twin-bedroom-rose',
  'svc-false-ceiling-lighting': 'dot3-master-bedroom-warm',
};

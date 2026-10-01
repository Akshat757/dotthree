import type { VastuRule } from '@/types/content';

export const VASTU_DISCLAIMER =
  'Vastu guidance here is advisory and reflects commonly held traditional beliefs. It is not a substitute for structural, legal or safety advice, and following it is entirely your choice.';

/** SRS Appendix 16.5 — advisory only, always shown with VASTU_DISCLAIMER (FR-G-04). */
export const vastuRules: VastuRule[] = [
  {
    id: 'kitchen',
    topic: 'Kitchen',
    preferred: ['South-East'],
    acceptable: ['North-West'],
    avoid: ['North-East', 'Directly under a bedroom'],
    note: 'The South-East is traditionally associated with the fire element. Position the hob so the cook faces East where the layout allows.',
    colours: { 'South-East': 'Warm reds, oranges and terracotta accents' },
  },
  {
    id: 'pooja',
    topic: 'Pooja room',
    preferred: ['North-East'],
    acceptable: ['East', 'North'],
    avoid: ['Under a staircase', 'Against a toilet wall', 'In a bedroom'],
    note: 'Keep the pooja space uncluttered with light colours and gentle indirect lighting. Idols traditionally face West so the worshipper faces East.',
    colours: { 'North-East': 'White, cream, light blue' },
  },
  {
    id: 'master-bedroom',
    topic: 'Master bedroom',
    preferred: ['South-West'],
    acceptable: ['South', 'West'],
    avoid: ['North-East'],
    note: 'The South-West is considered stable and grounding — earthy browns and warm neutrals reinforce that feeling.',
    colours: { 'South-West': 'Earthy browns, terracotta, warm beige' },
  },
  {
    id: 'bed',
    topic: 'Bed orientation',
    preferred: ['Head to South', 'Head to East'],
    avoid: ['Head to North', 'Directly under a beam'],
    note: 'Sleeping with the head towards South or East is the traditional preference. A solid wall behind the headboard is preferred over a window.',
  },
  {
    id: 'study',
    topic: 'Study desk',
    preferred: ['Face North', 'Face East'],
    acceptable: ['Face North-East'],
    avoid: ['Back to the door'],
    note: 'Facing North or East is associated with concentration. Place bookshelves on the South or West wall so they never overhang the desk.',
  },
  {
    id: 'entrance',
    topic: 'Main entrance',
    preferred: ['North', 'East', 'North-East'],
    acceptable: ['North-West', 'West'],
    avoid: ['South-West'],
    note: 'The main door should be the largest and best-lit door in the home, opening inward and clockwise where possible.',
  },
  {
    id: 'mirrors',
    topic: 'Mirrors',
    preferred: ['North wall', 'East wall'],
    avoid: ['Facing the bed', 'Opposite the main door'],
    note: 'Wardrobe mirrors are best placed on the inside of a shutter, or on a North or East wall away from the bed.',
  },
  {
    id: 'storage',
    topic: 'Heavy storage',
    preferred: ['South wall', 'West wall'],
    acceptable: ['South-West corner'],
    avoid: ['North-East corner'],
    note: 'Wardrobes, lofts and tall units sit best against the South and West, keeping the North-East light and open.',
  },
  {
    id: 'colours',
    topic: 'Directional colours',
    preferred: [
      'Light and airy in the North-East',
      'Warm accents in the South-East',
      'Earthy tones in the South-West',
      'Greens in the North',
    ],
    note: "Use these as a starting point for accent walls. The visualiser's Vastu filter highlights shades that suit the wall you have selected.",
    colours: {
      'North-East': 'White, light blue',
      'South-East': 'Red, orange accents',
      'South-West': 'Earthy browns',
      North: 'Green',
    },
  },
];

/** Maps a compass direction to the recommended shade families, for the FR-G-04 colour filter. */
export const VASTU_DIRECTION_FAMILIES: Record<string, string[]> = {
  N: ['green', 'sage'],
  NE: ['white', 'blue', 'off-white'],
  E: ['white', 'off-white', 'yellow'],
  SE: ['red', 'orange', 'terracotta'],
  S: ['red', 'pink', 'terracotta'],
  SW: ['brown', 'beige', 'terracotta'],
  W: ['blue', 'grey', 'white'],
  NW: ['white', 'grey', 'cream'],
};

/** Global navigation model — FR-A-03, FR-A-04 */

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem extends NavLink {
  /** When present, the item opens a mega-menu panel. */
  mega?: {
    columns: { heading: string; links: NavLink[] }[];
    /** Slugs of featured projects/services shown as thumbnails. */
    featured?: { kind: 'project' | 'service'; slugs: string[] };
  };
}

export const primaryNav: NavItem[] = [
  {
    label: 'Projects',
    href: '/projects',
    mega: {
      columns: [
        {
          heading: 'By property',
          links: [
            { label: 'Apartments', href: '/projects?propertyType=APARTMENT' },
            { label: 'Villas & bungalows', href: '/projects?propertyType=VILLA' },
            { label: 'Duplexes', href: '/projects?propertyType=DUPLEX' },
            { label: 'Farmhouses', href: '/projects?propertyType=FARMHOUSE' },
            { label: 'Offices & clinics', href: '/projects?segment=COMMERCIAL' },
          ],
        },
        {
          heading: 'By size',
          links: [
            { label: '1 & 2 BHK', href: '/projects?bhk=1BHK,2BHK' },
            { label: '3 BHK', href: '/projects?bhk=3BHK' },
            { label: '4 BHK and larger', href: '/projects?bhk=4BHK%2B' },
            { label: 'Renovations', href: '/projects?nature=RENOVATION' },
            { label: 'Vastu-aligned', href: '/projects?special=vastu' },
          ],
        },
        {
          heading: 'Explore',
          links: [
            { label: 'All projects', href: '/projects' },
            { label: 'Styles', href: '/styles' },
            { label: 'Room guides', href: '/rooms' },
            { label: 'Testimonials', href: '/testimonials' },
          ],
        },
      ],
      featured: { kind: 'project', slugs: [] },
    },
  },
  {
    label: 'Services',
    href: '/services',
    mega: {
      columns: [
        {
          heading: 'Homes',
          links: [
            { label: 'Full home interiors', href: '/services/full-home-interiors' },
            { label: 'Modular kitchen', href: '/services/modular-kitchen' },
            { label: 'Wardrobes & storage', href: '/services/wardrobes-storage' },
            { label: 'Living room', href: '/services/living-room' },
            { label: 'Bedroom', href: '/services/bedroom' },
            { label: 'Pooja room', href: '/services/pooja-room' },
          ],
        },
        {
          heading: 'Execution',
          links: [
            { label: 'False ceiling & lighting', href: '/services/false-ceiling-lighting' },
            { label: 'Home renovation', href: '/services/home-renovation' },
            { label: 'Turnkey execution', href: '/services/turnkey-execution' },
            { label: 'Design consultation only', href: '/services/design-consultation' },
          ],
        },
        {
          heading: 'Commercial',
          links: [
            { label: 'Office interiors', href: '/services/office-interiors' },
            { label: 'Retail & restaurant', href: '/services/retail-restaurant' },
            { label: 'How we work', href: '/process' },
          ],
        },
      ],
      featured: { kind: 'service', slugs: ['full-home-interiors', 'modular-kitchen'] },
    },
  },
  { label: 'Visualiser', href: '/visualiser' },
  { label: 'Materials', href: '/materials' },
  { label: 'Estimate', href: '/estimate' },
  { label: 'Studio', href: '/studio' },
  { label: 'Journal', href: '/journal' },
];

export const footerColumns: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Studio',
    links: [
      { label: 'About & designers', href: '/studio' },
      { label: 'How we work', href: '/process' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'Careers', href: '/studio/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Design tools',
    links: [
      { label: 'Room visualiser', href: '/visualiser' },
      { label: 'Cost estimator', href: '/estimate' },
      { label: 'Style quiz', href: '/quiz' },
      { label: 'Mood boards', href: '/moodboards' },
      { label: 'My dashboard', href: '/dashboard' },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { label: 'Projects', href: '/projects' },
      { label: 'Services', href: '/services' },
      { label: 'Materials', href: '/materials' },
      { label: 'Styles', href: '/styles' },
      { label: 'Room guides', href: '/rooms' },
      { label: 'Journal', href: '/journal' },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Terms', href: '/legal/terms' },
  { label: 'Image credits', href: '/legal/image-credits' },
];

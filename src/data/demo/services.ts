import type { Service } from '@/types/content';

import { img } from './images';

export const STANDARD_PROCESS: Service['process'] = [
  {
    step: 'Consultation',
    detail:
      'A 45-minute video or studio call to understand how you live, what you own, and what you want to feel when you walk in.',
  },
  {
    step: 'Site measurement',
    detail:
      'We measure every wall, beam, window and electrical point and photograph the site before anything is drawn.',
  },
  {
    step: 'Concept & visualiser',
    detail:
      'Layouts, a material palette and 3–4 visualiser scenes you can play with yourself. Two rounds of revisions included.',
  },
  {
    step: 'Detailed quotation',
    detail:
      'A line-item quote from our price book, GST separate, with clear exclusions. Nothing hidden in "misc."',
  },
  {
    step: 'Execution',
    detail:
      'A fixed schedule, a dedicated site lead, and a photo update in your dashboard every working day.',
  },
  {
    step: 'Handover',
    detail:
      'A snag walk-through, a warranty file, and a care guide for every surface we installed.',
  },
];

const svc = (
  s: Omit<Service, 'heroImage' | 'process'> & { process?: Service['process'] },
): Service => ({
  ...s,
  heroImage: img(`svc-${s.slug}`),
  process: s.process ?? STANDARD_PROCESS,
});

export const services: Service[] = [
  svc({
    slug: 'full-home-interiors',
    name: 'Full Home Interiors',
    shortName: 'Full home',
    tagline: 'One team, one quote, one handover date — for everything inside your front door.',
    description:
      'From a bare-shell possession flat to a move-in-ready home: layouts, modular kitchen, wardrobes, false ceiling, lighting, painting, loose furniture and décor, executed by our own teams against a fixed schedule. Most Indore 3BHKs complete in 11–15 weeks.',
    icon: 'home',
    inclusions: [
      'Space planning and 2D layouts',
      'Modular kitchen and all wardrobes',
      'False ceiling and lighting design',
      'TV, crockery, pooja and study units',
      'Painting, wallpaper and wall textures',
      'Electrical and plumbing coordination',
      'Loose furniture and soft furnishing curation',
      'Site supervision and daily photo updates',
    ],
    costBand: {
      min: 900,
      max: 3800,
      unit: '₹/sq ft carpet',
      note: 'Essential to Luxury tier. A 1,200 sq ft 3BHK typically lands between ₹11 L and ₹45 L.',
    },
    timelineWeeks: [8, 24],
    projectSlugs: [
      'mahalaxmi-nagar-family-3bhk',
      'nipania-compact-2bhk',
      'scheme-78-duplex-penthouse',
      'super-corridor-4bhk-contemporary',
    ],
    materialSlugs: [
      'laminate-frosty-white',
      'veneer-natural-teak',
      'paint-ivory-mist',
      'vitrified-carrara-look',
      'light-cove-profile-warm',
    ],
    faqs: [
      {
        q: 'Do you work on bare-shell possession flats?',
        a: 'Yes — most of our Nipania and Super Corridor projects start from a bare shell. We include electrical point planning and civil coordination in the quote.',
      },
      {
        q: 'Can we live in the flat during the work?',
        a: 'For renovations, yes; we phase the work room by room. For new possessions it is faster and cleaner to hand us the empty flat.',
      },
      {
        q: 'What is not included?',
        a: 'Appliances, structural changes, society permissions, waterproofing and loose décor unless quoted. The full exclusions list appears on every estimate.',
      },
    ],
  }),
  svc({
    slug: 'modular-kitchen',
    name: 'Modular Kitchen',
    shortName: 'Kitchen',
    tagline: 'Designed around how you actually cook — tadka, pressure cooker and all.',
    description:
      'L-shaped, U-shaped, parallel, straight or island kitchens in laminate, acrylic or PU, with tall units, pull-outs and soft-close hardware as standard from the Standard tier up. Every kitchen is drawn to your cylinder position, chimney duct and water line before a single board is cut.',
    icon: 'cooking-pot',
    inclusions: [
      'Layout with work-triangle and appliance planning',
      'Base, wall and tall units in your chosen finish',
      'Granite, quartz or sintered countertop',
      'Backsplash tile or glass',
      'Soft-close hinges and drawer systems',
      'Chimney, hob and sink installation coordination',
      'Under-cabinet and cove lighting',
      'Five-year hardware warranty',
    ],
    costBand: {
      min: 1800,
      max: 7000,
      unit: '₹/running ft',
      note: 'A typical 10-ft L-shaped kitchen with 8 ft of uppers runs ₹2.2 L to ₹8 L.',
    },
    timelineWeeks: [3, 6],
    projectSlugs: [
      'nipania-compact-2bhk',
      'rau-first-home-2bhk',
      'rajendra-nagar-renovation-3bhk',
      'super-corridor-4bhk-contemporary',
    ],
    materialSlugs: [
      'laminate-sage-matte',
      'acrylic-pearl-white',
      'pu-matte-white',
      'granite-black-galaxy',
      'quartz-calacatta-look',
      'hw-tandem-drawer',
      'handle-gola-profile-black',
    ],
    faqs: [
      {
        q: 'Laminate, acrylic or PU — which should I choose?',
        a: 'Laminate for value and durability, acrylic for a high-gloss look at mid budget, PU for seamless edges and the finest finish. Our visualiser lets you compare all three on the same kitchen.',
      },
      {
        q: 'Do you handle the gas pipeline?',
        a: 'We coordinate with the gas agency for the line position and leave the approved clearance; the agency does the connection.',
      },
      {
        q: 'How long will my kitchen be unusable?',
        a: 'For a replacement kitchen, 3–5 days between demolition and the new kitchen being usable. We set up a temporary induction station.',
      },
    ],
  }),
  svc({
    slug: 'wardrobes-storage',
    name: 'Wardrobes & Storage',
    shortName: 'Wardrobes',
    tagline:
      'A place for the wedding saris, the winter quilts and the suitcases you use twice a year.',
    description:
      'Openable, sliding and walk-in wardrobes, lofts, dressers, shoe cabinets, crockery units and storage spines — planned from an inventory of what you actually own. Indian homes need more hanging depth, more shelf height for folded saris and a lockable drawer; we build for that.',
    icon: 'archive',
    inclusions: [
      'Storage inventory and planning session',
      'Openable or sliding wardrobes with internal fittings',
      'Lofts and overhead storage',
      'Dressers, shoe cabinets and study storage',
      'Mirrors, LED sensor strips and locker drawers',
      'Soft-close hardware from Standard tier',
    ],
    costBand: {
      min: 1400,
      max: 6400,
      unit: '₹/running ft',
      note: 'A 7-ft, 8-ft-tall openable wardrobe typically costs ₹1 L to ₹3.6 L.',
    },
    timelineWeeks: [2, 5],
    projectSlugs: ['mahalaxmi-nagar-family-3bhk', 'tilak-nagar-kids-rooms', 'khajrana-boho-2bhk'],
    materialSlugs: [
      'laminate-walnut-classic',
      'laminate-oak-linear',
      'veneer-white-ash',
      'hw-sliding-channel',
      'hw-pull-down-hanger',
      'handle-leather-loop',
    ],
    faqs: [
      {
        q: 'Sliding or openable?',
        a: 'Sliding saves floor space in compact bedrooms; openable gives full access and costs less. Under 10 ft of clearance in front of the wardrobe, we usually recommend sliding.',
      },
      {
        q: 'Do you do walk-in wardrobes?',
        a: 'Yes, from about 6 × 8 ft upwards. Many of our Scheme 78 and Bypass villa projects include one.',
      },
      {
        q: 'What goes inside the wardrobe?',
        a: 'We plan internals from an inventory of what you own: hanging depth for saris and sherwanis, deep drawers for folded clothes, a lockable drawer, and loft space for quilts and suitcases.',
      },
    ],
  }),
  svc({
    slug: 'living-room',
    name: 'Living Room Design',
    shortName: 'Living room',
    tagline: 'The room where guests form their opinion and the family forms its habits.',
    description:
      'TV units, feature walls, seating layouts, ceilings, lighting and soft furnishings for the room everyone sees first. We plan for how Indore families actually use it — festivals with forty guests, and Tuesday evenings with two.',
    icon: 'sofa',
    inclusions: [
      'Seating and circulation layout',
      'TV or media wall with concealed wiring',
      'Feature wall in paint, texture, veneer or panelling',
      'False ceiling and layered lighting',
      'Curtain and blind design',
      'Rug, sofa and accent furniture curation',
    ],
    costBand: {
      min: 180000,
      max: 1200000,
      unit: '₹ per room',
      note: 'Depends on ceiling, panelling and furniture scope.',
    },
    timelineWeeks: [3, 6],
    projectSlugs: [
      'scheme-54-heritage-bungalow',
      'palasia-art-deco-apartment',
      'bengali-square-coastal-3bhk',
      'sudama-nagar-colour-refresh',
    ],
    materialSlugs: [
      'veneer-fluted-oak-panel',
      'paint-malwa-clay',
      'fabric-linen-oat',
      'light-cove-profile-warm',
      'curtain-linen-sand',
    ],
    faqs: [
      {
        q: 'Can you design just the TV wall?',
        a: 'Yes. A TV wall with concealed wiring, panelling and lighting is one of our most common single-room commissions.',
      },
      {
        q: 'Do you supply sofas and loose furniture?',
        a: 'We curate and quote loose furniture from local and national makers; you can buy through us or take the specification and source yourself.',
      },
      {
        q: 'How do you plan seating for festivals and daily use?',
        a: 'A fixed core — sofa, rug, TV wall — plus movable pieces: ottomans, nested tables and floor cushions that come out for Diwali and go back on Monday.',
      },
    ],
  }),
  svc({
    slug: 'bedroom',
    name: 'Bedroom Design',
    shortName: 'Bedroom',
    tagline: 'Dark enough at 5:30 am, calm enough at 11 pm.',
    description:
      "Master, kids', parents' and guest bedrooms: bed and headboard walls, wardrobes, dressers, study corners, blackout and lighting layers. Kids' rooms are designed to grow; parents' rooms are designed around reach and safety.",
    icon: 'bed-double',
    inclusions: [
      'Bed, headboard and side-table design',
      'Wardrobes and dresser',
      'Study or reading corner',
      'Blackout and sheer layering',
      'Bedside and cove lighting with two-way switching',
      'Flooring upgrade options',
    ],
    costBand: {
      min: 150000,
      max: 900000,
      unit: '₹ per room',
      note: 'A standard 12 × 14 ft master bedroom lands between ₹2.5 L and ₹6 L.',
    },
    timelineWeeks: [3, 6],
    projectSlugs: [
      'vijay-nagar-japandi-3bhk',
      'khajrana-boho-2bhk',
      'tilak-nagar-kids-rooms',
      'mahalaxmi-nagar-family-3bhk',
    ],
    materialSlugs: [
      'paint-sage-whisper',
      'wallpaper-indigo-block-print',
      'wood-engineered-oak',
      'curtain-blackout-charcoal',
      'light-wall-sconce-plaster',
    ],
    faqs: [
      {
        q: "Do you design kids' rooms that can grow?",
        a: 'Always. Modular bed platforms, adjustable desks and a single swappable wallpaper wall mean the room works from 6 to 16.',
      },
      {
        q: 'Can you make a west-facing bedroom cooler and darker?',
        a: 'Blackout layering, a lighter wall palette, insulated curtain pelmets and a ceiling fan positioned over the bed make a measurable difference in Indore summers.',
      },
      {
        q: "What do you change for parents' rooms?",
        a: 'Lower wardrobe hanging, a bedside with reach-from-bed switching, non-slip flooring, night-path lighting and grab-bar provisions in the attached bathroom.',
      },
    ],
  }),
  svc({
    slug: 'pooja-room',
    name: 'Pooja Room & Units',
    shortName: 'Pooja',
    tagline: 'The smallest room in the house, and often the most important.',
    description:
      'Full pooja rooms, wall niches and compact units with proper ventilation for diyas and incense, marble or stone platforms, jaali screens, bell fixtures and warm lighting. Vastu-aligned placement offered on request — always advisory, never dogmatic.',
    icon: 'flame',
    inclusions: [
      'Placement guidance (Vastu advisory optional)',
      'Marble or stone platform',
      'Teak, fluted or jaali shutters and screens',
      'Concealed drawer storage for pooja items',
      'Warm cove and spot lighting',
      'Ventilation planning for diyas and incense',
    ],
    costBand: {
      min: 18000,
      max: 350000,
      unit: '₹ per unit / room',
      note: 'A niche unit from ₹18k; a full marble pooja room from ₹1.5 L.',
    },
    timelineWeeks: [1, 3],
    projectSlugs: [
      'ujjain-courtyard-home',
      'annapurna-traditional-home',
      'scheme-54-heritage-bungalow',
      'bicholi-mardana-joint-family-villa',
    ],
    materialSlugs: [
      'marble-pink-ambaji',
      'marble-makrana-white',
      'veneer-natural-teak',
      'metal-antique-copper',
      'paint-turmeric-light',
    ],
    faqs: [
      {
        q: 'Which direction should the pooja room face?',
        a: 'Traditionally the North-East is preferred. We show this as advisory and design around your plan, not the other way round.',
      },
      {
        q: 'How do you handle smoke from diyas and incense?',
        a: 'A small concealed exhaust or a louvred top panel, and a ceiling finish that wipes clean. We never seal a pooja unit fully.',
      },
      {
        q: 'Can a pooja unit fit in a 2BHK with no spare room?',
        a: 'Yes — a 2 × 2 ft wall niche or a tall unit in the dining area with shutters is our most common compact solution, from about ₹18k.',
      },
    ],
  }),
  svc({
    slug: 'false-ceiling-lighting',
    name: 'False Ceiling & Lighting',
    shortName: 'Ceiling & lights',
    tagline: 'Light the walls, not the eyes.',
    description:
      'Gypsum and POP ceilings, coves, profiles, recessed spots, magnetic tracks, pendants and smart dimming — designed as three layers (ambient, task, accent) so a room can go from dinner party to Netflix with one switch.',
    icon: 'lightbulb',
    inclusions: [
      'Ceiling design coordinated with AC and fan positions',
      'Gypsum or POP false ceiling',
      'Cove, profile and recessed lighting',
      'Pendant and sconce selection',
      'Switching and dimming plan',
      'Smart lighting integration (optional)',
    ],
    costBand: {
      min: 85,
      max: 240,
      unit: '₹/sq ft ceiling',
      note: 'Fixtures priced separately by our price book.',
    },
    timelineWeeks: [2, 4],
    projectSlugs: [
      'palasia-art-deco-apartment',
      'scheme-78-duplex-penthouse',
      'super-corridor-tech-office',
    ],
    materialSlugs: [
      'light-cove-profile-warm',
      'light-recessed-spot-black',
      'light-linear-magnetic-track',
      'light-brass-pendant',
      'light-wall-sconce-plaster',
    ],
    faqs: [
      {
        q: 'Do I need a false ceiling at all?',
        a: 'Not always. With 9-ft ceilings we often recommend a perimeter pelmet with cove lighting instead of a full drop. It costs a third as much and keeps the height.',
      },
      {
        q: 'Gypsum or POP?',
        a: 'Gypsum board for speed, flat finish and consistency; POP where you want curves or a very local, hand-finished look. Both are quoted per sq ft in our price book.',
      },
      {
        q: 'Will the ceiling work with my AC and fans?',
        a: 'We fix fan and AC positions first and design the ceiling around them, including access panels for the AC indoor unit drain.',
      },
    ],
  }),
  svc({
    slug: 'home-renovation',
    name: 'Home Renovation',
    shortName: 'Renovation',
    tagline: 'For the home you already love, redone so you love it again.',
    description:
      'Room-by-room or whole-home renovations, phased so you can keep living there. We handle demolition, civil patching, re-wiring, re-plumbing and everything cosmetic, and we know which old Indore floors are worth saving.',
    icon: 'hammer',
    inclusions: [
      'Condition survey and phasing plan',
      'Demolition and debris removal',
      'Civil patching and wall levelling',
      'Electrical and plumbing renewal',
      'All interior finishes and furniture',
      'Deep clean and handover',
    ],
    costBand: {
      min: 1100,
      max: 4500,
      unit: '₹/sq ft carpet',
      note: 'Roughly 20% above an equivalent new-possession project, for demolition and repair.',
    },
    timelineWeeks: [6, 22],
    projectSlugs: [
      'scheme-54-heritage-bungalow',
      'rajendra-nagar-renovation-3bhk',
      'vijay-nagar-japandi-3bhk',
      'annapurna-traditional-home',
    ],
    materialSlugs: [
      'texture-lime-plaster',
      'wallpaper-linen-weave',
      'vinyl-spc-oak-natural',
      'wood-engineered-oak',
    ],
    faqs: [
      {
        q: 'Can we stay in the house during renovation?',
        a: 'Usually, yes. We phase by room and keep one bathroom and a temporary kitchen working at all times.',
      },
      {
        q: 'Can you lay new flooring over old tiles?',
        a: 'Often. Engineered wood and SPC can go directly over sound tile, saving demolition cost and a week of dust.',
      },
      {
        q: 'Do you need society permission for renovation?',
        a: 'Most Indore societies require an NOC for civil work and set working hours. We prepare the application; you sign it.',
      },
    ],
  }),
  svc({
    slug: 'turnkey-execution',
    name: 'Turnkey Execution',
    shortName: 'Turnkey',
    tagline: 'You have the drawings. We make them real, on time.',
    description:
      'Execution-only service for clients who already have a design — from another architect, or from our design-consultation package. Fixed price against your drawings, our teams, our warranty.',
    icon: 'clipboard-check',
    inclusions: [
      'Drawing review and buildability check',
      'Line-item quotation from our price book',
      'Own carpentry, civil, electrical and finishing teams',
      'Dedicated site lead and daily photo updates',
      'Quality checks at three stages',
      'One-year workmanship warranty',
    ],
    costBand: {
      min: 8,
      max: 12,
      unit: '% execution / PM fee',
      note: 'On top of material and labour at price-book rates.',
    },
    timelineWeeks: [6, 20],
    projectSlugs: ['pithampur-executive-guest-house', 'super-corridor-tech-office'],
    materialSlugs: [],
    faqs: [
      {
        q: "Will you build another designer's drawings?",
        a: 'Yes, after a buildability review. If we find a problem in the drawings we tell you before we quote.',
      },
      {
        q: 'What is the execution fee charged on?',
        a: 'On the material and labour value at our published price-book rates. The fee covers site management, quality checks and the workmanship warranty.',
      },
      {
        q: 'Can I supply some materials myself?',
        a: 'Yes, for tiles, sanitaryware and appliances. Client-supplied items are excluded from our warranty but we still install them.',
      },
    ],
  }),
  svc({
    slug: 'design-consultation',
    name: 'Design Consultation Only',
    shortName: 'Consultation',
    tagline: 'Our thinking, your contractor.',
    description:
      'A fixed-fee design package — layouts, material palette, visualiser scenes, lighting plan and a specification document — that you can hand to any contractor. Includes one site visit during execution to check the work.',
    icon: 'pencil-ruler',
    inclusions: [
      'Two-hour consultation and site measurement',
      '2D layouts and furniture plan',
      'Material and colour palette with samples',
      'Visualiser scenes for each main room',
      'Lighting and electrical point plan',
      'Specification document for your contractor',
      'One site check during execution',
    ],
    costBand: {
      min: 25000,
      max: 150000,
      unit: '₹ fixed fee',
      note: 'By home size — from ₹25k for a 2BHK to ₹1.5 L for a large villa.',
    },
    timelineWeeks: [2, 4],
    projectSlugs: ['sudama-nagar-colour-refresh'],
    materialSlugs: [],
    process: [
      { step: 'Consultation', detail: 'A two-hour session at your home or our studio.' },
      {
        step: 'Design',
        detail: 'Layouts, palette and visualiser scenes in two weeks, with one revision round.',
      },
      { step: 'Handover pack', detail: 'A specification document your contractor can build from.' },
      { step: 'Site check', detail: 'One visit during execution to catch problems early.' },
    ],
    faqs: [
      {
        q: 'Can I upgrade to full execution later?',
        a: 'Yes. The consultation fee is credited against the design fee if you engage us for execution within six months.',
      },
      {
        q: 'Do you work with clients outside Indore?',
        a: 'Yes — consultation-only packages work well for Ujjain, Dewas, Pithampur and Mhow, with one site visit included.',
      },
      {
        q: 'What will my contractor receive?',
        a: 'Dimensioned layouts, a material and colour specification with product codes, an electrical point plan and the visualiser scenes as reference images.',
      },
    ],
  }),
  svc({
    slug: 'office-interiors',
    name: 'Office Interiors',
    shortName: 'Office',
    tagline: 'Workplaces people actually want to come back to.',
    description:
      'Offices from 800 to 10,000 sq ft: reception, open-plan, focus rooms, boardrooms, pantries and washrooms. Acoustic planning, fire-NOC-compliant materials, and a fit-out cost per seat that is fixed before we start.',
    icon: 'building-2',
    inclusions: [
      'Space planning to headcount and growth',
      'Workstations, storage and meeting rooms',
      'Acoustic treatment',
      'Lighting and power distribution',
      'Pantry and washrooms',
      'Branding and wayfinding coordination',
      'Fire-compliant materials and documentation',
    ],
    costBand: {
      min: 1400,
      max: 3200,
      unit: '₹/sq ft',
      note: 'Excludes IT, HVAC plant and loose seating unless quoted.',
    },
    timelineWeeks: [6, 14],
    projectSlugs: ['super-corridor-tech-office', 'pithampur-executive-guest-house'],
    materialSlugs: [
      'vinyl-spc-grey-stone',
      'light-linear-magnetic-track',
      'laminate-charcoal-woodgrain',
      'fabric-performance-grey',
      'metal-matte-black',
    ],
    faqs: [
      {
        q: "Do you work with our landlord's fit-out rules?",
        a: 'Yes — we review the fit-out manual before design and handle the approvals paperwork.',
      },
      {
        q: 'What does an office cost per seat?',
        a: 'Roughly ₹85k to ₹1.8 L per seat all-in for a 50-seat office, depending on meeting-room count and finish tier.',
      },
      {
        q: 'Can you work nights and weekends to avoid disruption?',
        a: 'For occupied offices, yes. Noisy work is scheduled after hours and the site is cleaned before staff arrive.',
      },
    ],
  }),
  svc({
    slug: 'retail-restaurant',
    name: 'Retail, Clinics & Restaurants',
    shortName: 'Retail & F&B',
    tagline: 'Judged in three seconds, lived in for three years.',
    description:
      'Cafés, restaurants, boutiques, clinics and showrooms. Strong, photographable entrances; back-of-house that works for staff; surfaces that survive heavy use and daily cleaning; and a timeline that respects your opening date.',
    icon: 'store',
    inclusions: [
      'Concept and brand alignment',
      'Customer-flow and seating layout',
      'Display, counter and service design',
      'Kitchen or clinical back-of-house coordination',
      'Lighting for product and mood',
      'Signage and façade coordination',
      'Fire and hygiene compliance',
    ],
    costBand: {
      min: 1600,
      max: 4500,
      unit: '₹/sq ft',
      note: 'Excludes kitchen equipment, medical equipment and signage fabrication.',
    },
    timelineWeeks: [5, 12],
    projectSlugs: [
      'palasia-specialty-cafe',
      'bypass-road-restaurant',
      'ab-road-dental-clinic',
      'saket-nagar-paediatric-clinic',
    ],
    materialSlugs: [
      'texture-concrete-effect',
      'ceramic-moroccan-fish-scale',
      'vinyl-roll-clinic-blue',
      'ceramic-athangudi-pattern',
      'metal-stainless-satin',
    ],
    faqs: [
      {
        q: 'Can you open before Diwali?',
        a: 'If we start by early August, yes. Festival-season openings are the busiest time of our year — book early.',
      },
      {
        q: 'Do you coordinate the commercial kitchen?',
        a: 'We design the back-of-house layout, ventilation route and utilities with your kitchen consultant or equipment supplier, who supplies the equipment.',
      },
      {
        q: 'What surfaces survive a clinic or café?',
        a: 'Roll vinyl with welded seams for clinics, through-body porcelain and sealed concrete-effect plaster for cafés, and stainless or compact laminate on service counters.',
      },
    ],
  }),
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

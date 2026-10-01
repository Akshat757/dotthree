import type { Locality } from '@/types/content';

/** 20 Indore localities + 4 nearby cities — SRS §1.6, FR-K-05. Distances from the Vijay Nagar studio. */
export const localities: Locality[] = [
  {
    slug: 'vijay-nagar',
    name: 'Vijay Nagar',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7533,
    lng: 75.8937,
    distanceKm: 0.8,
    pincodes: ['452010'],
    propertyTypes: ['3BHK and 4BHK apartments', 'Builder floors', 'Bungalows in Scheme 74'],
    description:
      "Indore's most established premium residential-commercial belt. High-rise 3BHK towers along the ring road, older independent houses in the schemes behind, and a constant supply of renovations as first owners upgrade.",
    considerations: [
      'Many towers restrict work hours to 10:00–18:00 on weekdays; we plan noisy civil work in the first fortnight.',
      'Society lifts often cap plywood sheet size — 8×4 ft sheets must be cut on site or carried by stairs.',
      'Older Scheme 74 bungalows frequently need electrical re-wiring before any false ceiling work.',
    ],
    multiplier: 1.05,
  },
  {
    slug: 'nipania',
    name: 'Nipania',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7625,
    lng: 75.9214,
    distanceKm: 3.4,
    pincodes: ['452010', '452016'],
    propertyTypes: ['New 2BHK and 3BHK towers', 'Gated villa plots', 'Duplex rows'],
    description:
      'The fastest-growing possession belt in Indore. Most of our Nipania clients take possession of a bare-shell flat and want it move-in ready within 10–12 weeks.',
    considerations: [
      'Bare-shell handovers mean electrical points are often minimal — budget for 20–30 additional points.',
      'Water pressure in upper floors of newer towers varies; kitchen and bathroom fittings are specified accordingly.',
      'Several societies require a refundable interior deposit of ₹25,000–50,000 — we help with the paperwork.',
    ],
    multiplier: 1.05,
  },
  {
    slug: 'super-corridor',
    name: 'Super Corridor',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7419,
    lng: 75.8226,
    distanceKm: 8.2,
    pincodes: ['452005', '453112'],
    propertyTypes: ['Large 3BHK and 4BHK apartments', 'IT-park-adjacent studios', 'Penthouses'],
    description:
      'Wide plots and tall towers along the airport road. Flats here are larger than the Indore average — 1,600–2,400 sq ft — and clients tend to want a contemporary, uncluttered finish.',
    considerations: [
      'Large floor plates make false-ceiling and lighting layout the biggest single decision.',
      'West-facing living rooms get harsh afternoon sun; we recommend layered curtains and cooler wall tones.',
      'Under-construction neighbourhood — dust protection for finished surfaces matters during handover.',
    ],
    multiplier: 1.05,
  },
  {
    slug: 'bicholi-mardana',
    name: 'Bicholi Mardana',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7092,
    lng: 75.9186,
    distanceKm: 6.1,
    pincodes: ['452016'],
    propertyTypes: ['Independent bungalows', 'Row houses', 'Farmhouse-style plots'],
    description:
      'Semi-suburban, spacious, and popular with joint families who want a ground-plus-one home. Compound walls, terraces, and a pooja room are near-universal requests.',
    considerations: [
      'Ground-floor damp is common in older plots — we check walls before recommending wallpaper or veneer.',
      'Terraces and balconies need UV-stable outdoor-grade materials.',
      'Joint-family homes benefit from acoustic separation between floors — we specify solid-core doors.',
    ],
    multiplier: 1.0,
  },
  {
    slug: 'rau',
    name: 'Rau',
    city: 'Indore',
    kind: 'locality',
    lat: 22.6376,
    lng: 75.8133,
    distanceKm: 16.5,
    pincodes: ['453331'],
    propertyTypes: ['Affordable 2BHK apartments', 'Duplex townships', 'Institutional housing'],
    description:
      'Value-focused township living near the Rau–Pithampur road. Most projects here are Essential or Standard tier, and we work hard to make them feel anything but basic.',
    considerations: [
      'Compact 2BHK plans (850–1,050 sq ft) make storage the first design conversation.',
      'Longer travel means we batch site visits — clients get a fixed weekly visit day.',
      'Township water can be hard; we recommend anti-scale fittings in kitchens.',
    ],
    multiplier: 0.95,
  },
  {
    slug: 'bengali-square',
    name: 'Bengali Square',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7156,
    lng: 75.9075,
    distanceKm: 5.0,
    pincodes: ['452016', '452018'],
    propertyTypes: [
      'Mid-rise 2BHK and 3BHK apartments',
      'Older independent houses',
      'Clinics and small offices',
    ],
    description:
      'A dense, well-connected residential hub with a strong professional community. Home-office nooks and clinic fit-outs are frequent asks.',
    considerations: [
      'Street noise on the main square — acoustic glazing or heavy curtains for bedrooms facing the road.',
      'Many flats have a single long living-dining hall that needs zoning without walls.',
      'Clinic fit-outs must respect fire-exit widths — we coordinate drawings with the building manager.',
    ],
    multiplier: 1.0,
  },
  {
    slug: 'rajendra-nagar',
    name: 'Rajendra Nagar',
    city: 'Indore',
    kind: 'locality',
    lat: 22.6699,
    lng: 75.8437,
    distanceKm: 11.8,
    pincodes: ['452012'],
    propertyTypes: ['2BHK and 3BHK apartments', 'Independent houses', 'Retail shops'],
    description:
      'Established south Indore neighbourhood with a mix of first-time buyers and long-time residents renovating 20-year-old homes.',
    considerations: [
      'Renovations here often uncover old conduit — we allow a small civil contingency.',
      'Mid-range budgets favour laminate finishes with one acrylic or PU highlight.',
      'Retail frontages face strong evening sun — display lighting is designed for it.',
    ],
    multiplier: 1.0,
  },
  {
    slug: 'ab-road',
    name: 'AB Road',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7276,
    lng: 75.8846,
    distanceKm: 3.2,
    pincodes: ['452001', '452008', '452010'],
    propertyTypes: [
      'Commercial offices',
      'Clinics and diagnostic centres',
      'Showrooms',
      'Premium apartments',
    ],
    description:
      'The commercial spine of Indore. Our AB Road work is mostly clinics, offices, and showrooms where timeline certainty and GST-inclusive costing matter as much as design.',
    considerations: [
      'Commercial fit-outs need fire NOC-compliant materials — we specify FR-grade boards and fabrics.',
      'Loading and unloading windows are tight; deliveries are scheduled before 10:00.',
      'Landlord approvals for HVAC and electrical changes can add 1–2 weeks.',
    ],
    multiplier: 1.05,
  },
  {
    slug: 'khajrana',
    name: 'Khajrana',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7359,
    lng: 75.9117,
    distanceKm: 3.9,
    pincodes: ['452016', '452018'],
    propertyTypes: ['2BHK and 3BHK apartments', 'Older houses', 'Home-based businesses'],
    description:
      'Close to the Khajrana Ganesh temple, this is a neighbourhood where a well-designed pooja room is often the first thing a family asks about.',
    considerations: [
      'Pooja rooms and temple walls with proper ventilation for diyas and incense.',
      'Compact plots — furniture is often custom-built to the last inch.',
      'Festival season (Sept–Nov) is a busy time for handovers; we plan backwards from Diwali.',
    ],
    multiplier: 1.0,
  },
  {
    slug: 'scheme-54',
    name: 'Scheme 54',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7501,
    lng: 75.8994,
    distanceKm: 1.2,
    pincodes: ['452010'],
    propertyTypes: ['Independent bungalows', 'Builder floors', 'Boutique offices'],
    description:
      'Our home neighbourhood. Wide plots, mature trees, and a generation of bungalows now being renovated by the children of the original owners.',
    considerations: [
      'Heritage-feel renovations — clients want to keep the terrazzo or Kota stone and modernise around it.',
      'Older ceilings are higher (11–12 ft), which suits cove lighting and tall wardrobes.',
      'Plumbing lines usually need replacement before any bathroom work.',
    ],
    multiplier: 1.05,
  },
  {
    slug: 'scheme-78',
    name: 'Scheme 78',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7625,
    lng: 75.8842,
    distanceKm: 2.1,
    pincodes: ['452010'],
    propertyTypes: ['Premium 3BHK and 4BHK apartments', 'Duplex penthouses', 'Independent houses'],
    description:
      'Quiet, leafy, and close to the Vijay Nagar amenities. Homes here are frequently second or third homes for the family, with a higher appetite for Premium and Luxury tiers.',
    considerations: [
      'Natural stone and veneer are common asks — we bring samples to site to check under real light.',
      'Penthouse terraces need waterproofing coordination before decking.',
      'Duplex staircases become a design feature — lighting and railings get their own drawings.',
    ],
    multiplier: 1.05,
  },
  {
    slug: 'silicon-city',
    name: 'Silicon City',
    city: 'Indore',
    kind: 'locality',
    lat: 22.6759,
    lng: 75.8318,
    distanceKm: 11.2,
    pincodes: ['452012', '452013'],
    propertyTypes: ['Row houses', 'Duplex villas', '2BHK and 3BHK apartments'],
    description:
      'A planned township of row houses and duplexes popular with young IT and finance professionals. Work-from-home studies are in almost every brief.',
    considerations: [
      'Row houses share walls — sound-insulating wardrobe backs on party walls.',
      'Narrow frontages make the foyer and staircase design disproportionately important.',
      'Clients often want a phased plan: ground floor now, first floor in a year.',
    ],
    multiplier: 0.95,
  },
  {
    slug: 'talawali-chanda',
    name: 'Talawali Chanda',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7898,
    lng: 75.9256,
    distanceKm: 7.4,
    pincodes: ['453771'],
    propertyTypes: ['New township apartments', 'Farmhouse plots', 'Weekend homes'],
    description:
      'Along the Dewas road, a mix of new affordable towers and larger farmhouse plots. Weekend homes here get a relaxed, rustic-leaning brief.',
    considerations: [
      'Farmhouses need materials that tolerate being closed up for weeks — no MDF near humidity.',
      'Township flats are compact; loft storage and sliding wardrobes are standard.',
      'Power fluctuations are more common — we specify surge protection on lighting circuits.',
    ],
    multiplier: 0.95,
  },
  {
    slug: 'bypass-road',
    name: 'Bypass Road',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7005,
    lng: 75.9309,
    distanceKm: 8.0,
    pincodes: ['452016', '452020'],
    propertyTypes: ['Large gated-community apartments', 'Villas', 'Restaurants and banquet halls'],
    description:
      "The eastern bypass has become Indore's newest premium corridor: large gated communities, villas with gardens, and a lively restaurant strip.",
    considerations: [
      'Gated communities have strict material-entry windows; we coordinate with the estate office.',
      'Villas with gardens want indoor–outdoor continuity — flooring and door choices reflect that.',
      'Restaurants need kitchen exhaust coordination before any ceiling design.',
    ],
    multiplier: 1.0,
  },
  {
    slug: 'sudama-nagar',
    name: 'Sudama Nagar',
    city: 'Indore',
    kind: 'locality',
    lat: 22.6923,
    lng: 75.8376,
    distanceKm: 10.4,
    pincodes: ['452009'],
    propertyTypes: ['Independent houses', '1BHK and 2BHK apartments', 'Home clinics'],
    description:
      "One of Indore's largest residential colonies, with a strong tradition of independent homes being extended and renovated floor by floor.",
    considerations: [
      'Extensions often mean matching new flooring to old — we source or approximate carefully.',
      'Budgets are practical; we prioritise the kitchen and one wardrobe set first.',
      'Narrow lanes limit truck access; plywood arrives on smaller vehicles.',
    ],
    multiplier: 0.95,
  },
  {
    slug: 'annapurna',
    name: 'Annapurna',
    city: 'Indore',
    kind: 'locality',
    lat: 22.6937,
    lng: 75.8497,
    distanceKm: 9.3,
    pincodes: ['452009'],
    propertyTypes: ['Independent houses', '2BHK apartments', 'Small retail'],
    description:
      'Traditional west Indore with a strong sense of community. Many homes have a dedicated pooja room and a preference for warm, traditional materials.',
    considerations: [
      'Traditional Indian styling with teak-look finishes and brass accents is a frequent ask.',
      'Older homes have uneven walls — we use a levelling putty stage before any paint or wallpaper.',
      'Small retail wants maximum display per square foot — we design shelving to the ceiling.',
    ],
    multiplier: 0.95,
  },
  {
    slug: 'palasia',
    name: 'Palasia',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7226,
    lng: 75.8842,
    distanceKm: 3.6,
    pincodes: ['452001'],
    propertyTypes: ['Premium apartments', 'Old bungalows', 'Boutique retail and cafés'],
    description:
      'Central, walkable, and full of character — Palasia mixes old bungalows with new boutique retail and cafés. A favourite for Art Deco and Indo-Modern briefs.',
    considerations: [
      'Heritage façades and interiors often need sensitive updating rather than replacement.',
      'Cafés and boutiques prioritise a strong, photographable entrance.',
      'Central location means tighter parking for site vehicles — deliveries are scheduled early.',
    ],
    multiplier: 1.0,
  },
  {
    slug: 'saket-nagar',
    name: 'Saket Nagar',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7165,
    lng: 75.8917,
    distanceKm: 4.1,
    pincodes: ['452018'],
    propertyTypes: ['Independent houses', '3BHK apartments', "Doctor's clinics"],
    description:
      'Well-established residential area near the hospital belt. Many clients are medical professionals wanting a calm home and a compact clinic.',
    considerations: [
      'Clinics need hygienic, wipeable surfaces — we specify PU or acrylic over laminates.',
      'Bedrooms often double as a study; built-in desks are standard here.',
      'Good tree cover means lower natural light indoors — lighter wall tones are recommended.',
    ],
    multiplier: 1.0,
  },
  {
    slug: 'mahalaxmi-nagar',
    name: 'Mahalaxmi Nagar',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7635,
    lng: 75.9095,
    distanceKm: 2.6,
    pincodes: ['452010'],
    propertyTypes: ['New 2BHK and 3BHK apartments', 'Builder floors', 'Duplexes'],
    description:
      "A young, family-focused neighbourhood next to Vijay Nagar. Compact 3BHKs with a kids' room and a study nook are the typical brief.",
    considerations: [
      "Kids' rooms designed to grow — bunk beds convertible to single beds, adjustable desks.",
      'Compact kitchens (7–9 ft runs) get tall units and pull-outs to maximise storage.',
      'Many flats are north-facing with soft light — warm neutrals work well.',
    ],
    multiplier: 1.05,
  },
  {
    slug: 'tilak-nagar',
    name: 'Tilak Nagar',
    city: 'Indore',
    kind: 'locality',
    lat: 22.7174,
    lng: 75.8977,
    distanceKm: 4.4,
    pincodes: ['452018'],
    propertyTypes: ['Independent houses', '2BHK and 3BHK apartments', 'Small offices'],
    description:
      'A mature, central-east neighbourhood where second-generation owners renovate family homes with a mix of respect for tradition and a desire for contemporary comfort.',
    considerations: [
      'Renovations while the family stays in residence — we phase work room by room.',
      'Many homes have a traditional aangan or courtyard that becomes a design focal point.',
      'Modernising kitchens frequently requires shifting the gas line — we coordinate with the agency.',
    ],
    multiplier: 1.0,
  },
  // ---- nearby cities ----------------------------------------------------------
  {
    slug: 'bhopal',
    name: 'Bhopal',
    city: 'Bhopal',
    kind: 'city',
    lat: 23.2599,
    lng: 77.4126,
    distanceKm: 195,
    pincodes: ['462001', '462003', '462016', '462039'],
    propertyTypes: [
      'Premium apartments in Arera Colony and Kolar',
      'Independent bungalows',
      'Government-quarter renovations',
    ],
    description:
      'We take on selected full-home and villa projects in Bhopal, typically Premium tier and above, with a dedicated site supervisor stationed for the duration.',
    considerations: [
      'A resident site supervisor is included for Bhopal projects; travel is bundled into the execution fee.',
      'Material deliveries are consolidated weekly from Indore.',
      'Timelines run 1–2 weeks longer than equivalent Indore projects.',
    ],
    multiplier: 1.1,
  },
  {
    slug: 'ujjain',
    name: 'Ujjain',
    city: 'Ujjain',
    kind: 'city',
    lat: 23.1765,
    lng: 75.7885,
    distanceKm: 56,
    pincodes: ['456001', '456006', '456010'],
    propertyTypes: [
      'Traditional family homes',
      'New apartments near Freeganj',
      'Hotels and guest houses',
    ],
    description:
      'An hour from Indore, Ujjain briefs lean traditional — temple-town clients want pooja rooms, courtyards, and warm materials done with contemporary precision.',
    considerations: [
      'Traditional Indian and Vastu-aligned briefs are the majority here.',
      'Guest-house and hotel work requires durable, easily maintained finishes.',
      'Weekly site visits; local carpentry teams are supervised by our Indore leads.',
    ],
    multiplier: 1.0,
  },
  {
    slug: 'dewas',
    name: 'Dewas',
    city: 'Dewas',
    kind: 'city',
    lat: 22.9676,
    lng: 76.0534,
    distanceKm: 38,
    pincodes: ['455001'],
    propertyTypes: ['Industrial-belt family homes', 'New township apartments', 'Factory offices'],
    description:
      'Dewas homeowners — many working in the industrial area — want robust, practical interiors that still feel warm. Factory offices and guest rooms are also common commissions.',
    considerations: [
      'Dust from the industrial belt — we recommend closed storage and easy-clean finishes.',
      'Factory offices prioritise durability and clear wayfinding.',
      'Bi-weekly site visits with a local execution partner.',
    ],
    multiplier: 0.95,
  },
  {
    slug: 'pithampur',
    name: 'Pithampur',
    city: 'Pithampur',
    kind: 'city',
    lat: 22.6072,
    lng: 75.6845,
    distanceKm: 30,
    pincodes: ['454775'],
    propertyTypes: ['Company housing', 'New 2BHK apartments', 'Plant offices and canteens'],
    description:
      'The industrial hub south-west of Indore. We fit out plant offices, canteens, and executive guest houses, plus a growing number of family homes in the new townships.',
    considerations: [
      'Corporate clients need GST-compliant invoicing and a fixed handover date — both standard for us.',
      'Canteens and washrooms need heavy-duty tile and stainless detailing.',
      'Family homes here are usually Essential/Standard tier with an emphasis on storage.',
    ],
    multiplier: 0.95,
  },
];

export const indoreLocalities = localities.filter((l) => l.kind === 'locality');
export const nearbyCities = localities.filter((l) => l.kind === 'city');

export function getLocality(slug: string): Locality | undefined {
  return localities.find((l) => l.slug === slug);
}

export function localityMultiplier(nameOrSlug: string): number {
  const s = nameOrSlug.toLowerCase().replace(/\s+/g, '-');
  return (
    localities.find((l) => l.slug === s || l.name.toLowerCase() === nameOrSlug.toLowerCase())
      ?.multiplier ?? 1.0
  );
}

/** Serviceable for home visits: Indore district PINs. Others get a video-call alternative. */
export function isServiceablePin(pin: string): {
  serviceable: boolean;
  nearby: boolean;
  locality?: Locality;
} {
  const p = pin.trim();
  if (!/^\d{6}$/.test(p)) return { serviceable: false, nearby: false };
  const match = localities.find((l) => l.pincodes.includes(p));
  if (match) return { serviceable: match.kind === 'locality', nearby: true, locality: match };
  if (p.startsWith('452') || p.startsWith('453')) return { serviceable: true, nearby: true };
  if (p.startsWith('45')) return { serviceable: false, nearby: true };
  return { serviceable: false, nearby: false };
}

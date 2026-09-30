import type { Designer, WeeklyAvailability } from '@/types/content';

import { img } from './images';

const weekdays = (slots: string[]): WeeklyAvailability => ({
  slots: { mon: slots, tue: slots, wed: slots, thu: slots, fri: slots, sat: slots.slice(0, 3), sun: [] },
  blockedDates: [],
});

const STANDARD = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const LATE = ['11:00', '12:00', '15:00', '16:00', '17:00', '18:00'];

/** 6 fictional designers — SRS §11.2. Portraits are generated monogram illustrations, not photos. */
export const designers: Designer[] = [
  {
    slug: 'meera-rathore',
    name: 'Meera Rathore',
    role: 'Founder & Principal Designer',
    photo: img('designer-meera-rathore'),
    experienceYears: 14,
    specialisations: ['Full-home interiors', 'Heritage renovation', 'Indo-Modern fusion'],
    styles: ['indo-modern-fusion', 'traditional-indian', 'luxury'],
    cities: ['Indore', 'Ujjain', 'Bhopal'],
    languages: ['Hindi', 'English', 'Malwi'],
    qualifications: ['B.Arch, SPA Bhopal', 'M.Des Interior, NID Ahmedabad'],
    bio: 'Meera founded the studio in 2014 after six years with a heritage-conservation practice in Ahmedabad. She believes an Indore home should feel like Indore — the light, the stone, the way families actually live — and is happiest when a client says the finished home feels like it was always meant to be that way.',
    philosophy: 'Restraint is a form of generosity. Every surface you leave quiet lets the important ones speak.',
    availability: weekdays(STANDARD),
    projectSlugs: ['scheme-54-heritage-bungalow', 'palasia-art-deco-apartment', 'ujjain-courtyard-home', 'scheme-78-duplex-penthouse'],
  },
  {
    slug: 'arjun-bhatnagar',
    name: 'Arjun Bhatnagar',
    role: 'Design Director — Residential',
    photo: img('designer-arjun-bhatnagar'),
    experienceYears: 11,
    specialisations: ['Compact apartments', 'Modular kitchens', 'Storage planning'],
    styles: ['contemporary', 'minimal', 'scandinavian', 'japandi'],
    cities: ['Indore', 'Dewas'],
    languages: ['Hindi', 'English'],
    qualifications: ['B.Des Interior, MIT Institute of Design, Pune'],
    bio: 'Arjun leads our apartment work. He has planned over ninety kitchens and has strong, evidence-based opinions on drawer depths. He is the person clients call when a 2BHK needs to work like a 3BHK.',
    philosophy: 'A compact home is not a compromise. It is a puzzle with a beautiful solution.',
    availability: weekdays(STANDARD),
    projectSlugs: ['nipania-compact-2bhk', 'mahalaxmi-nagar-family-3bhk', 'silicon-city-row-house', 'rau-first-home-2bhk', 'vijay-nagar-japandi-3bhk'],
  },
  {
    slug: 'sana-qureshi',
    name: 'Sana Qureshi',
    role: 'Senior Designer — Commercial',
    photo: img('designer-sana-qureshi'),
    experienceYears: 9,
    specialisations: ['Clinics and healthcare', 'Offices', 'Retail and F&B'],
    styles: ['contemporary', 'industrial', 'minimal'],
    cities: ['Indore', 'Pithampur'],
    languages: ['Hindi', 'English', 'Urdu'],
    qualifications: ['B.Arch, IPS Academy Indore', 'PG Cert. Healthcare Design'],
    bio: 'Sana runs our commercial studio. Her clinic work is known for calm waiting areas and back-of-house that actually works for staff; her café and retail projects are designed to be photographed and to survive it.',
    philosophy: 'Commercial spaces are judged in the first three seconds and lived in for the next three years. Design for both.',
    availability: weekdays(LATE),
    projectSlugs: ['ab-road-dental-clinic', 'palasia-specialty-cafe', 'super-corridor-tech-office', 'bypass-road-restaurant', 'saket-nagar-paediatric-clinic'],
  },
  {
    slug: 'devendra-solanki',
    name: 'Devendra Solanki',
    role: 'Senior Designer — Villas & Bungalows',
    photo: img('designer-devendra-solanki'),
    experienceYears: 12,
    specialisations: ['Villas and farmhouses', 'Joint-family homes', 'Vastu-aligned planning'],
    styles: ['traditional-indian', 'rustic', 'modern-indian', 'luxury'],
    cities: ['Indore', 'Ujjain', 'Dewas'],
    languages: ['Hindi', 'Malwi', 'English'],
    qualifications: ['B.Arch, SDPS Women\'s College Indore (visiting faculty)', 'Diploma in Vastu Shastra'],
    bio: 'Devendra grew up in a joint-family haveli near Rajwada and it shows: his homes have generous common areas, quiet private ones, and pooja rooms that are the heart of the plan. He handles our Vastu-aligned briefs with respect and without superstition.',
    philosophy: 'Tradition is a conversation with the people who lived here before us — not a rule book.',
    availability: weekdays(STANDARD),
    projectSlugs: ['bicholi-mardana-joint-family-villa', 'bypass-road-garden-villa', 'talawali-chanda-farmhouse', 'annapurna-traditional-home'],
  },
  {
    slug: 'priya-menon',
    name: 'Priya Menon',
    role: 'Designer — Colour & Materials',
    photo: img('designer-priya-menon'),
    experienceYears: 7,
    specialisations: ['Colour consultation', 'Material curation', 'Kids\' rooms'],
    styles: ['bohemian', 'coastal', 'modern-indian', 'contemporary'],
    cities: ['Indore'],
    languages: ['English', 'Hindi', 'Malayalam'],
    qualifications: ['B.F.A. Applied Arts, Indore School of Art', 'Colour Theory Cert., Pantone Institute'],
    bio: 'Priya curates our material library and runs colour consultations. She built the shade catalogue you see in the visualiser and can tell you which of our greens will look grey at 5 pm in a north-facing Indore flat.',
    philosophy: 'Colour is the cheapest, fastest, most emotional thing you can change in a room. Take it seriously.',
    availability: weekdays(LATE),
    projectSlugs: ['khajrana-boho-2bhk', 'tilak-nagar-kids-rooms', 'bengali-square-coastal-3bhk', 'sudama-nagar-colour-refresh'],
  },
  {
    slug: 'rohan-jaiswal',
    name: 'Rohan Jaiswal',
    role: 'Project Lead — Execution',
    photo: img('designer-rohan-jaiswal'),
    experienceYears: 10,
    specialisations: ['Site execution', 'Renovation phasing', 'Quality control'],
    styles: ['contemporary', 'industrial', 'modern-indian'],
    cities: ['Indore', 'Dewas', 'Pithampur', 'Bhopal'],
    languages: ['Hindi', 'English'],
    qualifications: ['B.E. Civil, SGSITS Indore', 'PMP'],
    bio: 'Rohan is why our projects finish on time. He plans every renovation so the family can keep living at home, runs our carpentry and finishing teams, and takes the site photos that end up in the client dashboard every evening.',
    philosophy: 'A drawing is a promise. Execution is keeping it.',
    availability: weekdays(['09:00', '10:00', '16:00', '17:00']),
    projectSlugs: ['rajendra-nagar-renovation-3bhk', 'super-corridor-4bhk-contemporary', 'pithampur-executive-guest-house'],
  },
];

export function getDesigner(slug: string): Designer | undefined {
  return designers.find((d) => d.slug === slug);
}

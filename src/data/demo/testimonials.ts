import type { Testimonial } from '@/types/content';

import { budgetBandOf, getProject } from './projects';

interface Row {
  id: string;
  project?: string;
  name: string;
  locality: string;
  type?: string;
  designer?: string;
  challenge?: string;
  quote: string;
  rating: Testimonial['rating'];
  featured?: boolean;
  date: string;
}

const rows: Row[] = [
  {
    id: 't-01',
    project: 'scheme-54-heritage-bungalow',
    name: 'The Khandelwal family',
    locality: 'Scheme 54',
    designer: 'meera-rathore',
    challenge: 'Renovating a 1978 bungalow for nine people without losing its soul.',
    quote:
      'My mother cried when she saw the Kota floor back in place. Meera understood that this house was not a project to us — it was our grandparents. Everything new feels like it was always here.',
    rating: 5,
    featured: true,
    date: '2025-11-28',
  },
  {
    id: 't-02',
    project: 'nipania-compact-2bhk',
    name: 'Ritika & Sameer Joshi',
    locality: 'Nipania',
    designer: 'arjun-bhatnagar',
    challenge: 'Making 860 sq ft work for a family of three.',
    quote:
      'We were told by two other firms that our list was "unrealistic for a 2BHK". Arjun drew it in a week. Eight months later we still find storage we did not know we had.',
    rating: 5,
    featured: true,
    date: '2025-07-02',
  },
  {
    id: 't-03',
    project: 'palasia-art-deco-apartment',
    name: 'Aditya & Nandini Rao',
    locality: 'Palasia',
    designer: 'meera-rathore',
    quote:
      'Every visitor stops in the foyer. We asked for a cinema lobby and got a home that feels like it has always been here. The brass line along the ceiling is the detail everyone photographs.',
    rating: 5,
    featured: true,
    date: '2025-08-20',
  },
  {
    id: 't-04',
    project: 'rau-first-home-2bhk',
    name: 'Priyanka Verma',
    locality: 'Rau',
    designer: 'arjun-bhatnagar',
    challenge: 'A strict budget for a first home.',
    quote:
      'I was worried an Essential-tier project would feel like a compromise. It does not. I picked the green kitchen shutters myself in the visualiser, and the team made it exactly that colour.',
    rating: 5,
    featured: true,
    date: '2025-03-05',
  },
  {
    id: 't-05',
    project: 'ab-road-dental-clinic',
    name: 'Dr. Pooja Malviya',
    locality: 'AB Road',
    type: 'Dental clinic',
    designer: 'sana-qureshi',
    challenge: 'A clinic in eight weeks, before the lease started.',
    quote:
      'Sana delivered on day 54 of 56. Patients tell the receptionist it feels like a café. My sterilisation staff tell me the back-of-house is the best they have worked in. Both matter.',
    rating: 5,
    featured: true,
    date: '2025-05-20',
  },
  {
    id: 't-06',
    project: 'bicholi-mardana-joint-family-villa',
    name: 'The Patidar family',
    locality: 'Bicholi Mardana',
    designer: 'devendra-solanki',
    quote:
      'Eleven people, one house, zero arguments about the design — Devendra ji listened to every one of us separately and then somehow made a home where we all wanted to be in the same room. The 12-seat table was the right call.',
    rating: 5,
    featured: true,
    date: '2025-07-15',
  },
  {
    id: 't-07',
    project: 'rajendra-nagar-renovation-3bhk',
    name: 'Manish & Shweta Agrawal',
    locality: 'Rajendra Nagar',
    designer: 'rohan-jaiswal',
    challenge: 'Renovating while living in the flat.',
    quote:
      "The kitchen was gone on Friday evening and back — new — by Monday lunch. We never ate takeaway more than two days in a row. Rohan's daily photo update at 7 pm became a family ritual.",
    rating: 5,
    date: '2025-09-20',
  },
  {
    id: 't-08',
    project: 'khajrana-boho-2bhk',
    name: 'Aarti Sharma',
    locality: 'Khajrana',
    designer: 'priya-menon',
    quote:
      'I wanted five colours. Priya said "one per room" and she was right. The indigo wall is the best thing I own after my loom.',
    rating: 5,
    date: '2025-09-05',
  },
  {
    id: 't-09',
    project: 'vijay-nagar-japandi-3bhk',
    name: 'Kunal & Ira Deshmukh',
    locality: 'Vijay Nagar',
    designer: 'arjun-bhatnagar',
    quote:
      'We are both in design and are the worst clients imaginable. Arjun disagreed with us twice, was right both times, and laid oak over our old tiles in a way we would not have dared. The corridor of pots is our favourite room.',
    rating: 5,
    date: '2025-11-02',
  },
  {
    id: 't-10',
    project: 'sudama-nagar-colour-refresh',
    name: 'Rekha Chouhan',
    locality: 'Sudama Nagar',
    designer: 'priya-menon',
    challenge: 'A ₹2 lakh budget.',
    quote:
      'I honestly did not expect a design studio to take a two-lakh job seriously. They did. Three weeks, three colours and new lights, and my neighbours think I renovated the whole flat.',
    rating: 5,
    date: '2025-07-18',
  },
  {
    id: 't-11',
    project: 'super-corridor-tech-office',
    name: 'Vikram Sethi, COO',
    locality: 'Super Corridor',
    type: 'Office',
    designer: 'sana-qureshi',
    quote:
      'Sixty seats, twelve weeks, on budget to the rupee. The magnetic track lighting has already been reconfigured twice as the team grew — that flexibility was worth every paisa.',
    rating: 5,
    date: '2025-07-30',
  },
  {
    id: 't-12',
    project: 'talawali-chanda-farmhouse',
    name: 'Colonel (Retd.) R. S. Tomar',
    locality: 'Talawali Chanda',
    designer: 'devendra-solanki',
    quote:
      'I said "no resort nonsense" and Devendra took it seriously. The house feels like a well-kept farmhouse, not a hotel. Two monsoons later, nothing has swollen or peeled.',
    rating: 5,
    date: '2025-10-12',
  },
  {
    id: 't-13',
    project: 'mahalaxmi-nagar-family-3bhk',
    name: 'Deepak & Sunita Jain',
    locality: 'Mahalaxmi Nagar',
    designer: 'arjun-bhatnagar',
    quote:
      "My parents' room was designed around my father's knee — the wardrobe height, the bedside light, the floor. Nobody else asked about that. Dot 3 did.",
    rating: 5,
    date: '2025-10-15',
  },
  {
    id: 't-14',
    project: 'bengali-square-coastal-3bhk',
    name: 'Fernandes family',
    locality: 'Bengali Square',
    designer: 'priya-menon',
    quote:
      'We left the sea behind in Goa. Priya gave us a home that feels like a Sunday morning in Candolim — without a single seashell in sight.',
    rating: 4,
    date: '2025-01-10',
  },
  {
    id: 't-15',
    project: 'bypass-road-restaurant',
    name: 'Mohit Malviya, Owner',
    locality: 'Bypass Road',
    type: 'Restaurant',
    designer: 'sana-qureshi',
    quote:
      'Authentic Malwa without the plastic-brass clichés. Guests photograph the entrance tiles every day. And the floors have survived a year of thali spills.',
    rating: 5,
    date: '2025-05-02',
  },
  {
    id: 't-16',
    project: 'tilak-nagar-kids-rooms',
    name: 'Neha Saxena',
    locality: 'Tilak Nagar',
    designer: 'priya-menon',
    quote:
      'Five weeks of summer holidays, two rooms, two very opinionated children. Everybody got what they wanted and the rooms will still work when they are in college.',
    rating: 5,
    date: '2025-06-10',
  },
  {
    id: 't-17',
    project: 'scheme-78-duplex-penthouse',
    name: 'Arnav & Meghna Kapoor',
    locality: 'Scheme 78',
    designer: 'meera-rathore',
    quote:
      'We had seen every showroom in Singapore. Meera used four materials on the whole ground floor and it is the calmest, most luxurious home we have lived in.',
    rating: 5,
    date: '2026-01-08',
  },
  {
    id: 't-18',
    project: 'pithampur-executive-guest-house',
    name: 'Facilities Head, Auto Components Ltd.',
    locality: 'Pithampur',
    type: 'Corporate guest house',
    designer: 'rohan-jaiswal',
    quote:
      'Ten weeks, handed over three days before the inauguration, GST invoices in perfect order. Visiting directors ask who did the interiors. We tell them.',
    rating: 5,
    date: '2025-02-20',
  },
];

export const testimonials: Testimonial[] = rows.map((r) => {
  const project = r.project ? getProject(r.project) : undefined;
  return {
    id: r.id,
    projectSlug: r.project,
    clientName: r.name,
    locality: r.locality,
    projectType:
      r.type ??
      (project ? `${project.bhk ?? ''} ${project.propertyType.toLowerCase()}`.trim() : undefined),
    budgetBand: project?.budgetInr ? budgetBandOf(project.budgetInr) : undefined,
    timelineWeeks: project?.durationWeeks,
    designerSlug: r.designer,
    challenge: r.challenge,
    quote: r.quote,
    rating: r.rating,
    featured: r.featured ?? false,
    date: r.date,
  };
});

export const featuredTestimonials = testimonials.filter((t) => t.featured);

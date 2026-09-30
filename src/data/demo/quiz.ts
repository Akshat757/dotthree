import type { QuizDimension, QuizProfile, QuizQuestion } from '@/types/content';

import { img } from './images';

const opt = (qid: string, id: string, label: string, vector: Partial<Record<QuizDimension, number>>) => ({
  id,
  label,
  image: img(`quiz-${qid}-${id}`),
  vector,
});

/** 8 visual questions — SRS FR-G-02. Each option nudges a profile dimension in [-1, 1]. */
export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Which living room would you rather come home to?',
    dimension: 'colourTemp',
    options: [
      opt('q1', 'a', 'Warm whites, teak and terracotta', { colourTemp: 1, materialWarmth: 0.6 }),
      opt('q1', 'b', 'Cool greys, glass and black metal', { colourTemp: -1, materialWarmth: -0.6 }),
      opt('q1', 'c', 'Pale wood, linen and lots of daylight', { colourTemp: 0.3, materialWarmth: 0.3, naturalLight: 0.8 }),
      opt('q1', 'd', 'Deep jewel colours and velvet', { colourTemp: 0.2, ornament: 0.8, budget: 0.4 }),
    ],
  },
  {
    id: 'q2',
    prompt: 'Pick a kitchen you would cook in every day.',
    dimension: 'materialWarmth',
    options: [
      opt('q2', 'a', 'Sage lowers, white uppers, black granite', { materialWarmth: 0.4, pattern: -0.2 }),
      opt('q2', 'b', 'Handleless grey gloss and quartz', { materialWarmth: -0.8, ornament: -0.6 }),
      opt('q2', 'c', 'Oak shutters and a patterned tile splashback', { materialWarmth: 0.8, pattern: 0.6 }),
      opt('q2', 'd', 'Ivory PU gloss and a marble island', { materialWarmth: 0.1, budget: 0.9, ornament: 0.2 }),
    ],
  },
  {
    id: 'q3',
    prompt: 'How much pattern do you like on your walls?',
    dimension: 'pattern',
    options: [
      opt('q3', 'a', 'None — plain, calm walls', { pattern: -1, ornament: -0.6 }),
      opt('q3', 'b', 'One wallpaper wall per room', { pattern: 0.3 }),
      opt('q3', 'c', 'Texture rather than print — lime plaster, fluting', { pattern: 0.1, materialWarmth: 0.5, ornament: 0.2 }),
      opt('q3', 'd', 'Block prints, ikat and colour everywhere', { pattern: 1, ornament: 0.7 }),
    ],
  },
  {
    id: 'q4',
    prompt: 'Your bedroom wardrobe should be…',
    dimension: 'storage',
    options: [
      opt('q4', 'a', 'Floor-to-ceiling, hidden, handleless', { storage: 1, ornament: -0.5 }),
      opt('q4', 'b', 'Open shelves and a hanging rail — I like seeing my things', { storage: -0.6, ornament: 0.2 }),
      opt('q4', 'c', 'Classic openable shutters in wood', { storage: 0.4, materialWarmth: 0.6 }),
      opt('q4', 'd', 'A walk-in with a dresser and an island', { storage: 0.8, budget: 0.8 }),
    ],
  },
  {
    id: 'q5',
    prompt: 'How do you use your home for guests?',
    dimension: 'entertaining',
    options: [
      opt('q5', 'a', 'Big festivals, forty people, the more the merrier', { entertaining: 1, storage: 0.4 }),
      opt('q5', 'b', 'Small dinners for six', { entertaining: 0.3 }),
      opt('q5', 'c', 'Rarely — home is for us', { entertaining: -0.8 }),
      opt('q5', 'd', 'Weekend family lunches with the parents and kids', { entertaining: 0.6, storage: 0.3 }),
    ],
  },
  {
    id: 'q6',
    prompt: 'Which window treatment feels right?',
    dimension: 'naturalLight',
    options: [
      opt('q6', 'a', 'Sheer white curtains — let all the light in', { naturalLight: 1, colourTemp: 0.2 }),
      opt('q6', 'b', 'Bamboo blinds and dappled shade', { naturalLight: 0.5, materialWarmth: 0.7 }),
      opt('q6', 'c', 'Heavy velvet drapes, dramatic and dark', { naturalLight: -0.8, ornament: 0.6 }),
      opt('q6', 'd', 'Layered linen and blackout — control is everything', { naturalLight: 0.2, storage: 0.3 }),
    ],
  },
  {
    id: 'q7',
    prompt: 'Choose a pooja space.',
    dimension: 'ornament',
    options: [
      opt('q7', 'a', 'A carved teak mandir with brass bells', { ornament: 1, materialWarmth: 0.8 }),
      opt('q7', 'b', 'A quiet marble niche with a single warm light', { ornament: -0.4, materialWarmth: 0.2 }),
      opt('q7', 'c', 'A fluted panel unit that closes when not in use', { ornament: 0, storage: 0.6 }),
      opt('q7', 'd', 'I do not need one', { ornament: -0.6 }),
    ],
  },
  {
    id: 'q8',
    prompt: 'When it comes to budget, you…',
    dimension: 'budget',
    options: [
      opt('q8', 'a', 'Want the most from every rupee — smart, in-stock, done well', { budget: -1 }),
      opt('q8', 'b', 'Will spend more on the kitchen and save elsewhere', { budget: -0.3 }),
      opt('q8', 'c', 'Prefer fewer, better materials even if it costs more', { budget: 0.5, ornament: -0.3 }),
      opt('q8', 'd', 'Want it done once, properly, whatever it takes', { budget: 1 }),
    ],
  },
];

const prof = (p: Omit<QuizProfile, 'heroImage'>): QuizProfile => ({ ...p, heroImage: img(`profile-${p.id}`) });

/** 8 result profiles. The quiz returns the nearest profile by cosine similarity. */
export const quizProfiles: QuizProfile[] = [
  prof({
    id: 'warm-modernist',
    name: 'The Warm Modernist',
    styleSlug: 'modern-indian',
    description: 'You like clean planning but not cold rooms. Teak tones, warm whites, one earthy accent and brass in small doses.',
    vector: { colourTemp: 0.8, materialWarmth: 0.6, ornament: 0, storage: 0.5, entertaining: 0.5, naturalLight: 0.5, pattern: 0, budget: 0.1 },
    paletteMaterialSlugs: ['paint-ivory-mist', 'paint-malwa-clay', 'veneer-natural-teak', 'metal-brushed-brass'],
    projectSlugs: ['mahalaxmi-nagar-family-3bhk', 'bicholi-mardana-joint-family-villa', 'sudama-nagar-colour-refresh'],
    materialSlugs: ['laminate-walnut-classic', 'fabric-linen-oat', 'light-cove-profile-warm'],
  }),
  prof({
    id: 'quiet-minimalist',
    name: 'The Quiet Minimalist',
    styleSlug: 'minimal',
    description: 'Fewer things, better made. Hidden storage, quiet walls and one object per room allowed to matter.',
    vector: { colourTemp: 0.1, materialWarmth: 0.1, ornament: -0.9, storage: 1, entertaining: -0.4, naturalLight: 0.7, pattern: -1, budget: 0.4 },
    paletteMaterialSlugs: ['paint-cotton-white', 'pu-matte-white', 'veneer-white-ash', 'top-nano-white'],
    projectSlugs: ['vijay-nagar-japandi-3bhk', 'silicon-city-row-house'],
    materialSlugs: ['wood-engineered-oak', 'handle-gola-profile-black', 'light-wall-sconce-plaster'],
  }),
  prof({
    id: 'colour-collector',
    name: 'The Colour Collector',
    styleSlug: 'bohemian',
    description: 'Pattern, textiles, plants and colour — with a rule: one bold colour per room and earthy neutrals everywhere else.',
    vector: { colourTemp: 0.4, materialWarmth: 0.7, ornament: 0.8, storage: -0.4, entertaining: 0.4, naturalLight: 0.6, pattern: 1, budget: -0.4 },
    paletteMaterialSlugs: ['wallpaper-indigo-block-print', 'paint-rajwada-rose', 'paint-turmeric-light', 'laminate-cane-print'],
    projectSlugs: ['khajrana-boho-2bhk', 'bengali-square-coastal-3bhk'],
    materialSlugs: ['fabric-ikat-indigo', 'curtain-bamboo-blind', 'light-cane-pendant'],
  }),
  prof({
    id: 'cool-contemporary',
    name: 'The Cool Contemporary',
    styleSlug: 'contemporary',
    description: 'Greys, whites, one wood, handleless kitchens and large-format floors. The safest long-term choice, done sharply.',
    vector: { colourTemp: -0.8, materialWarmth: -0.6, ornament: -0.5, storage: 0.7, entertaining: 0.2, naturalLight: 0.3, pattern: -0.5, budget: 0.1 },
    paletteMaterialSlugs: ['paint-cotton-white', 'paint-monsoon-grey', 'laminate-slate-grey', 'veneer-smoked-oak'],
    projectSlugs: ['super-corridor-4bhk-contemporary', 'nipania-compact-2bhk', 'rajendra-nagar-renovation-3bhk'],
    materialSlugs: ['quartz-pure-white', 'acrylic-graphite', 'light-recessed-spot-black'],
  }),
  prof({
    id: 'heritage-heart',
    name: 'The Heritage Heart',
    styleSlug: 'traditional-indian',
    description: 'Teak, stone, brass and a pooja room at the centre of the plan. Tradition done with contemporary precision.',
    vector: { colourTemp: 0.9, materialWarmth: 1, ornament: 0.9, storage: 0.3, entertaining: 0.8, naturalLight: 0.2, pattern: 0.5, budget: 0.2 },
    paletteMaterialSlugs: ['veneer-natural-teak', 'paint-turmeric-light', 'marble-pink-ambaji', 'metal-antique-copper'],
    projectSlugs: ['annapurna-traditional-home', 'ujjain-courtyard-home', 'scheme-54-heritage-bungalow'],
    materialSlugs: ['vitrified-kota-look', 'texture-lime-plaster', 'ceramic-athangudi-pattern'],
  }),
  prof({
    id: 'considered-luxe',
    name: 'The Considered Luxe',
    styleSlug: 'luxury',
    description: 'Natural stone, book-matched veneer, PU gloss and velvet — in restraint. Four materials, perfectly done.',
    vector: { colourTemp: 0.2, materialWarmth: 0.3, ornament: 0.3, storage: 0.8, entertaining: 0.6, naturalLight: 0.4, pattern: -0.2, budget: 1 },
    paletteMaterialSlugs: ['marble-italian-statuario', 'veneer-walnut-burl', 'pu-gloss-ivory', 'metal-brushed-brass'],
    projectSlugs: ['scheme-78-duplex-penthouse', 'palasia-art-deco-apartment', 'bypass-road-garden-villa'],
    materialSlugs: ['fabric-velvet-forest', 'light-linear-magnetic-track', 'san-rain-shower-brass'],
  }),
  prof({
    id: 'light-seeker',
    name: 'The Light Seeker',
    styleSlug: 'scandinavian',
    description: 'Pale wood, white walls, linen and daylight. Warmed slightly for Indore so it never looks washed out.',
    vector: { colourTemp: 0.3, materialWarmth: 0.4, ornament: -0.4, storage: 0.4, entertaining: 0.1, naturalLight: 1, pattern: -0.3, budget: -0.1 },
    paletteMaterialSlugs: ['veneer-white-ash', 'paint-cotton-white', 'laminate-terracotta-matte', 'fabric-linen-oat'],
    projectSlugs: ['silicon-city-row-house', 'tilak-nagar-kids-rooms', 'bengali-square-coastal-3bhk'],
    materialSlugs: ['vinyl-spc-oak-natural', 'handle-leather-loop', 'curtain-sheer-white'],
  }),
  prof({
    id: 'smart-saver',
    name: 'The Smart Saver',
    styleSlug: 'budget-apartment',
    description: 'One good idea per room, in-stock materials, paint as the main design tool. Considered, never cheap.',
    vector: { colourTemp: 0.4, materialWarmth: 0.3, ornament: -0.2, storage: 0.6, entertaining: 0.2, naturalLight: 0.4, pattern: 0, budget: -1 },
    paletteMaterialSlugs: ['paint-ivory-mist', 'laminate-frosty-white', 'laminate-sage-matte', 'granite-tan-brown'],
    projectSlugs: ['rau-first-home-2bhk', 'sudama-nagar-colour-refresh', 'nipania-compact-2bhk'],
    materialSlugs: ['laminate-oak-linear', 'handle-leather-loop', 'light-cove-profile-warm'],
  }),
];

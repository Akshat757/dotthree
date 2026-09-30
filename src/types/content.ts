/**
 * Canonical content contract — SRS §9.
 *
 * Demo Mode reads typed data files matching these shapes. The shapes are written
 * so a Prisma schema can be mechanically derived later for DB Mode.
 *
 * NOTE: Hindi support was dropped from this build. `Localised<T>` is kept as an
 * alias so data files stay forward-compatible if i18n is reintroduced.
 */

export type Locale = 'en';
export type Localised<T> = T;

export type BudgetBand = 'UNDER_3L' | 'L3_7' | 'L7_15' | 'L15_30' | 'ABOVE_30L';
export type Tier = 'ESSENTIAL' | 'STANDARD' | 'PREMIUM' | 'LUXURY';
export type PropertyType =
  | 'APARTMENT'
  | 'VILLA'
  | 'DUPLEX'
  | 'FARMHOUSE'
  | 'OFFICE'
  | 'CLINIC'
  | 'RETAIL'
  | 'RESTAURANT';
export type Segment = 'RESIDENTIAL' | 'COMMERCIAL';
export type Nature = 'NEW' | 'RENOVATION';
export type Bhk = '1BHK' | '2BHK' | '3BHK' | '4BHK+';

export const BUDGET_BANDS: BudgetBand[] = ['UNDER_3L', 'L3_7', 'L7_15', 'L15_30', 'ABOVE_30L'];
export const TIERS: Tier[] = ['ESSENTIAL', 'STANDARD', 'PREMIUM', 'LUXURY'];
export const PROPERTY_TYPES: PropertyType[] = [
  'APARTMENT',
  'VILLA',
  'DUPLEX',
  'FARMHOUSE',
  'OFFICE',
  'CLINIC',
  'RETAIL',
  'RESTAURANT',
];

export interface ImageCredit {
  source: 'unsplash' | 'pexels' | 'ambientcg' | 'polyhaven' | 'original';
  author?: string;
  url?: string;
  licence: 'unsplash' | 'pexels' | 'cc0' | 'owned';
}

export interface ImageRef {
  id: string;
  /** Path under /public, e.g. /demo/projects/xx/01 — the <Img> component appends .avif/.webp + width. */
  src: string;
  width: number;
  height: number;
  blurHash: string;
  alt: Localised<string>;
  caption?: Localised<string>;
  roomType?: string;
  styleBucket?: string;
  credit: ImageCredit; // MANDATORY — see §11.8
  /** Deterministically generated from the "after" image (§11.3 rule 7). */
  synthetic?: boolean;
  phash?: string;
  palette?: string[];
}

export interface FloorPlanRoom {
  id: string;
  label: string;
  areaSqft: number;
  /** SVG-space rectangle for label placement */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BeforeAfterPair {
  id: string;
  before: ImageRef;
  after: ImageRef;
  label?: Localised<string>;
  mode:
    | 'before-after'
    | 'render-vs-built'
    | 'day-vs-night'
    | 'essential-vs-premium'
    | 'layout-old-vs-new';
}

export interface Project {
  slug: string;
  title: Localised<string>;
  city: string;
  locality?: string;
  propertyType: PropertyType;
  bhk?: Bhk;
  carpetAreaSqft?: number;
  segment: Segment;
  nature: Nature;
  styles: string[];
  roomTypes: string[];
  budgetBand: BudgetBand;
  /** Precise demo figure used for sorting and copy, in ₹ */
  budgetInr?: number;
  durationWeeks?: number;
  completedOn?: string; // ISO
  vastuAligned: boolean;
  compactHome?: boolean;
  jointFamily?: boolean;
  featured: boolean;
  orderIndex: number;
  brief: Localised<string>;
  challenge: Localised<string>;
  solution: Localised<string>;
  designerNote?: Localised<string>;
  heroImage: ImageRef;
  images: ImageRef[];
  beforeAfters: BeforeAfterPair[];
  floorPlan?: { svg: string; rooms: FloorPlanRoom[] };
  materialSlugs: string[];
  designerSlugs: string[];
  testimonialId?: string;
  /** Preset for "Get this look" (FR-B-04): surface type → material slug */
  palette?: Partial<Record<SurfaceType, string>>;
  roomTemplateSlug?: string;
  seo?: { title?: string; description?: string };
}

export type MaterialCategory =
  | 'PAINT'
  | 'WALLPAPER'
  | 'WALL_TEXTURE'
  | 'VENEER'
  | 'LAMINATE'
  | 'ACRYLIC'
  | 'PU_FINISH'
  | 'GLASS'
  | 'MARBLE'
  | 'GRANITE'
  | 'QUARTZ'
  | 'CERAMIC_TILE'
  | 'VITRIFIED_TILE'
  | 'WOOD_FLOORING'
  | 'VINYL_FLOORING'
  | 'UPHOLSTERY'
  | 'CURTAIN'
  | 'METAL_FINISH'
  | 'KITCHEN_HARDWARE'
  | 'WARDROBE_HARDWARE'
  | 'LIGHTING'
  | 'SANITARYWARE'
  | 'COUNTERTOP'
  | 'HANDLES';

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  'PAINT',
  'WALLPAPER',
  'WALL_TEXTURE',
  'VENEER',
  'LAMINATE',
  'ACRYLIC',
  'PU_FINISH',
  'GLASS',
  'MARBLE',
  'GRANITE',
  'QUARTZ',
  'CERAMIC_TILE',
  'VITRIFIED_TILE',
  'WOOD_FLOORING',
  'VINYL_FLOORING',
  'UPHOLSTERY',
  'CURTAIN',
  'METAL_FINISH',
  'KITCHEN_HARDWARE',
  'WARDROBE_HARDWARE',
  'LIGHTING',
  'SANITARYWARE',
  'COUNTERTOP',
  'HANDLES',
];

export type Tonality = 'warm' | 'cool' | 'neutral' | 'bold' | 'pastel' | 'earthy' | 'jewel';
export type Finish =
  | 'matte'
  | 'eggshell'
  | 'satin'
  | 'semi-gloss'
  | 'high-gloss'
  | 'textured'
  | 'polished'
  | 'honed'
  | 'brushed'
  | 'natural';

export interface MaterialTexture {
  /** Path under /public/textures/<set>/ without extension; albedo/normal/roughness are file stems */
  albedo: string;
  normal?: string;
  roughness?: string;
  scaleCm: number; // real-world size of one tile of the texture
  credit: ImageCredit;
  /** Procedural fallback generated when the CC0 download is unavailable */
  procedural?: boolean;
}

export interface Material {
  slug: string;
  name: Localised<string>;
  brand?: string;
  productCode?: string;
  category: MaterialCategory;
  subCategory?: string;
  swatch: ImageRef;
  texture?: MaterialTexture;
  hex?: string;
  colorFamily?: string;
  tonality?: Tonality;
  finish?: Finish;
  tier: Tier;
  price?: { min: number; max: number; unit: 'sqft' | 'rft' | 'litre' | 'piece' };
  durability?: 1 | 2 | 3 | 4 | 5;
  maintenance?: 'LOW' | 'MEDIUM' | 'HIGH';
  waterResistant: boolean;
  heatResistant: boolean;
  warranty?: Localised<string>;
  availability?: 'IN_STOCK_INDORE' | 'ON_ORDER' | 'IMPORT';
  usageSurfaces: SurfaceType[];
  usageRooms: string[];
  sustainability?: Localised<string>;
  substituteForSlug?: string; // budget-down chain
  description?: Localised<string>;
  /** Visualiser pattern hint for materials without a PBR texture */
  pattern?: 'plain' | 'geometric' | 'floral' | 'stripe' | 'damask' | 'textured' | 'chevron' | 'herringbone' | 'brick-lay';
}

export type SurfaceType =
  | 'WALL'
  | 'ACCENT_WALL'
  | 'CEILING'
  | 'FLOOR'
  | 'CABINET_UPPER'
  | 'CABINET_LOWER'
  | 'WARDROBE'
  | 'COUNTERTOP'
  | 'BACKSPLASH'
  | 'CURTAIN'
  | 'UPHOLSTERY'
  | 'WALL_PANEL'
  | 'DOOR'
  | 'WINDOW_FRAME'
  | 'BATH_TILE'
  | 'RUG'
  | 'LIGHT_FIXTURE';

export const SURFACE_TYPES: SurfaceType[] = [
  'WALL',
  'ACCENT_WALL',
  'CEILING',
  'FLOOR',
  'CABINET_UPPER',
  'CABINET_LOWER',
  'WARDROBE',
  'COUNTERTOP',
  'BACKSPLASH',
  'CURTAIN',
  'UPHOLSTERY',
  'WALL_PANEL',
  'DOOR',
  'WINDOW_FRAME',
  'BATH_TILE',
  'RUG',
  'LIGHT_FIXTURE',
];

export type Pt = [number, number];

export interface SurfaceMask {
  id: string;
  surfaceType: SurfaceType;
  label: Localised<string>;
  /** 8-bit PNG alpha, same dims as base */
  maskSrc: string;
  /** image-space quad for texture homography: TL, TR, BR, BL */
  perspectiveQuad?: [Pt, Pt, Pt, Pt];
  defaultMaterialSlug?: string;
  orderIndex: number;
}

export interface RoomTemplate {
  slug: string;
  name: Localised<string>;
  roomType: string;
  style?: string;
  baseImage: ImageRef;
  /** normalised 2D azimuth hint (x → right, y → down) */
  lightDirection: [number, number];
  /** Compass direction of the main window, used by the lighting simulator */
  windowDirection?: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  surfaces: SurfaceMask[];
}

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface WeeklyAvailability {
  /** e.g. { mon: ['10:00','11:00',...], sun: [] } — 24h local Asia/Kolkata */
  slots: Record<Weekday, string[]>;
  /** ISO dates blocked (leave, site visits) */
  blockedDates: string[];
}

export interface Designer {
  slug: string;
  name: string;
  role: string;
  photo: ImageRef;
  experienceYears: number;
  specialisations: string[];
  styles: string[];
  cities: string[];
  languages: string[];
  qualifications: string[];
  bio: Localised<string>;
  philosophy?: Localised<string>;
  availability: WeeklyAvailability;
  projectSlugs: string[];
}

export interface Testimonial {
  id: string;
  projectSlug?: string;
  clientName: string;
  locality?: string;
  projectType?: string;
  budgetBand?: BudgetBand;
  timelineWeeks?: number;
  designerSlug?: string;
  challenge?: Localised<string>;
  quote: Localised<string>;
  rating: 1 | 2 | 3 | 4 | 5;
  photo?: ImageRef;
  videoUrl?: string;
  featured: boolean;
  date?: string;
}

export interface PriceBook {
  version: string; // "2026.09"
  city: string;
  effectiveFrom: string;
  currency: 'INR';
  rates: {
    fullHomePerSqft: Record<Tier, number>;
    kitchenPerRft: Record<Tier, number>;
    wardrobeOpenPerRft: Record<Tier, number>;
    wardrobeSlidePerRft: Record<Tier, number>;
    falseCeilingPerSqft: Record<Tier, number>;
    paintingPerSqft: Record<Tier, number>;
    items: Record<string, Record<Tier, number>>;
    designFeePct: Record<Tier, number>;
    executionPct: Record<Tier, number>;
    gstPct: number;
    /** key: '1BHK' | '2BHK' | '3BHK' | '4BHK+' | 'COMMERCIAL' → [minWeeks, maxWeeks] */
    timelineWeeks: Record<string, [number, number]>;
    renovationUplift: number;
    localityMultiplier: Record<string, number>;
    /** Per-room share of the full-home rate, used for room-wise breakdown */
    roomWeights: Record<string, number>;
    /** Range spread applied around the computed midpoint */
    rangeSpread: { low: number; high: number };
    emiAnnualRatePct: number;
  };
  /** Delta pricing for optional upgrades, keyed by upgrade id */
  upgrades: { id: string; label: string; description: string; delta: Record<Tier, number> }[];
  exclusions: string[];
}

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  heroImage: ImageRef;
  inclusions: string[];
  process: { step: string; detail: string }[];
  costBand: { min: number; max: number; unit: string; note: string };
  timelineWeeks: [number, number];
  projectSlugs: string[];
  materialSlugs: string[];
  faqs: { q: string; a: string }[];
  icon: string; // lucide icon name
}

export interface StyleGuide {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: ImageRef;
  characteristics: string[];
  /** Shade slugs or material slugs forming the signature palette */
  paletteMaterialSlugs: string[];
  typicalMaterialSlugs: string[];
  budgetBand: BudgetBand;
  bestRooms: string[];
  projectSlugs: string[];
  styleBucket: string;
}

export interface RoomGuide {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: ImageRef;
  considerations: string[];
  typicalDimensions: string;
  storageStrategies: string[];
  materialSlugs: string[];
  costBand: { min: number; max: number };
  commonMistakes: string[];
  projectSlugs: string[];
  roomType: string;
  /** Estimator scope preset — room ids to pre-check */
  estimatorScope: string[];
}

export interface Locality {
  slug: string;
  name: string;
  city: string;
  kind: 'locality' | 'city';
  lat: number;
  lng: number;
  distanceKm: number;
  pincodes: string[];
  propertyTypes: string[];
  description: string;
  considerations: string[];
  multiplier: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  /** Which dimension of the profile vector this question measures */
  dimension: QuizDimension;
  options: { id: string; image: ImageRef; label: string; vector: Partial<Record<QuizDimension, number>> }[];
}

export type QuizDimension =
  | 'colourTemp'
  | 'materialWarmth'
  | 'ornament'
  | 'storage'
  | 'entertaining'
  | 'naturalLight'
  | 'pattern'
  | 'budget';

export interface QuizProfile {
  id: string;
  name: string;
  description: string;
  vector: Record<QuizDimension, number>;
  paletteMaterialSlugs: string[];
  projectSlugs: string[];
  materialSlugs: string[];
  styleSlug: string;
  heroImage: ImageRef;
}

export interface VastuRule {
  id: string;
  topic: string;
  preferred: string[];
  acceptable?: string[];
  avoid?: string[];
  note: string;
  /** Directional colours keyed by direction */
  colours?: Record<string, string>;
}

export interface Shade {
  code: string; // AG-1042
  slug: string;
  name: string;
  hex: string;
  oklch: { l: number; c: number; h: number };
  family: string;
  tonality: Tonality;
  lrv: number;
  rooms: string[];
  tier: Tier;
}

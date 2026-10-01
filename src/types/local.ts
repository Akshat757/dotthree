/**
 * Local (browser) state — the shapes persisted to IndexedDB (SRS §9).
 */
import type { BudgetBand, Bhk, Nature, PropertyType, Pt, SurfaceType, Tier } from './content';

export type Finish = 'matte' | 'eggshell' | 'satin' | 'semi-gloss' | 'high-gloss' | 'textured';
export type TileLayout = 'straight' | 'staggered' | 'herringbone' | 'basketweave' | 'diagonal';
export type PatternKind =
  | 'plain'
  | 'geometric'
  | 'floral'
  | 'stripe'
  | 'damask'
  | 'textured'
  | 'chevron'
  | 'herringbone'
  | 'brick-lay';

/** What is applied to a single surface in a variant. */
export interface SurfaceAssignment {
  surfaceId: string;
  surfaceType: SurfaceType;
  /** Either a catalogue material or a raw paint colour. */
  materialSlug?: string;
  shadeCode?: string;
  hex?: string;
  finish: Finish;
  pattern: PatternKind;
  patternScale: number; // 0.25–4
  patternRotation: number; // 0–360
  textureIntensity: number; // 0–1
  tileLayout: TileLayout;
  groutHex?: string;
  groutWidth: number; // 0–1 (relative)
  opacity: number; // 0–1
  visible: boolean;
  /** Overrides template quad when the user adjusts handles */
  quad?: [Pt, Pt, Pt, Pt];
  /** RLE mask override for user-authored regions; templates use maskSrc */
  maskRle?: string;
  label?: string;
}

export type DaylightPreset = 'morning' | 'midday' | 'afternoon' | 'golden' | 'evening' | 'night';
export type ArtificialKind =
  'warm2700' | 'neutral4000' | 'cool6500' | 'cove' | 'pendant' | 'spot' | 'ambient';
export type WindowDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface ArtificialLight {
  id: string;
  kind: ArtificialKind;
  intensity: number; // 0–1
  position: Pt; // normalised image coords
  enabled: boolean;
}

export interface LightingConfig {
  daylight: DaylightPreset;
  windowDirection: WindowDirection;
  artificial: ArtificialLight[];
}

export interface Annotation {
  id: string;
  surfaceId?: string;
  at: Pt; // normalised image coords
  text: string;
  createdAt: number;
}

export interface DesignVariant {
  id: string;
  designId: string;
  name: string;
  colour: string; // chip colour for the UI
  favourite: boolean;
  assignments: SurfaceAssignment[];
  lighting: LightingConfig;
  annotations: Annotation[];
  createdAt: number;
  updatedAt: number;
  /** Cached thumbnail data URL */
  thumb?: string;
}

export interface Design {
  id: string;
  name: string;
  /** Demo room template slug, or undefined when the base is a user upload */
  templateSlug?: string;
  /** Upload id in the 'uploads' store */
  uploadId?: string;
  width: number;
  height: number;
  /** User-authored surfaces for uploads (templates carry their own) */
  customSurfaces?: {
    id: string;
    surfaceType: SurfaceType;
    label: string;
    maskRle: string;
    quad?: [Pt, Pt, Pt, Pt];
  }[];
  variantIds: string[];
  activeVariantId: string;
  createdAt: number;
  updatedAt: number;
  /** Design was seeded from a project's palette (FR-B-04) */
  presetProjectSlug?: string;
}

export interface UploadRecord {
  id: string;
  blob: Blob;
  width: number;
  height: number;
  createdAt: number;
  lastUsedAt: number;
}

export type MoodItemKind = 'image' | 'swatch' | 'material' | 'text' | 'render' | 'shape';

export interface MoodItem {
  id: string;
  kind: MoodItemKind;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  z: number;
  opacity: number;
  radius: number;
  shadow: boolean;
  border?: string;
  /** image: ImageRef id or upload id; swatch: hex; material: slug; text: content; render: variant id; shape: 'rect'|'line'|'circle' */
  ref: string;
  text?: string;
  fill?: string;
  fontSize?: number;
  /** Background removed via U²-Net — cached PNG data URL */
  cutoutDataUrl?: string;
}

export interface MoodBoardVersion {
  at: number;
  items: MoodItem[];
}

export interface MoodBoard {
  id: string;
  name: string;
  template: 'grid' | 'editorial' | 'palette' | 'room-by-room' | 'single-hero' | 'blank';
  width: number;
  height: number;
  background: string;
  items: MoodItem[];
  versions: MoodBoardVersion[];
  createdAt: number;
  updatedAt: number;
}

export interface EstimateInput {
  city: string;
  locality: string;
  propertyType: PropertyType;
  nature: Nature;
  possessionDate?: string;
  bhk: Bhk;
  carpetAreaSqft: number;
  bathrooms: number;
  balconies: number;
  fullHome: boolean;
  rooms: string[];
  kitchen?: {
    layout: 'L' | 'U' | 'PARALLEL' | 'STRAIGHT' | 'ISLAND';
    runningFeet: number;
    shutter: string;
    countertop: string;
    chimneyHob: boolean;
    tallUnit: boolean;
  };
  wardrobes: {
    bedroom: string;
    runningFeet: number;
    type: 'OPENABLE' | 'SLIDING';
    finish: string;
    loft: boolean;
  }[];
  extras: {
    falseCeilingSqft: number;
    tvUnit: boolean;
    crockeryUnit: boolean;
    poojaUnit: boolean;
    studyTable: number;
    beds: number;
    sofa: boolean;
    dining: boolean;
    painting: boolean;
    electrical: boolean;
    plumbing: boolean;
    civil: boolean;
  };
  tier: Tier;
  style?: string;
  vastu: 'STRICT' | 'BASIC' | 'NONE';
  entranceFacing?: WindowDirection;
  contact?: {
    name: string;
    phone: string;
    email?: string;
    preferred: 'WHATSAPP' | 'CALL' | 'EMAIL';
  };
  /** Materials chosen in the visualiser, used to pre-fill */
  visualiserMaterialSlugs?: string[];
}

export interface EstimateLine {
  id: string;
  label: string;
  category: EstimateCategory;
  room?: string;
  low: number;
  high: number;
  qty?: number;
  unit?: string;
}

export type EstimateCategory =
  | 'MODULAR'
  | 'LOOSE_FURNITURE'
  | 'FALSE_CEILING'
  | 'PAINTING'
  | 'ELECTRICAL'
  | 'CIVIL'
  | 'DECOR'
  | 'DESIGN_FEE'
  | 'EXECUTION';

export interface EstimateResult {
  priceBookVersion: string;
  tier: Tier;
  lines: EstimateLine[];
  subtotal: { low: number; high: number };
  gst: { low: number; high: number };
  total: { low: number; high: number };
  byRoom: { room: string; low: number; high: number }[];
  byCategory: { category: EstimateCategory; low: number; high: number }[];
  timelineWeeks: [number, number];
  emi: { months: number; low: number; high: number }[];
  upgrades: { id: string; label: string; description: string; delta: number }[];
  exclusions: string[];
  localityMultiplier: number;
}

export interface SavedEstimate {
  id: string;
  name: string;
  input: EstimateInput;
  result: EstimateResult;
  priceBookVersion: string;
  createdAt: number;
  designId?: string;
}

export type ConsultationType =
  'VIDEO' | 'PHONE' | 'STUDIO_VISIT' | 'HOME_VISIT' | 'SITE_MEASUREMENT' | 'MATERIAL_SELECTION';

export interface Enquiry {
  reference: string; // IND-YYMM-####
  createdAt: number;
  type: ConsultationType;
  name: string;
  phone: string;
  email?: string;
  city: string;
  locality?: string;
  pincode?: string;
  propertyType?: PropertyType;
  bhk?: Bhk;
  carpetAreaSqft?: number;
  nature?: Nature;
  budgetBand?: BudgetBand;
  possessionDate?: string;
  preferredSlot?: { date: string; time: string };
  alternateSlots?: { date: string; time: string }[];
  preferredContact: 'WHATSAPP' | 'CALL' | 'EMAIL';
  designerSlug?: string;
  notes?: string;
  vastu: 'STRICT' | 'BASIC' | 'NONE';
  consent: boolean;
  /** Attachments by local ID — transcribed in full into the message body */
  attachedDesignIds?: string[];
  attachedEstimateIds?: string[];
  attachedMoodBoardIds?: string[];
  attachedUploadIds?: string[];
  combineInstruction?: string;
  /** Human-readable full transcription generated at submit time */
  summaryText: string;
  status: 'SUBMITTED' | 'WHATSAPP_OPENED' | 'EMAIL_OPENED';
  source?: string;
}

export interface Profile {
  guestKey: string;
  name?: string;
  phone?: string;
  email?: string;
  locale: 'en';
  prefs: {
    largeText: boolean;
    highContrast: boolean;
    reducedMotion: 'system' | 'on' | 'off';
    vastu?: 'STRICT' | 'BASIC' | 'NONE';
  };
  role: 'CLIENT' | 'DESIGNER' | 'ADMIN';
  createdAt: number;
}

export type VoteKind = 'up' | 'love' | 'down';

export interface Feedback {
  id: string; // uuid — idempotency key
  designId: string;
  voterName: string;
  createdAt: number;
  votes: { variantId: string; vote: VoteKind }[];
  comments: { id: string; variantId: string; at?: Pt; text: string }[];
}

export interface Favourite {
  key: string; // `${type}:${slug}`
  type: 'project' | 'material' | 'style' | 'shade';
  slug: string;
  createdAt: number;
}

export interface ApprovalResponse {
  id: string;
  approvalId: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  comment?: string;
  pins: { id: string; at: Pt; text: string }[];
  by: string;
  at: number;
}

export interface MetaRecord {
  key: string;
  value: unknown;
}

export interface ExportBundle {
  schemaVersion: 1;
  exportedAt: number;
  app: 'atelier';
  profile: Profile | null;
  designs: Design[];
  variants: DesignVariant[];
  moodboards: MoodBoard[];
  estimates: SavedEstimate[];
  enquiries: Enquiry[];
  favourites: Favourite[];
  feedback: Feedback[];
  approvals: ApprovalResponse[];
  /** Uploads as base64 data URLs (optional — can be large) */
  uploads?: { id: string; dataUrl: string; width: number; height: number; createdAt: number }[];
}

export interface ImportReport {
  ok: boolean;
  counts: Record<string, number>;
  errors: string[];
}

export interface SharedDesign {
  v: 1;
  templateSlug: string;
  designId: string;
  designName: string;
  senderName?: string;
  variants: {
    id: string;
    name: string;
    colour: string;
    assignments: SurfaceAssignment[];
    lighting: LightingConfig;
    annotations: Annotation[];
  }[];
}

export interface SharedMoodBoard {
  v: 1;
  board: Omit<MoodBoard, 'versions'>;
}

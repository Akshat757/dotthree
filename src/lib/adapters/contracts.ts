/**
 * Adapter contracts — SRS §10.
 *
 * There are NO HTTP endpoints in Demo Mode. Every feature codes against these
 * interfaces; concrete implementations live in ./impl and are resolved by
 * ./index.ts based on src/config/runtime.ts. Components must never import impl.
 */
import type {
  Designer,
  Material,
  MaterialCategory,
  PriceBook,
  Project,
  RoomTemplate,
  Testimonial,
  Tier,
} from '@/types/content';
import type {
  ApprovalResponse,
  Design,
  DesignVariant,
  Enquiry,
  Favourite,
  Feedback,
  ImportReport,
  MoodBoard,
  Profile,
  SavedEstimate,
  SharedDesign,
  SharedMoodBoard,
  UploadRecord,
} from '@/types/local';

export interface ProjectFilter {
  locality?: string[];
  city?: string[];
  propertyType?: string[];
  bhk?: string[];
  areaBand?: string[];
  roomType?: string[];
  style?: string[];
  budgetBand?: string[];
  nature?: string[];
  segment?: string[];
  special?: string[];
  featured?: boolean;
}

export interface MaterialFilter {
  category?: MaterialCategory[];
  colorFamily?: string[];
  finish?: string[];
  tier?: Tier[];
  room?: string[];
  surface?: string[];
  brand?: string[];
  maintenance?: string[];
  availability?: string[];
  tonality?: string[];
  maxPricePerUnit?: number;
}

export type SearchScope = 'projects' | 'materials' | 'journal' | 'styles' | 'services' | 'rooms';

export interface SearchHit {
  scope: SearchScope;
  slug: string;
  title: string;
  subtitle?: string;
  href: string;
  score: number;
  image?: string;
}

export interface ContentRepo {
  getProjects(filter?: ProjectFilter): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;
  getMaterials(filter?: MaterialFilter): Promise<Material[]>;
  getMaterial(slug: string): Promise<Material | null>;
  getRoomTemplates(): Promise<RoomTemplate[]>;
  getRoomTemplate(slug: string): Promise<RoomTemplate | null>;
  getDesigners(): Promise<Designer[]>;
  getDesigner(slug: string): Promise<Designer | null>;
  getTestimonials(): Promise<Testimonial[]>;
  getPriceBook(version?: string): Promise<PriceBook>;
  search(query: string, scopes?: SearchScope[]): Promise<SearchHit[]>;
}

export interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
  uploadsBytes: number;
  persistent: boolean;
}

export interface UserStore {
  readonly persistent: boolean;
  getProfile(): Promise<Profile>;
  setProfile(p: Partial<Profile>): Promise<Profile>;

  listDesigns(): Promise<Design[]>;
  getDesign(id: string): Promise<Design | null>;
  saveDesign(d: Design): Promise<void>;
  deleteDesign(id: string): Promise<void>;

  listVariants(designId: string): Promise<DesignVariant[]>;
  getVariant(id: string): Promise<DesignVariant | null>;
  saveVariant(v: DesignVariant): Promise<void>;
  deleteVariant(id: string): Promise<void>;

  listMoodBoards(): Promise<MoodBoard[]>;
  getMoodBoard(id: string): Promise<MoodBoard | null>;
  saveMoodBoard(b: MoodBoard): Promise<void>;
  deleteMoodBoard(id: string): Promise<void>;

  listEstimates(): Promise<SavedEstimate[]>;
  getEstimate(id: string): Promise<SavedEstimate | null>;
  saveEstimate(e: SavedEstimate): Promise<void>;
  deleteEstimate(id: string): Promise<void>;

  listEnquiries(): Promise<Enquiry[]>;
  getEnquiry(reference: string): Promise<Enquiry | null>;
  saveEnquiry(e: Enquiry): Promise<void>;

  listFavourites(): Promise<Favourite[]>;
  toggleFavourite(type: Favourite['type'], slug: string): Promise<boolean>;
  isFavourite(type: Favourite['type'], slug: string): Promise<boolean>;

  listFeedback(designId: string): Promise<Feedback[]>;
  mergeFeedback(f: Feedback): Promise<{ merged: boolean }>;

  listApprovals(): Promise<ApprovalResponse[]>;
  saveApproval(a: ApprovalResponse): Promise<void>;

  putUpload(blob: Blob, dims: { width: number; height: number }): Promise<string>;
  getUpload(id: string): Promise<UploadRecord | null>;
  listUploads(): Promise<Omit<UploadRecord, 'blob'>[]>;
  deleteUpload(id: string): Promise<void>;
  clearOldUploads(keepNewest: number): Promise<number>;

  getMeta<T = unknown>(key: string): Promise<T | undefined>;
  setMeta(key: string, value: unknown): Promise<void>;

  exportAll(opts?: { includeUploads?: boolean }): Promise<Blob>;
  importAll(file: File | Blob): Promise<ImportReport>;
  deleteAll(): Promise<void>;
  storageUsage(): Promise<StorageUsage>;
}

export interface LeadResult {
  reference: string;
  /** Deep links the UI offers, in order */
  whatsappUrl: string;
  mailtoUrl: string;
  /** Which optional sinks fired successfully (for the dev audit only) */
  sinks: { name: string; ok: boolean; detail?: string }[];
}

export interface LeadSink {
  readonly name: string;
  submit(enquiry: Enquiry): Promise<LeadResult | Partial<LeadResult>>;
}

export interface CalendarLinks {
  icsBlob: Blob;
  icsFilename: string;
  googleCalendarUrl: string;
}

export interface Notifier {
  confirm(enquiry: Enquiry): Promise<CalendarLinks | null>;
  remind(enquiry: Enquiry): Promise<boolean>;
}

export interface ShareAdapter {
  encode(design: Design, variants: DesignVariant[], senderName?: string): string;
  decode(fragment: string): SharedDesign | null;
  encodeFeedback(f: Feedback): string;
  decodeFeedback(s: string): Feedback | null;
  encodeMoodBoard(b: MoodBoard): string;
  decodeMoodBoard(s: string): SharedMoodBoard | null;
  shareUrl(kind: 'd' | 'b', payload: string): string;
}

export interface Analytics {
  track(event: string, props?: Record<string, unknown>): void;
  pageview(path: string): void;
}

export interface FormState {
  honeypot: string;
  startedAt: number;
  submittedAt: number;
  turnstileToken?: string;
}

export interface BotGuard {
  verify(formState: FormState): Promise<{ ok: boolean; reason?: string }>;
}

export interface Adapters {
  content: ContentRepo;
  user: UserStore;
  leads: LeadSink;
  notifier: Notifier;
  share: ShareAdapter;
  analytics: Analytics;
  botGuard: BotGuard;
}

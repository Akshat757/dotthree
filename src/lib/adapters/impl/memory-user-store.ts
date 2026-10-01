/**
 * MemoryUserStore — fallback when IndexedDB is unavailable (private mode).
 * Honest: nothing persists past the tab. The UI shows a warning when `persistent` is false.
 */
import type { StorageUsage, UserStore } from '@/lib/adapters/contracts';
import { exportBundleSchema, hasDangerousKeys } from '@/lib/schemas/local';
import { uid } from '@/lib/utils';
import type {
  ApprovalResponse,
  Design,
  DesignVariant,
  Enquiry,
  ExportBundle,
  Favourite,
  Feedback,
  MoodBoard,
  Profile,
  SavedEstimate,
  UploadRecord,
  ImportReport,
} from '@/types/local';

export class MemoryUserStore implements UserStore {
  readonly persistent = false;
  private profile: Profile = {
    guestKey: uid('g'),
    locale: 'en',
    prefs: { largeText: false, highContrast: false, reducedMotion: 'system' },
    role: 'CLIENT',
    createdAt: Date.now(),
  };
  private designs = new Map<string, Design>();
  private variants = new Map<string, DesignVariant>();
  private boards = new Map<string, MoodBoard>();
  private estimates = new Map<string, SavedEstimate>();
  private enquiries = new Map<string, Enquiry>();
  private favourites = new Map<string, Favourite>();
  private feedback = new Map<string, Feedback>();
  private approvals = new Map<string, ApprovalResponse>();
  private uploads = new Map<string, UploadRecord>();
  private meta = new Map<string, unknown>();

  async getProfile() {
    return this.profile;
  }
  async setProfile(p: Partial<Profile>) {
    this.profile = {
      ...this.profile,
      ...p,
      guestKey: this.profile.guestKey,
      prefs: { ...this.profile.prefs, ...(p.prefs ?? {}) },
    };
    return this.profile;
  }
  async listDesigns() {
    return [...this.designs.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async getDesign(id: string) {
    return this.designs.get(id) ?? null;
  }
  async saveDesign(d: Design) {
    this.designs.set(d.id, d);
  }
  async deleteDesign(id: string) {
    this.designs.delete(id);
    for (const [k, v] of this.variants) if (v.designId === id) this.variants.delete(k);
    for (const [k, v] of this.feedback) if (v.designId === id) this.feedback.delete(k);
  }
  async listVariants(designId: string) {
    return [...this.variants.values()]
      .filter((v) => v.designId === designId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }
  async getVariant(id: string) {
    return this.variants.get(id) ?? null;
  }
  async saveVariant(v: DesignVariant) {
    this.variants.set(v.id, v);
  }
  async deleteVariant(id: string) {
    this.variants.delete(id);
  }
  async listMoodBoards() {
    return [...this.boards.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async getMoodBoard(id: string) {
    return this.boards.get(id) ?? null;
  }
  async saveMoodBoard(b: MoodBoard) {
    this.boards.set(b.id, b);
  }
  async deleteMoodBoard(id: string) {
    this.boards.delete(id);
  }
  async listEstimates() {
    return [...this.estimates.values()].sort((a, b) => b.createdAt - a.createdAt);
  }
  async getEstimate(id: string) {
    return this.estimates.get(id) ?? null;
  }
  async saveEstimate(e: SavedEstimate) {
    this.estimates.set(e.id, e);
  }
  async deleteEstimate(id: string) {
    this.estimates.delete(id);
  }
  async listEnquiries() {
    return [...this.enquiries.values()].sort((a, b) => b.createdAt - a.createdAt);
  }
  async getEnquiry(ref: string) {
    return this.enquiries.get(ref) ?? null;
  }
  async saveEnquiry(e: Enquiry) {
    this.enquiries.set(e.reference, e);
  }
  async listFavourites() {
    return [...this.favourites.values()];
  }
  async toggleFavourite(type: Favourite['type'], slug: string) {
    const key = `${type}:${slug}`;
    if (this.favourites.has(key)) {
      this.favourites.delete(key);
      return false;
    }
    this.favourites.set(key, { key, type, slug, createdAt: Date.now() });
    return true;
  }
  async isFavourite(type: Favourite['type'], slug: string) {
    return this.favourites.has(`${type}:${slug}`);
  }
  async listFeedback(designId: string) {
    return [...this.feedback.values()].filter((f) => f.designId === designId);
  }
  async mergeFeedback(f: Feedback) {
    if (this.feedback.has(f.id)) return { merged: false };
    this.feedback.set(f.id, f);
    return { merged: true };
  }
  async listApprovals() {
    return [...this.approvals.values()];
  }
  async saveApproval(a: ApprovalResponse) {
    this.approvals.set(a.id, a);
  }
  async putUpload(blob: Blob, dims: { width: number; height: number }) {
    const id = uid('up');
    this.uploads.set(id, { id, blob, ...dims, createdAt: Date.now(), lastUsedAt: Date.now() });
    return id;
  }
  async getUpload(id: string) {
    return this.uploads.get(id) ?? null;
  }
  async listUploads() {
    return [...this.uploads.values()].map(({ blob: _b, ...r }) => r);
  }
  async deleteUpload(id: string) {
    this.uploads.delete(id);
  }
  async clearOldUploads(keep: number) {
    const all = [...this.uploads.values()].sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    const del = all.slice(keep);
    del.forEach((u) => this.uploads.delete(u.id));
    return del.length;
  }
  async getMeta<T>(key: string) {
    return this.meta.get(key) as T | undefined;
  }
  async setMeta(key: string, value: unknown) {
    this.meta.set(key, value);
  }
  async exportAll(): Promise<Blob> {
    const bundle: ExportBundle = {
      schemaVersion: 1,
      exportedAt: Date.now(),
      app: 'atelier',
      profile: this.profile,
      designs: [...this.designs.values()],
      variants: [...this.variants.values()],
      moodboards: [...this.boards.values()],
      estimates: [...this.estimates.values()],
      enquiries: [...this.enquiries.values()],
      favourites: [...this.favourites.values()],
      feedback: [...this.feedback.values()],
      approvals: [...this.approvals.values()],
    };
    return new Blob([JSON.stringify(bundle)], { type: 'application/json' });
  }
  async importAll(file: File | Blob): Promise<ImportReport> {
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      return { ok: false, counts: {}, errors: ['File is not valid JSON.'] };
    }
    if (hasDangerousKeys(raw))
      return { ok: false, counts: {}, errors: ['File contains disallowed keys.'] };
    const parsed = exportBundleSchema.safeParse(raw);
    if (!parsed.success)
      return { ok: false, counts: {}, errors: ['File does not match the expected format.'] };
    const b = parsed.data;
    b.designs.forEach((d) => this.designs.set(d.id, d));
    b.variants.forEach((v) => this.variants.set(v.id, v));
    b.moodboards.forEach((m) => this.boards.set(m.id, m));
    b.estimates.forEach((e) => this.estimates.set(e.id, e as unknown as SavedEstimate));
    b.enquiries.forEach((e) => this.enquiries.set(e.reference, e as Enquiry));
    b.favourites.forEach((f) => this.favourites.set(f.key, f));
    b.feedback.forEach((f) => this.feedback.set(f.id, f));
    b.approvals.forEach((a) => this.approvals.set(a.id, a));
    return {
      ok: true,
      counts: {
        designs: b.designs.length,
        variants: b.variants.length,
        moodboards: b.moodboards.length,
        estimates: b.estimates.length,
        enquiries: b.enquiries.length,
      },
      errors: [],
    };
  }
  async deleteAll() {
    this.designs.clear();
    this.variants.clear();
    this.boards.clear();
    this.estimates.clear();
    this.enquiries.clear();
    this.favourites.clear();
    this.feedback.clear();
    this.approvals.clear();
    this.uploads.clear();
    this.meta.clear();
  }
  async storageUsage(): Promise<StorageUsage> {
    const uploadsBytes = [...this.uploads.values()].reduce((n, u) => n + u.blob.size, 0);
    return { usedBytes: uploadsBytes, quotaBytes: 0, uploadsBytes, persistent: false };
  }
}

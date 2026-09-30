/**
 * IndexedDbUserStore — the free default UserStore (SRS §10).
 * All user data lives on the device. Falls back to an in-memory store when
 * IndexedDB is unavailable (private mode on some browsers) with an honest warning.
 */
import type { IDBPDatabase } from 'idb';

import type { StorageUsage, UserStore } from '@/lib/adapters/contracts';
import { getDb, isIndexedDbAvailable, isQuotaError, StorageQuotaError, deleteDatabase } from '@/lib/db/client';
import { UPLOADS_CAP_BYTES, type AtelierDB } from '@/lib/db/schema';
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

const PROFILE_KEY_META = 'guestKey';

function defaultProfile(guestKey: string): Profile {
  return {
    guestKey,
    locale: 'en',
    prefs: { largeText: false, highContrast: false, reducedMotion: 'system' },
    role: 'CLIENT',
    createdAt: Date.now(),
  };
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export class IndexedDbUserStore implements UserStore {
  readonly persistent = true;

  private async db(): Promise<IDBPDatabase<AtelierDB>> {
    return getDb();
  }

  private async guard<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (isQuotaError(e)) throw new StorageQuotaError();
      throw e;
    }
  }

  // ---- profile -------------------------------------------------------------
  async getProfile(): Promise<Profile> {
    const db = await this.db();
    let key = (await db.get('meta', PROFILE_KEY_META))?.value as string | undefined;
    if (!key) {
      key = uid('g');
      await db.put('meta', { key: PROFILE_KEY_META, value: key });
    }
    const existing = await db.get('profile', key);
    if (existing) return existing;
    const p = defaultProfile(key);
    await db.put('profile', p);
    return p;
  }

  async setProfile(patch: Partial<Profile>): Promise<Profile> {
    const db = await this.db();
    const current = await this.getProfile();
    const next: Profile = {
      ...current,
      ...patch,
      guestKey: current.guestKey,
      prefs: { ...current.prefs, ...(patch.prefs ?? {}) },
    };
    await this.guard(() => db.put('profile', next));
    return next;
  }

  // ---- designs -------------------------------------------------------------
  async listDesigns(): Promise<Design[]> {
    const db = await this.db();
    const all = await db.getAllFromIndex('designs', 'updatedAt');
    return all.reverse();
  }
  async getDesign(id: string): Promise<Design | null> {
    return (await (await this.db()).get('designs', id)) ?? null;
  }
  async saveDesign(d: Design): Promise<void> {
    const db = await this.db();
    await this.guard(() => db.put('designs', d));
  }
  async deleteDesign(id: string): Promise<void> {
    const db = await this.db();
    const tx = db.transaction(['designs', 'variants', 'feedback'], 'readwrite');
    await tx.objectStore('designs').delete(id);
    const vIdx = tx.objectStore('variants').index('designId');
    for (const k of await vIdx.getAllKeys(id)) await tx.objectStore('variants').delete(k);
    const fIdx = tx.objectStore('feedback').index('designId');
    for (const k of await fIdx.getAllKeys(id)) await tx.objectStore('feedback').delete(k);
    await tx.done;
  }

  // ---- variants ------------------------------------------------------------
  async listVariants(designId: string): Promise<DesignVariant[]> {
    const db = await this.db();
    const v = await db.getAllFromIndex('variants', 'designId', designId);
    return v.sort((a, b) => a.createdAt - b.createdAt);
  }
  async getVariant(id: string): Promise<DesignVariant | null> {
    return (await (await this.db()).get('variants', id)) ?? null;
  }
  async saveVariant(v: DesignVariant): Promise<void> {
    const db = await this.db();
    await this.guard(() => db.put('variants', v));
  }
  async deleteVariant(id: string): Promise<void> {
    await (await this.db()).delete('variants', id);
  }

  // ---- mood boards ---------------------------------------------------------
  async listMoodBoards(): Promise<MoodBoard[]> {
    const db = await this.db();
    return (await db.getAllFromIndex('moodboards', 'updatedAt')).reverse();
  }
  async getMoodBoard(id: string): Promise<MoodBoard | null> {
    return (await (await this.db()).get('moodboards', id)) ?? null;
  }
  async saveMoodBoard(b: MoodBoard): Promise<void> {
    const db = await this.db();
    await this.guard(() => db.put('moodboards', b));
  }
  async deleteMoodBoard(id: string): Promise<void> {
    await (await this.db()).delete('moodboards', id);
  }

  // ---- estimates -----------------------------------------------------------
  async listEstimates(): Promise<SavedEstimate[]> {
    const db = await this.db();
    return (await db.getAllFromIndex('estimates', 'createdAt')).reverse();
  }
  async getEstimate(id: string): Promise<SavedEstimate | null> {
    return (await (await this.db()).get('estimates', id)) ?? null;
  }
  async saveEstimate(e: SavedEstimate): Promise<void> {
    const db = await this.db();
    await this.guard(() => db.put('estimates', e));
  }
  async deleteEstimate(id: string): Promise<void> {
    await (await this.db()).delete('estimates', id);
  }

  // ---- enquiries -----------------------------------------------------------
  async listEnquiries(): Promise<Enquiry[]> {
    const db = await this.db();
    return (await db.getAllFromIndex('enquiries', 'createdAt')).reverse();
  }
  async getEnquiry(reference: string): Promise<Enquiry | null> {
    return (await (await this.db()).get('enquiries', reference)) ?? null;
  }
  async saveEnquiry(e: Enquiry): Promise<void> {
    const db = await this.db();
    await this.guard(() => db.put('enquiries', e));
  }

  // ---- favourites ----------------------------------------------------------
  async listFavourites(): Promise<Favourite[]> {
    return (await this.db()).getAll('favourites');
  }
  async toggleFavourite(type: Favourite['type'], slug: string): Promise<boolean> {
    const db = await this.db();
    const key = `${type}:${slug}`;
    const existing = await db.get('favourites', key);
    if (existing) {
      await db.delete('favourites', key);
      return false;
    }
    await this.guard(() => db.put('favourites', { key, type, slug, createdAt: Date.now() }));
    return true;
  }
  async isFavourite(type: Favourite['type'], slug: string): Promise<boolean> {
    return !!(await (await this.db()).get('favourites', `${type}:${slug}`));
  }

  // ---- feedback (idempotent merge) -----------------------------------------
  async listFeedback(designId: string): Promise<Feedback[]> {
    return (await this.db()).getAllFromIndex('feedback', 'designId', designId);
  }
  async mergeFeedback(f: Feedback): Promise<{ merged: boolean }> {
    const db = await this.db();
    if (await db.get('feedback', f.id)) return { merged: false };
    await this.guard(() => db.put('feedback', f));
    return { merged: true };
  }

  // ---- approvals -----------------------------------------------------------
  async listApprovals(): Promise<ApprovalResponse[]> {
    return (await this.db()).getAll('approvals');
  }
  async saveApproval(a: ApprovalResponse): Promise<void> {
    const db = await this.db();
    await this.guard(() => db.put('approvals', a));
  }

  // ---- uploads -------------------------------------------------------------
  async putUpload(blob: Blob, dims: { width: number; height: number }): Promise<string> {
    const db = await this.db();
    const usage = await this.uploadsBytes();
    if (usage + blob.size > UPLOADS_CAP_BYTES) {
      // Evict LRU until it fits.
      const all = await db.getAllFromIndex('uploads', 'lastUsedAt');
      let freed = 0;
      for (const rec of all) {
        if (usage - freed + blob.size <= UPLOADS_CAP_BYTES) break;
        await db.delete('uploads', rec.id);
        freed += rec.blob.size;
      }
    }
    const id = uid('up');
    const rec: UploadRecord = {
      id,
      blob,
      width: dims.width,
      height: dims.height,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    };
    await this.guard(() => db.put('uploads', rec));
    return id;
  }
  async getUpload(id: string): Promise<UploadRecord | null> {
    const db = await this.db();
    const rec = await db.get('uploads', id);
    if (!rec) return null;
    await db.put('uploads', { ...rec, lastUsedAt: Date.now() }).catch(() => {});
    return rec;
  }
  async listUploads(): Promise<Omit<UploadRecord, 'blob'>[]> {
    const db = await this.db();
    return (await db.getAll('uploads')).map(({ blob: _b, ...rest }) => rest);
  }
  async deleteUpload(id: string): Promise<void> {
    await (await this.db()).delete('uploads', id);
  }
  async clearOldUploads(keepNewest: number): Promise<number> {
    const db = await this.db();
    const all = (await db.getAllFromIndex('uploads', 'lastUsedAt')).reverse();
    const toDelete = all.slice(keepNewest);
    for (const rec of toDelete) await db.delete('uploads', rec.id);
    return toDelete.length;
  }
  private async uploadsBytes(): Promise<number> {
    const db = await this.db();
    const all = await db.getAll('uploads');
    return all.reduce((n, r) => n + r.blob.size, 0);
  }

  // ---- meta ----------------------------------------------------------------
  async getMeta<T = unknown>(key: string): Promise<T | undefined> {
    return (await (await this.db()).get('meta', key))?.value as T | undefined;
  }
  async setMeta(key: string, value: unknown): Promise<void> {
    await (await this.db()).put('meta', { key, value });
  }

  // ---- portability ---------------------------------------------------------
  async exportAll(opts?: { includeUploads?: boolean }): Promise<Blob> {
    const db = await this.db();
    const profile = await this.getProfile();
    const bundle: ExportBundle = {
      schemaVersion: 1,
      exportedAt: Date.now(),
      app: 'atelier',
      profile,
      designs: await db.getAll('designs'),
      variants: await db.getAll('variants'),
      moodboards: await db.getAll('moodboards'),
      estimates: await db.getAll('estimates'),
      enquiries: await db.getAll('enquiries'),
      favourites: await db.getAll('favourites'),
      feedback: await db.getAll('feedback'),
      approvals: await db.getAll('approvals'),
    };
    if (opts?.includeUploads) {
      const uploads = await db.getAll('uploads');
      bundle.uploads = await Promise.all(
        uploads.map(async (u) => ({
          id: u.id,
          dataUrl: await blobToDataUrl(u.blob),
          width: u.width,
          height: u.height,
          createdAt: u.createdAt,
        })),
      );
    }
    return new Blob([JSON.stringify(bundle)], { type: 'application/json' });
  }

  async importAll(file: File | Blob): Promise<ImportReport> {
    const errors: string[] = [];
    const counts: Record<string, number> = {};
    if (file.size > 64 * 1024 * 1024) {
      return { ok: false, counts, errors: ['File is larger than 64 MB.'] };
    }
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      return { ok: false, counts, errors: ['File is not valid JSON.'] };
    }
    if (hasDangerousKeys(raw)) {
      return { ok: false, counts, errors: ['File contains disallowed keys.'] };
    }
    const parsed = exportBundleSchema.safeParse(raw);
    if (!parsed.success) {
      const issues = parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`);
      return { ok: false, counts, errors: ['File does not match the expected format.', ...issues] };
    }
    const b = parsed.data;
    const db = await this.db();
    const stores = [
      'designs',
      'variants',
      'moodboards',
      'estimates',
      'enquiries',
      'favourites',
      'feedback',
      'approvals',
    ] as const;
    try {
      const tx = db.transaction([...stores, 'profile', 'meta', 'uploads'], 'readwrite');
      for (const s of stores) {
        const items = b[s] as unknown[];
        for (const item of items) {
          // Schema validated above; the store's keyPath must be present.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await tx.objectStore(s).put(item as any);
        }
        counts[s] = items.length;
      }
      if (b.profile) {
        const current = await this.getProfile();
        await tx.objectStore('profile').put({ ...b.profile, guestKey: current.guestKey });
        counts.profile = 1;
      }
      if (b.uploads) {
        for (const u of b.uploads) {
          const blob = await dataUrlToBlob(u.dataUrl);
          await tx.objectStore('uploads').put({
            id: u.id,
            blob,
            width: u.width,
            height: u.height,
            createdAt: u.createdAt,
            lastUsedAt: Date.now(),
          });
        }
        counts.uploads = b.uploads.length;
      }
      await tx.done;
    } catch (e) {
      if (isQuotaError(e)) errors.push('Not enough storage to import everything.');
      else errors.push('Import failed part-way. Some items may not have been restored.');
      return { ok: false, counts, errors };
    }
    return { ok: true, counts, errors };
  }

  async deleteAll(): Promise<void> {
    await deleteDatabase();
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
  }

  async storageUsage(): Promise<StorageUsage> {
    let usedBytes = 0;
    let quotaBytes = 0;
    let persistent = false;
    try {
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate();
        usedBytes = est.usage ?? 0;
        quotaBytes = est.quota ?? 0;
      }
      if (navigator.storage?.persisted) persistent = await navigator.storage.persisted();
    } catch {
      /* ignore */
    }
    return { usedBytes, quotaBytes, uploadsBytes: await this.uploadsBytes(), persistent };
  }
}

export { isIndexedDbAvailable };

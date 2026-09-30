import { openDB, type IDBPDatabase } from 'idb';

import { DB_NAME, DB_VERSION, type AtelierDB } from './schema';

let dbPromise: Promise<IDBPDatabase<AtelierDB>> | null = null;

export function isIndexedDbAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

export function getDb(): Promise<IDBPDatabase<AtelierDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AtelierDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const designs = db.createObjectStore('designs', { keyPath: 'id' });
        designs.createIndex('updatedAt', 'updatedAt');

        const variants = db.createObjectStore('variants', { keyPath: 'id' });
        variants.createIndex('designId', 'designId');

        const uploads = db.createObjectStore('uploads', { keyPath: 'id' });
        uploads.createIndex('lastUsedAt', 'lastUsedAt');

        const boards = db.createObjectStore('moodboards', { keyPath: 'id' });
        boards.createIndex('updatedAt', 'updatedAt');

        const estimates = db.createObjectStore('estimates', { keyPath: 'id' });
        estimates.createIndex('createdAt', 'createdAt');

        const enquiries = db.createObjectStore('enquiries', { keyPath: 'reference' });
        enquiries.createIndex('createdAt', 'createdAt');

        const favourites = db.createObjectStore('favourites', { keyPath: 'key' });
        favourites.createIndex('type', 'type');

        const feedback = db.createObjectStore('feedback', { keyPath: 'id' });
        feedback.createIndex('designId', 'designId');

        db.createObjectStore('profile', { keyPath: 'guestKey' });

        const approvals = db.createObjectStore('approvals', { keyPath: 'id' });
        approvals.createIndex('approvalId', 'approvalId');

        db.createObjectStore('meta', { keyPath: 'key' });
      },
      blocked() {
        console.warn('[atelier] IndexedDB upgrade blocked by another tab.');
      },
      blocking() {
        // Another tab wants to upgrade; close so it can proceed.
        dbPromise?.then((db) => db.close());
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

/** Used by tests and "delete all my data". */
export async function deleteDatabase(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

export class StorageQuotaError extends Error {
  constructor(message = 'Your browser storage is full. Clear old uploads or export your data to free space.') {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

export function isQuotaError(e: unknown): boolean {
  return (
    (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) ||
    (typeof e === 'object' && e !== null && 'name' in e && (e as { name: string }).name === 'QuotaExceededError')
  );
}

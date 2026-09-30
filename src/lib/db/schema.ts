/**
 * IndexedDB schema — database `atelier`, version 1 (SRS §9).
 */
import type { DBSchema } from 'idb';
import type {
  ApprovalResponse,
  Design,
  DesignVariant,
  Enquiry,
  Favourite,
  Feedback,
  MetaRecord,
  MoodBoard,
  Profile,
  SavedEstimate,
  UploadRecord,
} from '@/types/local';

export const DB_NAME = 'atelier';
export const DB_VERSION = 1;

export interface AtelierDB extends DBSchema {
  designs: { key: string; value: Design; indexes: { updatedAt: number } };
  variants: { key: string; value: DesignVariant; indexes: { designId: string } };
  uploads: { key: string; value: UploadRecord; indexes: { lastUsedAt: number } };
  moodboards: { key: string; value: MoodBoard; indexes: { updatedAt: number } };
  estimates: { key: string; value: SavedEstimate; indexes: { createdAt: number } };
  enquiries: { key: string; value: Enquiry; indexes: { createdAt: number } };
  favourites: { key: string; value: Favourite; indexes: { type: string } };
  feedback: { key: string; value: Feedback; indexes: { designId: string } };
  profile: { key: string; value: Profile };
  approvals: { key: string; value: ApprovalResponse; indexes: { approvalId: string } };
  meta: { key: string; value: MetaRecord };
}

export const STORE_NAMES = [
  'designs',
  'variants',
  'uploads',
  'moodboards',
  'estimates',
  'enquiries',
  'favourites',
  'feedback',
  'profile',
  'approvals',
  'meta',
] as const;

export type StoreName = (typeof STORE_NAMES)[number];

/** Cap for user uploads (SRS §9 storage discipline). */
export const UPLOADS_CAP_BYTES = 200 * 1024 * 1024;

/**
 * Zod schemas for UNTRUSTED input — imported JSON exports and decoded share
 * fragments (SRS §12.3 A04). Strict: unknown keys rejected, sizes capped.
 */
import { z } from 'zod';

import { SURFACE_TYPES, type SurfaceType } from '@/types/content';

const MAX_STR = 2_000;
const MAX_LONG_STR = 20_000;
const MAX_ITEMS = 500;

const str = (max = MAX_STR) => z.string().max(max);
const id = () => z.string().min(1).max(128);
const ts = () => z.number().int().nonnegative().max(4_102_444_800_000); // year 2100
const pt = z.tuple([z.number().finite(), z.number().finite()]);
const quad = z.tuple([pt, pt, pt, pt]);
const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .optional();
const unit = () => z.number().min(0).max(1);

export const surfaceTypeSchema = z.enum(SURFACE_TYPES as [SurfaceType, ...SurfaceType[]]);

export const finishSchema = z.enum([
  'matte',
  'eggshell',
  'satin',
  'semi-gloss',
  'high-gloss',
  'textured',
]);
export const tileLayoutSchema = z.enum([
  'straight',
  'staggered',
  'herringbone',
  'basketweave',
  'diagonal',
]);
export const patternSchema = z.enum([
  'plain',
  'geometric',
  'floral',
  'stripe',
  'damask',
  'textured',
  'chevron',
  'herringbone',
  'brick-lay',
]);

export const surfaceAssignmentSchema = z
  .object({
    surfaceId: id(),
    surfaceType: surfaceTypeSchema,
    materialSlug: str(128).optional(),
    shadeCode: str(32).optional(),
    hex,
    finish: finishSchema,
    pattern: patternSchema,
    patternScale: z.number().min(0.25).max(4),
    patternRotation: z.number().min(0).max(360),
    textureIntensity: unit(),
    tileLayout: tileLayoutSchema,
    groutHex: hex,
    groutWidth: unit(),
    opacity: unit(),
    visible: z.boolean(),
    quad: quad.optional(),
    maskRle: str(MAX_LONG_STR * 10).optional(),
    label: str(120).optional(),
  })
  .strict();

export const lightingSchema = z
  .object({
    daylight: z.enum(['morning', 'midday', 'afternoon', 'golden', 'evening', 'night']),
    windowDirection: z.enum(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']),
    artificial: z
      .array(
        z
          .object({
            id: id(),
            kind: z.enum([
              'warm2700',
              'neutral4000',
              'cool6500',
              'cove',
              'pendant',
              'spot',
              'ambient',
            ]),
            intensity: unit(),
            position: pt,
            enabled: z.boolean(),
          })
          .strict(),
      )
      .max(12),
  })
  .strict();

export const annotationSchema = z
  .object({
    id: id(),
    surfaceId: id().optional(),
    at: pt,
    text: str(400),
    createdAt: ts(),
  })
  .strict();

export const designVariantSchema = z
  .object({
    id: id(),
    designId: id(),
    name: str(120),
    colour: str(32),
    favourite: z.boolean(),
    assignments: z.array(surfaceAssignmentSchema).max(64),
    lighting: lightingSchema,
    annotations: z.array(annotationSchema).max(100),
    createdAt: ts(),
    updatedAt: ts(),
    thumb: str(400_000).optional(),
  })
  .strict();

export const designSchema = z
  .object({
    id: id(),
    name: str(120),
    templateSlug: str(128).optional(),
    uploadId: id().optional(),
    width: z.number().int().positive().max(8192),
    height: z.number().int().positive().max(8192),
    customSurfaces: z
      .array(
        z
          .object({
            id: id(),
            surfaceType: surfaceTypeSchema,
            label: str(120),
            maskRle: str(MAX_LONG_STR * 10),
            quad: quad.optional(),
          })
          .strict(),
      )
      .max(64)
      .optional(),
    variantIds: z.array(id()).max(32),
    activeVariantId: id(),
    createdAt: ts(),
    updatedAt: ts(),
    presetProjectSlug: str(128).optional(),
  })
  .strict();

export const moodItemSchema = z
  .object({
    id: id(),
    kind: z.enum(['image', 'swatch', 'material', 'text', 'render', 'shape']),
    x: z.number().finite(),
    y: z.number().finite(),
    w: z.number().finite().min(0),
    h: z.number().finite().min(0),
    rotation: z.number().finite(),
    z: z.number().int(),
    opacity: unit(),
    radius: z.number().min(0).max(500),
    shadow: z.boolean(),
    border: str(64).optional(),
    ref: str(256),
    text: str(2000).optional(),
    fill: str(64).optional(),
    fontSize: z.number().min(4).max(400).optional(),
    cutoutDataUrl: str(4_000_000).optional(),
  })
  .strict();

export const moodBoardSchema = z
  .object({
    id: id(),
    name: str(120),
    template: z.enum(['grid', 'editorial', 'palette', 'room-by-room', 'single-hero', 'blank']),
    width: z.number().int().positive().max(8192),
    height: z.number().int().positive().max(8192),
    background: str(64),
    items: z.array(moodItemSchema).max(200),
    versions: z
      .array(z.object({ at: ts(), items: z.array(moodItemSchema).max(200) }).strict())
      .max(10),
    createdAt: ts(),
    updatedAt: ts(),
  })
  .strict();

export const profileSchema = z
  .object({
    guestKey: id(),
    name: str(80).optional(),
    phone: str(20).optional(),
    email: str(120).optional(),
    locale: z.literal('en'),
    prefs: z
      .object({
        largeText: z.boolean(),
        highContrast: z.boolean(),
        reducedMotion: z.enum(['system', 'on', 'off']),
        vastu: z.enum(['STRICT', 'BASIC', 'NONE']).optional(),
      })
      .strict(),
    role: z.enum(['CLIENT', 'DESIGNER', 'ADMIN']),
    createdAt: ts(),
  })
  .strict();

export const feedbackSchema = z
  .object({
    id: z.string().uuid(),
    designId: id(),
    voterName: str(80),
    createdAt: ts(),
    votes: z
      .array(z.object({ variantId: id(), vote: z.enum(['up', 'love', 'down']) }).strict())
      .max(32),
    comments: z
      .array(z.object({ id: id(), variantId: id(), at: pt.optional(), text: str(600) }).strict())
      .max(50),
  })
  .strict();

export const favouriteSchema = z
  .object({
    key: str(200),
    type: z.enum(['project', 'material', 'style', 'shade']),
    slug: str(128),
    createdAt: ts(),
  })
  .strict();

export const approvalResponseSchema = z
  .object({
    id: id(),
    approvalId: id(),
    action: z.enum(['APPROVE', 'REJECT', 'REQUEST_CHANGES']),
    comment: str(2000).optional(),
    pins: z.array(z.object({ id: id(), at: pt, text: str(400) }).strict()).max(50),
    by: str(80),
    at: ts(),
  })
  .strict();

// Estimates and enquiries are large but structurally simple — use passthrough-free loose objects with caps.
export const savedEstimateSchema = z
  .object({
    id: id(),
    name: str(120),
    input: z.record(z.string().max(64), z.unknown()),
    result: z.record(z.string().max(64), z.unknown()),
    priceBookVersion: str(16),
    createdAt: ts(),
    designId: id().optional(),
  })
  .strict();

export const enquirySchema = z
  .object({
    reference: z.string().regex(/^IND-\d{4}-\d{4}$/),
    createdAt: ts(),
    type: z.enum([
      'VIDEO',
      'PHONE',
      'STUDIO_VISIT',
      'HOME_VISIT',
      'SITE_MEASUREMENT',
      'MATERIAL_SELECTION',
    ]),
    name: str(80),
    phone: str(20),
    email: str(120).optional(),
    city: str(64),
    locality: str(64).optional(),
    pincode: str(8).optional(),
    propertyType: str(24).optional(),
    bhk: str(8).optional(),
    carpetAreaSqft: z.number().int().min(0).max(100_000).optional(),
    nature: str(16).optional(),
    budgetBand: str(16).optional(),
    possessionDate: str(32).optional(),
    preferredSlot: z
      .object({ date: str(16), time: str(8) })
      .strict()
      .optional(),
    alternateSlots: z
      .array(z.object({ date: str(16), time: str(8) }).strict())
      .max(4)
      .optional(),
    preferredContact: z.enum(['WHATSAPP', 'CALL', 'EMAIL']),
    designerSlug: str(128).optional(),
    notes: str(2000).optional(),
    vastu: z.enum(['STRICT', 'BASIC', 'NONE']),
    consent: z.boolean(),
    attachedDesignIds: z.array(id()).max(10).optional(),
    attachedEstimateIds: z.array(id()).max(10).optional(),
    attachedMoodBoardIds: z.array(id()).max(10).optional(),
    attachedUploadIds: z.array(id()).max(10).optional(),
    combineInstruction: str(600).optional(),
    summaryText: str(MAX_LONG_STR),
    status: z.enum(['SUBMITTED', 'WHATSAPP_OPENED', 'EMAIL_OPENED']),
    source: str(64).optional(),
  })
  .strict();

export const exportBundleSchema = z
  .object({
    schemaVersion: z.literal(1),
    exportedAt: ts(),
    app: z.literal('atelier'),
    profile: profileSchema.nullable(),
    designs: z.array(designSchema).max(MAX_ITEMS),
    variants: z.array(designVariantSchema).max(MAX_ITEMS * 4),
    moodboards: z.array(moodBoardSchema).max(MAX_ITEMS),
    estimates: z.array(savedEstimateSchema).max(MAX_ITEMS),
    enquiries: z.array(enquirySchema).max(MAX_ITEMS),
    favourites: z.array(favouriteSchema).max(MAX_ITEMS * 4),
    feedback: z.array(feedbackSchema).max(MAX_ITEMS * 4),
    approvals: z.array(approvalResponseSchema).max(MAX_ITEMS),
    uploads: z
      .array(
        z
          .object({
            id: id(),
            dataUrl: z
              .string()
              .regex(/^data:image\/(jpeg|png|webp);base64,/)
              .max(12_000_000),
            width: z.number().int().positive().max(8192),
            height: z.number().int().positive().max(8192),
            createdAt: ts(),
          })
          .strict(),
      )
      .max(100)
      .optional(),
  })
  .strict();

export const sharedDesignSchema = z
  .object({
    v: z.literal(1),
    templateSlug: str(128),
    designId: id(),
    designName: str(120),
    senderName: str(80).optional(),
    variants: z
      .array(
        z
          .object({
            id: id(),
            name: str(120),
            colour: str(32),
            assignments: z.array(surfaceAssignmentSchema).max(64),
            lighting: lightingSchema,
            annotations: z.array(annotationSchema).max(100),
          })
          .strict(),
      )
      .min(1)
      .max(8),
  })
  .strict();

export const sharedMoodBoardSchema = z
  .object({
    v: z.literal(1),
    board: moodBoardSchema.omit({ versions: true }),
  })
  .strict();

/** Guard against prototype-pollution keys anywhere in a parsed JSON tree. */
export function hasDangerousKeys(value: unknown, depth = 0): boolean {
  if (depth > 32) return true;
  if (Array.isArray(value)) return value.some((v) => hasDangerousKeys(v, depth + 1));
  if (value && typeof value === 'object') {
    for (const k of Object.keys(value as Record<string, unknown>)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') return true;
      if (hasDangerousKeys((value as Record<string, unknown>)[k], depth + 1)) return true;
    }
  }
  return false;
}

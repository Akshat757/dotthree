/**
 * Six authored demo room templates — SRS §6.3 / FR-C-01. Geometry is defined once
 * here (image space, 2000×1333) and consumed by BOTH the build-time scene generator
 * (scripts/generate-room-templates.ts → base image + mask PNGs) and the runtime
 * visualiser (perspective quads). See docs/AUTHORING-ROOM-TEMPLATES.md.
 */
import type { Pt, RoomTemplate, SurfaceMask, SurfaceType } from '@/types/content';

import { img } from './images';

export const TEMPLATE_W = 2000;
export const TEMPLATE_H = 1333;

export interface SceneSurface {
  id: string;
  surfaceType: SurfaceType;
  label: string;
  /** polygon in image space, clockwise */
  polygon: Pt[];
  /** texture homography quad TL,TR,BR,BL — defaults to polygon if it has 4 points */
  quad?: [Pt, Pt, Pt, Pt];
  defaultMaterialSlug?: string;
  /** base albedo used by the generator when no material is applied */
  baseHex: string;
  /** render order (back → front) */
  z: number;
}

export interface SceneTemplate {
  slug: string;
  name: string;
  roomType: string;
  style: string;
  lightDirection: [number, number];
  windowDirection: RoomTemplate['windowDirection'];
  /** where the window opening sits (for the generator to paint a bright patch) */
  window?: Pt[];
  surfaces: SceneSurface[];
  alt: string;
}

// One-point perspective box: vanishing point (1000, 620); back wall inset.
const VP: Pt = [1000, 620];
const BW: [Pt, Pt, Pt, Pt] = [
  [560, 300],
  [1440, 300],
  [1440, 900],
  [560, 900],
];

/** Project a point on the back-wall plane toward the camera by factor t (0 = back wall, 1 = image edge). */
function toward(p: Pt, t: number): Pt {
  // move away from VP
  return [p[0] + (p[0] - VP[0]) * t * 2.2, p[1] + (p[1] - VP[1]) * t * 2.2];
}

const room = {
  backWall: (): Pt[] => [...BW],
  leftWall: (): Pt[] => [[0, 0], BW[0], BW[3], [0, TEMPLATE_H]],
  rightWall: (): Pt[] => [BW[1], [TEMPLATE_W, 0], [TEMPLATE_W, TEMPLATE_H], BW[2]],
  floor: (): Pt[] => [[0, TEMPLATE_H], BW[3], BW[2], [TEMPLATE_W, TEMPLATE_H]],
  ceiling: (): Pt[] => [[0, 0], [TEMPLATE_W, 0], BW[1], BW[0]],
};

/** A rectangle lying on the back wall: x0..x1 (560–1440), y0..y1 (300–900). */
const onBack = (x0: number, y0: number, x1: number, y1: number): Pt[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** A box protruding from the back wall by depth t (0..1) — returns front face. */
const frontFace = (x0: number, y0: number, x1: number, y1: number, t: number): Pt[] => [
  toward([x0, y0], t),
  toward([x1, y0], t),
  toward([x1, y1], t),
  toward([x0, y1], t),
];

/** Top face of a counter/box on the back wall */
const topFace = (x0: number, y: number, x1: number, t: number): Pt[] => [
  [x0, y],
  [x1, y],
  toward([x1, y], t),
  toward([x0, y], t),
];

/** A rectangle on the left wall between back-wall y0..y1 and depth t0..t1 */
const onLeft = (y0: number, y1: number, t0: number, t1: number): Pt[] => [
  toward([560, y0], t1),
  toward([560, y0], t0),
  toward([560, y1], t0),
  toward([560, y1], t1),
];
const onRight = (y0: number, y1: number, t0: number, t1: number): Pt[] => [
  toward([1440, y0], t0),
  toward([1440, y0], t1),
  toward([1440, y1], t1),
  toward([1440, y1], t0),
];

const quadOf = (poly: Pt[]): [Pt, Pt, Pt, Pt] | undefined =>
  poly.length === 4 ? (poly as [Pt, Pt, Pt, Pt]) : undefined;

export const sceneTemplates: SceneTemplate[] = [
  {
    slug: 'living-modern-indian',
    name: 'Living Room — Modern Indian',
    roomType: 'living',
    style: 'modern-indian',
    lightDirection: [-0.7, -0.3],
    windowDirection: 'E',
    window: onLeft(330, 760, 0.22, 0.55),
    alt: 'Demo living room scene with a TV wall, fluted panelling, sofa and a window on the left',
    surfaces: [
      { id: 'ceiling', surfaceType: 'CEILING', label: 'Ceiling', polygon: room.ceiling(), baseHex: '#F4F0E8', z: 0, defaultMaterialSlug: 'paint-cotton-white' },
      { id: 'wall-left', surfaceType: 'WALL', label: 'Left wall', polygon: room.leftWall(), baseHex: '#EDE6DA', z: 1, defaultMaterialSlug: 'paint-ivory-mist' },
      { id: 'wall-right', surfaceType: 'WALL', label: 'Right wall', polygon: room.rightWall(), baseHex: '#EAE2D5', z: 1, defaultMaterialSlug: 'paint-ivory-mist' },
      { id: 'wall-back', surfaceType: 'ACCENT_WALL', label: 'TV wall', polygon: room.backWall(), baseHex: '#B9705B', z: 2, defaultMaterialSlug: 'paint-malwa-clay' },
      { id: 'panel', surfaceType: 'WALL_PANEL', label: 'Fluted panel', polygon: onBack(1060, 340, 1400, 900), baseHex: '#B08A5E', z: 3, defaultMaterialSlug: 'veneer-fluted-oak-panel' },
      { id: 'floor', surfaceType: 'FLOOR', label: 'Floor', polygon: room.floor(), baseHex: '#DDD4C3', z: 2, defaultMaterialSlug: 'vitrified-ivory-matte' },
      { id: 'rug', surfaceType: 'RUG', label: 'Rug', polygon: [[520, 1120], [1480, 1120], [1720, 1333], [280, 1333]], baseHex: '#C9B69A', z: 4 },
      { id: 'tv-unit', surfaceType: 'CABINET_LOWER', label: 'TV unit', polygon: frontFace(620, 800, 1040, 900, 0.08), baseHex: '#6E4E3A', z: 5, defaultMaterialSlug: 'laminate-walnut-classic' },
      { id: 'sofa', surfaceType: 'UPHOLSTERY', label: 'Sofa', polygon: [[300, 1010], [1000, 980], [1080, 1180], [220, 1240]], baseHex: '#D6C9B2', z: 6, defaultMaterialSlug: 'fabric-linen-oat' },
      { id: 'curtain', surfaceType: 'CURTAIN', label: 'Curtain', polygon: onLeft(310, 900, 0.14, 0.24), baseHex: '#D9CBB2', z: 5, defaultMaterialSlug: 'curtain-linen-sand' },
    ],
  },
  {
    slug: 'master-bedroom-contemporary',
    name: 'Master Bedroom — Contemporary',
    roomType: 'master-bedroom',
    style: 'contemporary',
    lightDirection: [0.7, -0.3],
    windowDirection: 'N',
    window: onRight(330, 760, 0.22, 0.55),
    alt: 'Demo master bedroom with a headboard wall, bed, sliding wardrobe on the left and a window on the right',
    surfaces: [
      { id: 'ceiling', surfaceType: 'CEILING', label: 'Ceiling', polygon: room.ceiling(), baseHex: '#F5F2EC', z: 0, defaultMaterialSlug: 'paint-cotton-white' },
      { id: 'wall-left', surfaceType: 'WALL', label: 'Left wall', polygon: room.leftWall(), baseHex: '#E8E6E1', z: 1, defaultMaterialSlug: 'paint-sand-stone' },
      { id: 'wall-right', surfaceType: 'WALL', label: 'Right wall', polygon: room.rightWall(), baseHex: '#E6E4DF', z: 1, defaultMaterialSlug: 'paint-sand-stone' },
      { id: 'wall-back', surfaceType: 'ACCENT_WALL', label: 'Headboard wall', polygon: room.backWall(), baseHex: '#B9C4B1', z: 2, defaultMaterialSlug: 'paint-sage-whisper' },
      { id: 'headboard', surfaceType: 'WALL_PANEL', label: 'Headboard panel', polygon: onBack(700, 520, 1300, 900), baseHex: '#D8C9B0', z: 3, defaultMaterialSlug: 'veneer-white-ash' },
      { id: 'floor', surfaceType: 'FLOOR', label: 'Floor', polygon: room.floor(), baseHex: '#C09A6B', z: 2, defaultMaterialSlug: 'wood-engineered-oak' },
      { id: 'wardrobe', surfaceType: 'WARDROBE', label: 'Sliding wardrobe', polygon: onLeft(310, 900, 0.0, 0.42), baseHex: '#6E4E3A', z: 4, defaultMaterialSlug: 'laminate-walnut-classic' },
      { id: 'bed', surfaceType: 'UPHOLSTERY', label: 'Bed linen', polygon: [[620, 900], [1380, 900], [1560, 1240], [440, 1240]], baseHex: '#EFE9DD', z: 5, defaultMaterialSlug: 'fabric-boucle-cream' },
      { id: 'curtain', surfaceType: 'CURTAIN', label: 'Curtain', polygon: onRight(310, 900, 0.14, 0.24), baseHex: '#3F3F41', z: 5, defaultMaterialSlug: 'curtain-blackout-charcoal' },
      { id: 'rug', surfaceType: 'RUG', label: 'Rug', polygon: [[300, 1250], [1700, 1250], [1900, 1333], [100, 1333]], baseHex: '#D9D2C5', z: 4 },
    ],
  },
  {
    slug: 'kitchen-modular-l',
    name: 'Modular Kitchen — L-shaped',
    roomType: 'kitchen',
    style: 'contemporary',
    lightDirection: [0.6, -0.5],
    windowDirection: 'SE',
    window: onBack(1160, 360, 1400, 640),
    alt: 'Demo L-shaped modular kitchen with upper and lower cabinets, countertop, backsplash and a window',
    surfaces: [
      { id: 'ceiling', surfaceType: 'CEILING', label: 'Ceiling', polygon: room.ceiling(), baseHex: '#F6F5F1', z: 0, defaultMaterialSlug: 'paint-cotton-white' },
      { id: 'wall-left', surfaceType: 'WALL', label: 'Left wall', polygon: room.leftWall(), baseHex: '#EFEDE8', z: 1, defaultMaterialSlug: 'paint-cotton-white' },
      { id: 'wall-right', surfaceType: 'WALL', label: 'Right wall', polygon: room.rightWall(), baseHex: '#ECEAE5', z: 1, defaultMaterialSlug: 'paint-cotton-white' },
      { id: 'wall-back', surfaceType: 'WALL', label: 'Back wall', polygon: room.backWall(), baseHex: '#F0EEE9', z: 2, defaultMaterialSlug: 'paint-cotton-white' },
      { id: 'floor', surfaceType: 'FLOOR', label: 'Floor', polygon: room.floor(), baseHex: '#E9E3D6', z: 2, defaultMaterialSlug: 'vitrified-ivory-matte' },
      { id: 'uppers-back', surfaceType: 'CABINET_UPPER', label: 'Upper cabinets', polygon: frontFace(580, 330, 1140, 600, 0.05), baseHex: '#F3F2EE', z: 4, defaultMaterialSlug: 'laminate-frosty-white' },
      { id: 'uppers-left', surfaceType: 'CABINET_UPPER', label: 'Upper cabinets (left)', polygon: onLeft(330, 600, 0.05, 0.5), baseHex: '#F3F2EE', z: 4, defaultMaterialSlug: 'laminate-frosty-white' },
      { id: 'backsplash', surfaceType: 'BACKSPLASH', label: 'Backsplash', polygon: onBack(580, 600, 1400, 760), baseHex: '#F2F1EC', z: 3, defaultMaterialSlug: 'ceramic-subway-white' },
      { id: 'backsplash-left', surfaceType: 'BACKSPLASH', label: 'Backsplash (left)', polygon: onLeft(600, 760, 0.0, 0.5), baseHex: '#F2F1EC', z: 3, defaultMaterialSlug: 'ceramic-subway-white' },
      { id: 'counter', surfaceType: 'COUNTERTOP', label: 'Countertop', polygon: topFace(580, 760, 1400, 0.12), baseHex: '#1C1C1E', z: 5, defaultMaterialSlug: 'granite-black-galaxy' },
      { id: 'counter-left', surfaceType: 'COUNTERTOP', label: 'Countertop (left)', polygon: [toward([560, 760], 0.0), toward([560, 760], 0.5), toward([560, 760], 0.62), toward([560, 760], 0.12)].map((p, i) => (i === 2 || i === 3 ? [p[0] + 120, p[1] + 30] : p)) as Pt[], baseHex: '#1C1C1E', z: 5, defaultMaterialSlug: 'granite-black-galaxy' },
      { id: 'lowers', surfaceType: 'CABINET_LOWER', label: 'Lower cabinets', polygon: frontFace(580, 775, 1400, 900, 0.12), baseHex: '#9EAA97', z: 6, defaultMaterialSlug: 'laminate-sage-matte' },
      { id: 'lowers-left', surfaceType: 'CABINET_LOWER', label: 'Lower cabinets (left)', polygon: onLeft(775, 900, 0.12, 0.5), baseHex: '#9EAA97', z: 6, defaultMaterialSlug: 'laminate-sage-matte' },
    ],
  },
  {
    slug: 'kids-study-contemporary',
    name: 'Kids\' Room & Study',
    roomType: 'kids-room',
    style: 'scandinavian',
    lightDirection: [-0.6, -0.4],
    windowDirection: 'NE',
    window: onLeft(330, 700, 0.25, 0.55),
    alt: 'Demo kids\' room with a bed, a study desk under the window, a wardrobe and a feature wall',
    surfaces: [
      { id: 'ceiling', surfaceType: 'CEILING', label: 'Ceiling', polygon: room.ceiling(), baseHex: '#F7F6F2', z: 0, defaultMaterialSlug: 'paint-cotton-white' },
      { id: 'wall-left', surfaceType: 'WALL', label: 'Left wall', polygon: room.leftWall(), baseHex: '#EEEBE4', z: 1, defaultMaterialSlug: 'paint-cotton-white' },
      { id: 'wall-right', surfaceType: 'WALL', label: 'Right wall', polygon: room.rightWall(), baseHex: '#ECE9E2', z: 1, defaultMaterialSlug: 'paint-cotton-white' },
      { id: 'wall-back', surfaceType: 'ACCENT_WALL', label: 'Feature wall', polygon: room.backWall(), baseHex: '#DCE6EE', z: 2, defaultMaterialSlug: 'wallpaper-kids-clouds' },
      { id: 'floor', surfaceType: 'FLOOR', label: 'Floor', polygon: room.floor(), baseHex: '#A79A8B', z: 2, defaultMaterialSlug: 'wood-laminate-oak-grey' },
      { id: 'wardrobe', surfaceType: 'WARDROBE', label: 'Wardrobe', polygon: onRight(310, 900, 0.0, 0.4), baseHex: '#F3F2EE', z: 4, defaultMaterialSlug: 'laminate-frosty-white' },
      { id: 'desk', surfaceType: 'COUNTERTOP', label: 'Study desk', polygon: [toward([560, 720], 0.2), toward([560, 720], 0.6), toward([560, 760], 0.66), toward([560, 760], 0.26)].map((p, i) => (i >= 2 ? [p[0] + 160, p[1]] : p)) as Pt[], baseHex: '#C29A67', z: 5, defaultMaterialSlug: 'top-butcher-block-oak' },
      { id: 'bed-frame', surfaceType: 'CABINET_LOWER', label: 'Bed platform', polygon: frontFace(620, 820, 1200, 900, 0.1), baseHex: '#C7A67A', z: 5, defaultMaterialSlug: 'laminate-oak-linear' },
      { id: 'bed', surfaceType: 'UPHOLSTERY', label: 'Bed linen', polygon: [[640, 800], [1180, 800], [1300, 1010], [560, 1010]], baseHex: '#B9C4B1', z: 6, defaultMaterialSlug: 'fabric-performance-grey' },
      { id: 'rug', surfaceType: 'RUG', label: 'Rug', polygon: [[400, 1150], [1500, 1150], [1700, 1333], [200, 1333]], baseHex: '#D9D2C5', z: 4 },
      { id: 'curtain', surfaceType: 'CURTAIN', label: 'Curtain', polygon: onLeft(310, 720, 0.14, 0.26), baseHex: '#F7F6F2', z: 5, defaultMaterialSlug: 'curtain-sheer-white' },
    ],
  },
  {
    slug: 'pooja-traditional',
    name: 'Pooja Room — Traditional',
    roomType: 'pooja',
    style: 'traditional-indian',
    lightDirection: [0, -0.8],
    windowDirection: 'NE',
    alt: 'Demo pooja room with a marble platform, teak shutters, a jaali back wall and warm cove light',
    surfaces: [
      { id: 'ceiling', surfaceType: 'CEILING', label: 'Ceiling', polygon: room.ceiling(), baseHex: '#F2ECE0', z: 0, defaultMaterialSlug: 'paint-cotton-white' },
      { id: 'wall-left', surfaceType: 'WALL', label: 'Left wall', polygon: room.leftWall(), baseHex: '#E6DCCB', z: 1, defaultMaterialSlug: 'paint-sand-stone' },
      { id: 'wall-right', surfaceType: 'WALL', label: 'Right wall', polygon: room.rightWall(), baseHex: '#E3D9C8', z: 1, defaultMaterialSlug: 'paint-sand-stone' },
      { id: 'wall-back', surfaceType: 'ACCENT_WALL', label: 'Mandir wall', polygon: room.backWall(), baseHex: '#E3B85B', z: 2, defaultMaterialSlug: 'paint-turmeric-light' },
      { id: 'jaali', surfaceType: 'WALL_PANEL', label: 'Jaali panel', polygon: onBack(760, 340, 1240, 700), baseHex: '#9A6A3F', z: 3, defaultMaterialSlug: 'veneer-natural-teak' },
      { id: 'floor', surfaceType: 'FLOOR', label: 'Floor', polygon: room.floor(), baseHex: '#F0EEE8', z: 2, defaultMaterialSlug: 'marble-makrana-white' },
      { id: 'platform-top', surfaceType: 'COUNTERTOP', label: 'Platform top', polygon: topFace(680, 700, 1320, 0.14), baseHex: '#E3CFC7', z: 4, defaultMaterialSlug: 'marble-pink-ambaji' },
      { id: 'platform-front', surfaceType: 'CABINET_LOWER', label: 'Platform drawers', polygon: frontFace(680, 715, 1320, 900, 0.14), baseHex: '#9A6A3F', z: 5, defaultMaterialSlug: 'veneer-natural-teak' },
      { id: 'door-left', surfaceType: 'DOOR', label: 'Left shutter', polygon: onLeft(320, 900, 0.0, 0.3), baseHex: '#9A6A3F', z: 4, defaultMaterialSlug: 'veneer-natural-teak' },
      { id: 'door-right', surfaceType: 'DOOR', label: 'Right shutter', polygon: onRight(320, 900, 0.0, 0.3), baseHex: '#9A6A3F', z: 4, defaultMaterialSlug: 'veneer-natural-teak' },
    ],
  },
  {
    slug: 'bathroom-spa',
    name: 'Bathroom — Spa',
    roomType: 'bathroom',
    style: 'luxury',
    lightDirection: [0.5, -0.6],
    windowDirection: 'W',
    window: onRight(330, 560, 0.25, 0.5),
    alt: 'Demo bathroom with a vanity counter, mirror, wall tiles, floor tiles and a shower zone',
    surfaces: [
      { id: 'ceiling', surfaceType: 'CEILING', label: 'Ceiling', polygon: room.ceiling(), baseHex: '#F6F5F2', z: 0, defaultMaterialSlug: 'paint-cotton-white' },
      { id: 'wall-left', surfaceType: 'BATH_TILE', label: 'Left wall tile', polygon: room.leftWall(), baseHex: '#ECEBE7', z: 1, defaultMaterialSlug: 'vitrified-carrara-look' },
      { id: 'wall-right', surfaceType: 'BATH_TILE', label: 'Right wall tile', polygon: room.rightWall(), baseHex: '#EAE9E5', z: 1, defaultMaterialSlug: 'vitrified-carrara-look' },
      { id: 'wall-back', surfaceType: 'BATH_TILE', label: 'Feature wall tile', polygon: room.backWall(), baseHex: '#5F7A6A', z: 2, defaultMaterialSlug: 'marble-green-udaipur' },
      { id: 'mirror', surfaceType: 'WALL_PANEL', label: 'Mirror', polygon: onBack(700, 340, 1300, 640), baseHex: '#C9D1D6', z: 3 },
      { id: 'floor', surfaceType: 'FLOOR', label: 'Floor tile', polygon: room.floor(), baseHex: '#9C9A95', z: 2, defaultMaterialSlug: 'vitrified-grey-stone' },
      { id: 'vanity-top', surfaceType: 'COUNTERTOP', label: 'Vanity top', polygon: topFace(640, 740, 1360, 0.12), baseHex: '#F7F7F5', z: 4, defaultMaterialSlug: 'quartz-pure-white' },
      { id: 'vanity', surfaceType: 'CABINET_LOWER', label: 'Vanity cabinet', polygon: frontFace(640, 755, 1360, 900, 0.12), baseHex: '#6B5240', z: 5, defaultMaterialSlug: 'veneer-smoked-oak' },
      { id: 'shower-screen', surfaceType: 'DOOR', label: 'Shower glass', polygon: onLeft(320, 1000, 0.0, 0.55), baseHex: '#DDE4E6', z: 4, defaultMaterialSlug: 'glass-fluted-clear' },
    ],
  },
];

export function toRoomTemplate(t: SceneTemplate): RoomTemplate {
  const surfaces: SurfaceMask[] = [...t.surfaces]
    .sort((a, b) => a.z - b.z)
    .map((s, i) => ({
      id: s.id,
      surfaceType: s.surfaceType,
      label: s.label,
      maskSrc: `/demo/templates/${t.slug}/mask-${s.id}.png`,
      perspectiveQuad: s.quad ?? quadOf(s.polygon),
      defaultMaterialSlug: s.defaultMaterialSlug,
      orderIndex: i,
    }));
  return {
    slug: t.slug,
    name: t.name,
    roomType: t.roomType,
    style: t.style,
    baseImage: img(`template-${t.slug}`),
    lightDirection: t.lightDirection,
    windowDirection: t.windowDirection,
    surfaces,
  };
}

export const roomTemplates: RoomTemplate[] = sceneTemplates.map(toRoomTemplate);

export function getRoomTemplate(slug: string): RoomTemplate | undefined {
  return roomTemplates.find((t) => t.slug === slug);
}

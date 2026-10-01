import { titleCase } from '@/lib/utils';
import type { MaterialCategory, SurfaceType } from '@/types/content';

const CATEGORY_LABEL: Partial<Record<MaterialCategory, string>> = {
  PU_FINISH: 'PU finish',
  CERAMIC_TILE: 'Ceramic tiles',
  VITRIFIED_TILE: 'Vitrified tiles',
  WOOD_FLOORING: 'Wood flooring',
  VINYL_FLOORING: 'Vinyl flooring',
  WALL_TEXTURE: 'Wall textures',
  KITCHEN_HARDWARE: 'Kitchen hardware',
  WARDROBE_HARDWARE: 'Wardrobe hardware',
  METAL_FINISH: 'Metal finishes',
};

export function categoryLabel(c: MaterialCategory): string {
  return CATEGORY_LABEL[c] ?? titleCase(c);
}

const SURFACE_LABEL: Partial<Record<SurfaceType, string>> = {
  WALL: 'Walls',
  ACCENT_WALL: 'Accent wall',
  CEILING: 'Ceiling',
  FLOOR: 'Flooring',
  CABINET_UPPER: 'Upper cabinets',
  CABINET_LOWER: 'Lower cabinets',
  WARDROBE: 'Wardrobe shutters',
  COUNTERTOP: 'Countertop',
  BACKSPLASH: 'Backsplash',
  CURTAIN: 'Curtains',
  UPHOLSTERY: 'Upholstery',
  WALL_PANEL: 'Wall panelling',
  DOOR: 'Doors',
  WINDOW_FRAME: 'Window frames',
  BATH_TILE: 'Bathroom tiles',
  RUG: 'Rug',
  LIGHT_FIXTURE: 'Lighting',
};

export function surfaceLabel(s: SurfaceType): string {
  return SURFACE_LABEL[s] ?? titleCase(s);
}

# Authoring visualiser room templates

A template = one base photograph + one 8-bit PNG mask per paintable surface + a perspective quad
per surface + a light direction. Demo templates are synthetic renders produced by
`scripts/author-templates.ts` from the geometry in `src/data/demo/roomTemplates.ts`; this guide is
for replacing them with real photographs.

## 1. Shoot / choose the photo

- 3:2 landscape, ≥ 2000 px wide, camera roughly level (one-point or mild two-point perspective).
- Even daylight; avoid strong specular hot-spots on the surfaces you want to recolour.
- Minimal clutter on walls and floor. Furniture is fine — it is masked out automatically by
  simply not being part of any surface mask.

Save as `public/demo/templates/<slug>/base.jpg`, then run `npm run assets:images -- --only templates`
to derive AVIF/WebP sizes.

## 2. Paint masks

For each surface (wall-back, wall-left, wall-right, floor, ceiling, cabinet-upper, …) create a
greyscale PNG at the same pixel size as the base image:

- 255 = fully part of the surface, 0 = not, soft edges (2–4 px) where the surface meets objects.
- Any editor works (Photopea is free). Export as 8-bit grey PNG:
  `public/demo/templates/<slug>/mask-<surfaceId>.png`.
- Surfaces may overlap only where one is drawn "over" another; order is set by `z` in the data.

## 3. Perspective quads

For planar surfaces (walls, floor tiles, cabinet fronts) give the four image-space corners in
order TL, TR, BR, BL as fractions 0–1 of width/height. The visualiser fits a homography so
textures tile at true scale (`scaleCm`). Curved or irregular surfaces: omit `quad`; textures then
tile in screen space.

Tip: open the base image in the `/dev/template-inspector` route (dev only) to click corners and
copy the JSON.

## 4. Light

`lightDirection`: `'left' | 'right' | 'top' | 'front'` — where the dominant light comes from.
`windowDirection` optional; used by the Vastu advisory and the lighting panel default CCT.

## 5. Register

Add an entry to `roomTemplates` (see `SceneTemplate` type) and run `npm run assets:verify` — it
checks every mask exists, matches the base dimensions, and that quads are convex and in-bounds.

## Quality checklist

- [ ] Wall masks do not bleed into skirting/cornice.
- [ ] Floor mask excludes rugs (add a separate `rug` surface if it should be recolourable).
- [ ] Recolouring the back wall to pure white and to a deep colour both look plausible.
- [ ] Tile texture at 60 cm reads as ~60 cm against furniture scale.

# Asset pipeline

All imagery is generated or fetched at build time into gitignored folders. Nothing binary is
committed except tiny SVG logos. `src/data/demo/images.generated.ts` (committed) is the manifest
the app reads: dimensions, blurhash, alt, credit, and derivative URLs.

## Naming

`public/demo/<group>/<id>-<width>.<avif|webp>` where `<id>` matches `ImageRef.id` in
`src/data/demo/images.ts`. Widths: 400, 800, 1200, 2000. `Img` builds the `<picture>` srcset.

| Prefix                                     | Source                                         |
| ------------------------------------------ | ---------------------------------------------- |
| `proj-*`                                   | project photos (hero + gallery + before/after) |
| `mat-*`                                    | material swatches                              |
| `designer-*`                               | portraits (illustrative silhouettes in demo)   |
| `template-*`                               | visualiser template base images                |
| `style-*`, `room-*`, `journal-*`, `hero-*` | editorial imagery                              |

## Generation (`npm run assets:images`)

`scripts/fetch-demo-assets.ts` renders SVG scenes (seeded PRNG per id → deterministic output),
rasterises with `sharp`, encodes AVIF + WebP, computes blurhash, and writes the manifest.
Idempotent: skips ids whose outputs already exist unless `--force`.

## Replacing with real photos

1. Drop `public/demo/originals/<id>.jpg` (≥ 2000 px on the long edge).
2. Run `npm run assets:images` — originals take precedence over the synthetic renderer.
3. Fill `credit` in `src/data/demo/images.ts` (`source: 'firm'`, photographer, consent flag).
4. `npm run assets:verify`.

The legal page `/legal/image-credits` is generated from the manifest, so every image is attributed.

## Textures (`npm run assets:textures`)

Downloads CC0 sets from ambientCG (albedo, normal, roughness at 1K) listed in
`scripts/textures.manifest.json` with SHA-256 verification. If offline or a download fails, a
procedural fallback (wood grain, stone speckle, fabric weave, tile grid) is generated so the
visualiser always works. Output: `public/textures/<slug>/{albedo,normal,roughness}.webp`.

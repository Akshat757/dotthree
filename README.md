# atelier — Aangan Design Studio (demo)

Premium interior-design website and client design platform for an Indore firm. Built to the
"Zero-Cost Edition" brief (SRS-IDW-002 v2.0): **zero recurring cost, zero client assets required,
everything works** — the whole site runs as a static export with an empty `.env`.

- **Static**: Next.js 15 App Router, `output: 'export'`, deployable to Cloudflare Pages / GitHub Pages.
- **Demo Mode**: all content is typed TypeScript data; every user artefact (designs, mood boards,
  estimates, enquiries) is stored in the visitor's own browser (IndexedDB). No backend.
- **Synthetic imagery**: room scenes, textures and template masks are generated at build time by
  scripts in `scripts/`. Real photos swap in by replacing files that follow the same manifest.
- **Swappable adapters**: UI code imports only `@/lib/adapters`. Content, storage, leads, notifications
  and analytics are interfaces with local implementations; a future DB mode replaces `impl/*` only.

## Quick start

```bash
npm ci
npm run assets:all      # generate demo images, textures, templates, icons, OG cards (idempotent)
npm run dev             # http://localhost:3000
```

Production check (this is exactly what CI does):

```bash
npm run lint && npm run typecheck && npm test
npm run build           # → ./out
npm run start           # serve ./out locally
npm run e2e             # Playwright + axe against ./out
```

## Scripts

| Script                       | Purpose                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| `assets:shades`              | 240 original OKLCH paint shades → `src/data/shades/shades.generated.ts`                 |
| `assets:images`              | Synthetic room scenes → `public/demo/**` + `src/data/demo/images.generated.ts`          |
| `assets:textures`            | CC0 material textures (ambientCG) with procedural offline fallback → `public/textures/` |
| `assets:templates`           | Visualiser room-template base images + per-surface masks                                |
| `assets:icons` / `assets:og` | Favicons/maskable icons; 1200×630 Open Graph cards                                      |
| `assets:verify`              | Checks every referenced asset exists and hashes match                                   |
| `check:contacts`             | Fails if phone/wa.me/email appear outside `src/config/site.ts`                          |
| `check:licenses`             | Dependency licence allow-list (no GPL/AGPL)                                             |

## Where things live

```
src/config/        site.ts (SINGLE source of firm details), nav, features, runtime
src/types/         content model (SRS §9), local artefacts, client project
src/data/demo/     projects, materials, designers, services, styles, rooms, quiz, templates…
src/data/shades/   generated paint shades
src/lib/adapters/  contracts.ts + impl/* + getAdapters()
src/lib/           utils, whatsapp builders, pricing, share codec, mask, color, seo
src/components/ui  design-system primitives (see /dev/components)
src/components/layout  header, footer, mobile bar, providers
src/app/           routes (static)
content/journal/   MDX articles
scripts/           build-time generators and CI guards
public/_headers    CSP + caching (Cloudflare Pages)
public/_redirects  legacy path aliases
```

## Replacing demo content with a real firm

1. Edit `src/config/site.ts` only — name, phone, WhatsApp, email, address, GSTIN, hours, socials.
   Set `isDemoContent: false` to remove the demo banner.
2. Replace data files in `src/data/demo/` (same types). Add real photos to `public/demo/` following
   `docs/ASSET-PIPELINE.md`; run `npm run assets:verify`.
3. Author real visualiser templates per `docs/AUTHORING-ROOM-TEMPLATES.md`.
4. Optional free integrations via `.env` (see `.env.example`): Cloudflare Web Analytics, Google Sheets
   lead sink (`docs/LEAD-SINK-SETUP.md`), Turnstile.

## Deploying (manual, free tier)

**Cloudflare Pages**: connect the repo, build command `npm run assets:all && npm run build`,
output directory `out`, Node 22. `public/_headers` and `public/_redirects` are picked up automatically.
Set `NEXT_PUBLIC_SITE_URL` to the final domain.

**GitHub Pages**: upload `out/` via `actions/deploy-pages`; note `_headers` are not honoured there.

## Conventions

- Strict TS, `noUncheckedIndexedAccess`; ESLint flat config with jsx-a11y.
- No raw `<img>` outside `src/components/ui/img.tsx`; no `dangerouslySetInnerHTML` outside MDX/SEO.
- UI never imports `src/lib/adapters/impl/**` (lint-enforced).
- Currency via `formatInr`; all text English (en-IN), no i18n layer.
- Motion respects `prefers-reduced-motion` and `Save-Data`.

Demo firm details, people, prices and testimonials are fictional.

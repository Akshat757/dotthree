# Software Requirements Specification (SRS)
## Premium Interior Design Firm Website & Design Platform
### Zero-Cost Build — Indore, Madhya Pradesh, India

---

| Field | Value |
|---|---|
| **Document ID** | SRS-IDW-002 |
| **Version** | 2.0 — Zero-Cost Edition |
| **Supersedes** | SRS-IDW-001 v1.0 (`SRS-v1-paid-stack.md`) |
| **Status** | Approved for build |
| **Date** | 30 September 2026 |
| **Product codename** | `atelier` |
| **Total cost to build, run, and host** | **₹0** |
| **Intended audience** | Engineering team, or an AI coding agent executing this document as a build prompt |

---

# HOW TO USE THIS DOCUMENT

> **If you are an LLM/coding agent:** This document is your complete build specification. Build it exactly as written.
>
> **Three absolute constraints govern everything below:**
>
> 1. **ZERO COST.** No paid service, no credit card, no paid API, no paid asset, no service that requires business verification or a billing account. Every dependency must be free-tier-forever, open source, or public domain. Where a free tier has limits, they are stated. **If you cannot find a free way to do something, do not do it — degrade the feature instead.**
> 2. **ZERO CLIENT ASSETS.** The firm has no name, no logo, no photographs, no project data, no price list. The product must look complete and premium using only the demo dataset specified in **Section 11**, and every piece of that demo data must be replaceable later by editing data files only — never component code.
> 3. **EVERYTHING WORKS.** No dead buttons. No `href="#"`. No "coming soon". Every feature listed in **Section 6** must be functionally operable against the demo dataset, including saving, sharing, voting, estimating, and booking.
>
> Build in the phase order in **Section 14**. Read **Section 5** before writing any code — the adapter architecture there is what makes ₹0 possible without painting the project into a corner.

---

# TABLE OF CONTENTS

1. Introduction & Purpose
2. Product Vision & Positioning
3. Scope Decisions — Build / Degrade / Cut
4. Users, Personas & Journeys
5. **Zero-Cost Architecture & Technology Stack**
6. Functional Requirements
7. Information Architecture & Routing
8. Visual Design System
9. Data Model
10. Internal API & Adapter Contracts
11. **Demo Content & Asset Strategy**
12. Non-Functional Requirements
13. Project File Structure
14. Build Phases & Milestones
15. Acceptance Criteria & Test Plan
16. Appendices

---

# 1. INTRODUCTION & PURPOSE

## 1.1 Purpose
This document specifies a production-grade website and web application for an interior design firm operating in Indore, Madhya Pradesh — **built and operated at zero monetary cost**.

The system serves three simultaneous roles:

1. **A premium brand portfolio** that establishes credibility and design taste.
2. **An interactive design toolkit** that lets prospective clients visualise, cost, and compare interiors for their own home.
3. **A lead-generation and client-management platform** that converts visitors into consultations.

## 1.2 The Problem
Interior design purchases in India are high-consideration, family-decided, and trust-sensitive. Customers cannot mentally translate a 2-inch paint swatch into a 12-foot wall. They distrust opaque pricing. Decisions are made collectively over WhatsApp with screenshots. The firm currently has no way to capture intent at the inspiration stage.

## 1.3 The Differentiating Thesis
A single unbroken **Design → Estimate → Consult** journey:

```
Upload room photo  →  Select surfaces  →  Apply colours & materials
        ↓
Create 3–4 variants  →  Family compares & votes  →  Save to Mood Board
        ↓
Instant budget estimate  →  Book consultation (design + selections attached)
        ↓
Everything lands in the designer's WhatsApp, fully specified
```

No competitor in the Indore market offers this, and — critically — **none of it requires a paid service to build.**

## 1.4 The Zero-Cost Principle

This is not a compromised build. Modern free tiers are genuinely sufficient for a firm's first 1–3 years. What zero cost actually forces is a **better architecture**:

| Constraint | Forced design decision | Why it's actually better |
|---|---|---|
| No paid file storage | User room photos stay in the browser (IndexedDB) | Faster, and a real privacy guarantee you can advertise |
| No paid transactional email | Leads route through WhatsApp deep links | WhatsApp converts better than email in India anyway |
| No paid SMS/DLT | No phone OTP; Google sign-in or local profile | Removes the single biggest signup friction point |
| No paid database (initially) | Content lives in typed, version-controlled data files | Instant page loads, perfect SEO, no cold starts, free |
| No paid CDN/compute tier | Must ship a statically exportable app | Forces genuine performance discipline |

## 1.5 Definitions & Glossary

| Term | Meaning |
|---|---|
| **Demo Mode** | The default operating mode: all content from repo data files, all user writes to browser storage. No server, no database, no accounts. |
| **DB Mode** | An optional future mode using a real database. Specified but not built in Phase 1–3. |
| **Adapter** | A swappable implementation behind a TypeScript interface (storage, auth, leads, notifications, analytics). |
| **Visualiser** | The interactive canvas tool for recolouring/re-texturing room surfaces |
| **Variant** | One saved version of a room design |
| **Mask** | A per-surface alpha channel identifying which pixels belong to a wall/floor/etc. |
| **BHK** | Bedroom-Hall-Kitchen — standard Indian apartment sizing |
| **Carpet area** | Usable floor area in sq. ft., the Indian standard for interior quoting |
| **Tier** | Budget level: Essential / Standard / Premium / Luxury |
| **CC0** | Creative Commons Zero — public domain, no attribution required, commercial use permitted |

## 1.6 Localisation Context — Indore Specifics

- Currency **INR (₹)** with Indian digit grouping (`₹12,45,000`) via `Intl.NumberFormat('en-IN')`.
- Areas in **sq. ft.**
- Primary service area Indore; secondary Bhopal, Ujjain, Dewas, Pithampur, Mhow.
- Localities: Vijay Nagar, Bicholi Mardana, Super Corridor, Rau, Nipania, Bengali Square, Rajendra Nagar, AB Road, Khajrana, Scheme 54, Scheme 78, Silicon City, Talawali Chanda, Bypass Road, Sudama Nagar, Annapurna, Palasia, Saket Nagar, Mahalaxmi Nagar, Tilak Nagar.
- PIN validation for the `45xxxx` range with a soft warning outside it.
- Languages: **English** and **Hindi**, both first-class.
- Property types: builder-floor apartments, bungalows/kothis, duplexes, farmhouses on Mhow/Simrol road, clinics, retail fit-outs.
- Timezone fixed to `Asia/Kolkata`.

---

# 2. PRODUCT VISION & POSITIONING

## 2.1 Positioning Statement
> For homeowners in Indore planning a ₹3 lakh–₹50 lakh interior project, `{{FIRM_NAME}}` is an interior design studio that lets you *see and price your own home before you ever pay a rupee.*

## 2.2 Brand Feel
Premium, warm, editorial, uncluttered. An architecture monograph, not a furniture catalogue. Large photography, generous whitespace, restrained colour, confident typography, considered motion. **Never** carousel-heavy, badge-heavy, or gradient-heavy.

## 2.3 Success Metrics

| Metric | Target |
|---|---|
| Visitor → Visualiser engagement | ≥ 22% of homepage sessions |
| Visualiser → Saved design | ≥ 35% |
| Saved design → Estimate generated | ≥ 45% |
| Estimate → WhatsApp / booking submitted | ≥ 18% |
| LCP on mid-range Android over 4G | ≤ 2.0s |
| Lighthouse Performance (mobile) | ≥ 90 |
| Lighthouse Accessibility | ≥ 98 |
| **Monthly running cost** | **₹0** |

---

# 3. SCOPE DECISIONS — BUILD / DEGRADE / CUT

Rationale is given so the build agent does not re-litigate these decisions.

## 3.1 BUILD IN FULL — no cost implication

| # | Feature | Phase |
|---|---|---|
| F01 | Cinematic homepage with Ken Burns hero | 1 |
| F02 | Deep project portfolio with full case studies | 1 |
| F03 | Multi-axis portfolio filtering | 1 |
| F04 | Before/After comparison slider | 1 |
| F05 | Smart cost estimator, 4 tiers, full breakdown + PDF | 1 |
| F06 | Consultation booking with slot selection | 1 |
| F07 | WhatsApp deep-link integration throughout | 1 |
| F08 | Testimonials | 1 |
| F09 | "How We Work" transparency page | 1 |
| F10 | Designer profile pages | 1 |
| F11 | Design journal (MDX) | 1 |
| F12 | Interactive style quiz | 1 |
| F13 | Indian style + room library | 1 |
| F14 | Material & finish catalogue with colour matching | 1 |
| F15 | Local demo accounts + customer dashboard | 1 |
| F16 | Bilingual EN/HI | 1 |
| F17 | Mobile-first responsive + PWA | 1 |
| F18 | **2D Room Visualiser** (WebGL2) | 2 |
| F19 | Upload-your-room with assisted surface selection | 2 |
| F20 | Colour / material / pattern / finish swapping | 2 |
| F21 | Day–night lighting simulator | 2 |
| F22 | Variants + side-by-side comparison | 2 |
| F23 | Family sharing, voting & pinned comments | 2 |
| F24 | Mood board builder | 2 |
| F25 | Budget-aware material recommendations | 2 |
| F26 | Design → WhatsApp quote handoff with spec sheet | 2 |
| F27 | Approval workflow (demo data) | 2 |
| F28 | 2D floor planner with clearance checking | 3 |
| F29 | 3D walkthrough (three.js) | 3 |
| F30 | Click-to-segment surface detection (MobileSAM, in-browser) | 3 |
| F31 | Project progress tracker | 3 |
| F32 | AR furniture preview (`<model-viewer>`) | 3 |
| F33 | Client-side visual similarity search | 3 |
| F34 | Local content editor (`/studio-admin`) | 3 |

## 3.2 DEGRADED — feature kept, paid dependency removed

| Original | Paid dependency removed | Free replacement | Value retained |
|---|---|---|---|
| Phone OTP login | MSG91 + TRAI DLT (₹5,900 + per-SMS) | **Google Sign-In (free)** or **local demo profile**; guest mode for everything | ~95% — guest mode covers all tools anyway |
| WhatsApp Cloud API notifications | Meta Business verification + per-conversation fees | **`wa.me` click-to-chat deep links** with fully pre-filled, context-aware messages | ~80% — outbound automation lost, inbound conversion identical |
| Transactional email (Resend) | Paid above 3k/mo, needs domain verification | **`mailto:` with pre-composed body**, **client-generated `.ics`**, **"Add to Google Calendar" link**, optional free form-relay adapter | ~70% |
| Cloud file storage (R2/S3) | Free tier exists but needs a card | **IndexedDB** — user photos never leave the device | ~100% + a privacy selling point |
| Hosted Postgres | Free tiers exist but need signup | **Typed data files + IndexedDB**, behind a repository interface | ~100% for a content site |
| Google Maps | Requires a billing account | **Leaflet + OpenStreetMap tiles** (free, no key) | ~100% |
| Algolia search | Paid | **MiniSearch** client-side index | ~100% at this catalogue size |
| Upstash rate limiting | Needs signup | **Honeypot + time-trap + in-memory limiter** | Sufficient for a static site |
| Sentry / PostHog | Free tiers need signup | **Cloudflare Web Analytics** (free, unlimited, no card) + console error boundary | ~85% |
| Paid stock photography | ₹1.5–2.5 lakh shoot | **Curated Unsplash/Pexels set** (free commercial licence) | Placeholder quality; replaceable |
| PBR material textures | Paid texture libraries | **ambientCG + Poly Haven (CC0)** — real tile/wood/marble/fabric with normal maps | ~100% |

## 3.3 CUT — with reasoning

| Cut | Reason |
|---|---|
| **LiDAR room scanning** | Needs a native app; WebXR depth APIs unavailable on iOS Safari. Replaced by guided photo + manual dimensions (F19). |
| **Generative AI room redesign** | Every capable image model is paid per generation. Replaced by the manual visualiser, which produces *purchasable* results rather than hallucinated furniture — arguably better for a design firm. |
| **Online payments** | Adds PCI scope and gateway fees for near-zero benefit pre-revenue. Payment milestones are displayed read-only. |
| **Voice search** | Low usage, high Hindi-English code-switching cost. Accessibility served properly instead. |
| **Real-time supplier pricing** | No Indian supplier offers a public price API at any price. Replaced by a versioned internal rate card. |
| **Real brand shade names/codes** (Asian Paints, etc.) | Proprietary; reproducing them is a trademark risk. Replaced by an originally-named synthetic shade library (Section 11.5). |
| **Server-side CMS** | Needs a database. Replaced by a local content editor that exports JSON patches for commit (F34). |
| **Native mobile app** | PWA covers it. |

---

# 4. USERS, PERSONAS & JOURNEYS

## 4.1 Personas

**P1 — Ananya, 32, Homeowner (Primary).** Software professional, just took possession of a 3BHK in Nipania. Budget ₹8–12 lakh. Browses on mobile during commute, decides on laptop at night. Compares three firms. Needs to convince her husband and mother-in-law. **Wants:** to see what her actual flat could look like, and a price she can trust.

**P2 — Rajesh, 54, Renovator.** Bungalow in Vijay Nagar, renovating after 15 years. Budget ₹25 lakh+. Less comfortable with complex UI. **Wants:** before/after proof, warranty clarity, a phone number, Vastu respect.

**P3 — Meera, 28, Family Stakeholder.** Receives a WhatsApp link from Ananya. **Wants:** to view and vote without creating an account.

**P4 — Sunil, 45, Commercial Client.** Fitting out a 2,400 sq ft clinic on AB Road. **Wants:** commercial case studies, timeline certainty, GST-inclusive costing.

**P5 — Priya, Interior Designer (the firm).** **Wants:** enquiries arriving on WhatsApp already containing room photos, chosen palettes, budget, and locality.

## 4.2 Critical User Journey — must work end-to-end at ₹0

| Step | Screen | System behaviour | Cost |
|---|---|---|---|
| 1 | Homepage hero | "Design Your Room" CTA above the fold | ₹0 |
| 2 | `/visualiser` | Choose a demo room OR upload own photo | ₹0 — upload stays local |
| 3 | Canvas | Surfaces selectable; tap a wall | ₹0 — pre-authored masks in repo |
| 4 | Material drawer | Apply paint / tile / laminate; adjust finish, scale | ₹0 — CC0 textures |
| 5 | Lighting | Preview day / evening / warm night | ₹0 — shader uniform |
| 6 | Save | Variant A → IndexedDB | ₹0 |
| 7 | Duplicate | Variants B, C created | ₹0 |
| 8 | `/visualiser/compare` | 3-up, zoom-synced | ₹0 |
| 9 | Share | **Design serialised into a compressed URL fragment** → WhatsApp | ₹0 — no server needed (Section 6.3.8) |
| 10 | Family votes | Votes stored in the recipient's browser, returned via a reply link | ₹0 |
| 11 | Estimate | Estimator pre-filled from chosen materials | ₹0 — pure client-side maths |
| 12 | Spec sheet | PDF generated in-browser | ₹0 — `@react-pdf/renderer` |
| 13 | Book | Form → WhatsApp message with full spec + `.ics` download | ₹0 |
| 14 | Designer | Receives a complete brief on WhatsApp | ₹0 |

**This journey is acceptance test AT-01 and is the single most important requirement in this document.**

---

# 5. ZERO-COST ARCHITECTURE & TECHNOLOGY STACK

## 5.1 The Adapter Architecture — read this first

Every capability that *could* cost money is accessed through a TypeScript interface with a free default implementation. Upgrading later means writing one new adapter, not refactoring the app.

```
                     ┌─────────────────────────────┐
                     │   Application (UI + logic)   │
                     └──────────────┬──────────────┘
                                    │  depends only on interfaces
   ┌────────────┬──────────┬────────┴────┬──────────┬─────────────┐
   │ ContentRepo│ UserStore│  LeadSink   │ Notifier │  Analytics  │
   └─────┬──────┴────┬─────┴──────┬──────┴────┬─────┴──────┬──────┘
         │           │            │           │            │
  DEFAULT│           │            │           │            │
  (free) ▼           ▼            ▼           ▼            ▼
   StaticContent  IndexedDB   WhatsAppSink  LocalNotifier  CfAnalytics
   Repo (repo     UserStore   + MailtoSink  (toast +       (free) /
   data files)    (browser)   + ConsoleSink  .ics + cal    NoopAnalytics
                                             link)
         │           │            │           │            │
  FUTURE │           │            │           │            │
  (paid) ▼           ▼            ▼           ▼            ▼
   PrismaContent  PrismaUser  CrmSink /     ResendNotifier  PostHog
   Repo           Store       SheetsSink    WhatsAppCloud
```

**Hard rule:** no component, page, or hook may import a concrete adapter. They import only from `src/lib/adapters/index.ts`, which resolves the implementation from `src/config/runtime.ts`. Violating this is a build failure — enforce with an ESLint `no-restricted-imports` rule.

## 5.2 Core Stack — all free, all permissive licences

| Layer | Choice | Licence | Cost | Why |
|---|---|---|---|---|
| Framework | **Next.js 15** (App Router) | MIT | ₹0 | Must be configured to support `output: 'export'` |
| Language | **TypeScript 5.6+**, `strict: true` | Apache-2.0 | ₹0 | |
| Runtime | **Node.js 22 LTS** | MIT | ₹0 | |
| Styling | **Tailwind CSS v4** | MIT | ₹0 | With the Section 8 token theme |
| UI primitives | **shadcn/ui** (Radix) | MIT | ₹0 | Copied into the repo, not a dependency |
| Icons | **lucide-react** | ISC | ₹0 | |
| Animation | **Motion** (`motion/react`) | MIT | ₹0 | |
| Forms | **react-hook-form** + **zod** | MIT | ₹0 | |
| Client state | **Zustand** + custom undo/redo middleware | MIT | ₹0 | |
| Local persistence | **idb** (IndexedDB wrapper) | ISC | ₹0 | Designs, boards, uploads, votes |
| Search | **MiniSearch** | MIT | ₹0 | Client-side index over materials/projects/journal |
| Maps | **Leaflet** + **OpenStreetMap** tiles | BSD-2 / ODbL | ₹0 | Attribution required — include it |
| PDF | **@react-pdf/renderer** | MIT | ₹0 | Runs entirely client-side |
| Blog | **MDX** (`next-mdx-remote`) | MIT | ₹0 | Files in repo |
| Compression | **fflate** | MIT | ₹0 | For URL-fragment design sharing |
| Fonts | **Fraunces**, **Inter**, **Noto Sans Devanagari** via `@fontsource` | OFL-1.1 | ₹0 | Self-hosted, subset |
| i18n | **next-intl** | MIT | ₹0 | |
| Date | **date-fns** | MIT | ₹0 | |
| Sanitisation | **isomorphic-dompurify** | Apache-2.0 | ₹0 | |
| Colour maths | **culori** | MIT | ₹0 | OKLCH + CIEDE2000 |

## 5.3 Graphics Stack — all free

| Capability | Choice | Licence | Notes |
|---|---|---|---|
| Visualiser renderer | **Raw WebGL2** in a custom React host | — | Hand-written shaders (Section 6.3.4). No paid engine. |
| Overlay UI on canvas | **react-konva** | MIT | Selection outlines, handles, pins |
| Mask operations | Custom flood-fill + RLE codec in a **Web Worker** | — | No dependency |
| PBR textures | **ambientCG** + **Poly Haven** | **CC0** | Tiles, wood, marble, fabric, plaster — with normal + roughness maps. Public domain. |
| Segmentation (Phase 3) | **MobileSAM** via **ONNX Runtime Web** | **Apache-2.0** | ~10 MB quantised encoder. Click-to-segment. Legally clean for commercial use — unlike most ADE20K checkpoints. |
| Background removal | **@imgly/background-removal** | AGPL-3.0 for the lib; **use `rembg`-style U²-Net ONNX directly instead** | Avoid AGPL: run a **U²-Net / ISNet ONNX model (Apache-2.0)** in a worker |
| 3D (Phase 3) | **three.js** + **@react-three/fiber** + **drei** | MIT | |
| 3D furniture models | **Poly Pizza** (CC0), **Khronos glTF Sample Assets** (CC0/CC-BY), **Sketchfab CC0 filter** | CC0 | Must be authored at true real-world scale |
| AR (Phase 3) | **`<model-viewer>`** | Apache-2.0 | Native Quick Look / Scene Viewer, zero infra |
| Image derivatives | **sharp** at build time | Apache-2.0 | Generates AVIF/WebP + BlurHash into `/public` |
| Blur placeholders | **blurhash** | MIT | Precomputed, committed in the manifest |

## 5.4 Hosting — free *and* commercially permitted

This distinction matters and is frequently got wrong:

| Host | Free tier | **Commercial use allowed on free tier?** | Verdict |
|---|---|---|---|
| **Cloudflare Pages** | Unlimited bandwidth, 500 builds/mo, 100k req/day on Functions | **Yes** | **PRIMARY — use this** |
| **GitHub Pages** | 100 GB/mo bandwidth, static only | **Yes** | **FALLBACK — pure static export** |
| **Netlify** | 100 GB/mo | Yes | Acceptable alternative |
| Vercel Hobby | Generous | **No — Hobby is non-commercial per Vercel ToS** | **Do not use for the live firm site.** Fine for preview builds only. |

**Deployment requirement:** the application **must build and function correctly under `next build` with `output: 'export'`**. This guarantees it can be hosted on any free static host forever, with no vendor lock-in and no compute bill. Consequences the build must respect:

- No Next.js Route Handlers in the critical path (Demo Mode needs none).
- `next/image` runs with `unoptimized: true`; image optimisation happens at **build time** via a `sharp` script instead.
- Dynamic OG images are **pre-generated at build time** into `/public/og/*.png` rather than rendered on request.
- No middleware-dependent logic; i18n routing uses static per-locale paths.

**Domain:** launch on the free `*.pages.dev` subdomain. A custom domain (~₹900/yr) is the *only* optional future expense in this entire specification, and Cloudflare charges nothing to attach it.

## 5.5 Free Optional Integrations (all no-card, all adapter-gated, all default-off)

| Service | Free tier | Adapter | Purpose |
|---|---|---|---|
| **Cloudflare Web Analytics** | Unlimited, free forever, no card, privacy-first | `Analytics` | Traffic + funnel |
| **Google OAuth** | Free, unlimited | `UserStore` | Optional real sign-in |
| **Google Apps Script Web App** | Free, unlimited | `LeadSink` | Writes leads to a Google Sheet the firm already owns |
| **Formspree / Web3Forms** | 50–250 submissions/mo free | `LeadSink` | Email relay without a server |
| **Cloudflare Turnstile** | Free, unlimited | `BotGuard` | Stronger than honeypot if wanted |
| **Sentry** | 5k errors/mo free | `ErrorReporter` | Optional |

**All must be absent-safe:** with no keys configured, the app runs fully, logs the intended action, and shows the user a correct outcome. The entire product must work with a completely empty `.env`.

## 5.6 Quality Tooling — free

**Vitest** + **React Testing Library** · **Playwright** · **ESLint 9** flat config + `eslint-plugin-jsx-a11y` · **Prettier** + `prettier-plugin-tailwindcss` · **axe-core** · **size-limit** · **Husky** + **lint-staged** · **GitHub Actions** (2,000 free minutes/mo on private repos, **unlimited on public repos**) · **Lighthouse CI**.

---

# 6. FUNCTIONAL REQUIREMENTS

> **Convention:** `FR-<module>-<n>`. Priority: **M** = Must (Phase 1), **S** = Should (Phase 2), **C** = Could (Phase 3).

---

## 6.1 MODULE A — Homepage & Marketing Shell

### FR-A-01 — Cinematic Hero *(M)*
**Zero-cost adaptation:** no licensed stock video. The hero is a **Ken Burns treatment** — a slow, continuous scale-and-pan over a high-resolution still, cross-fading between three curated images on a 9-second cycle.

**AC:**
- Implemented with CSS `transform` + `opacity` only, GPU-composited, **no JavaScript animation loop**.
- Images are AVIF (WebP fallback), preloaded for the first frame only with `fetchpriority="high"`.
- `<h1>` contains the positioning line and the city.
- Two CTAs visible without scrolling at 360×640: **"Design Your Room"** → `/visualiser`, **"Book Free Consultation"** → `/consultation`.
- Dark gradient scrim for text legibility; contrast verified ≥ 4.5:1 against the lightest frame.
- `prefers-reduced-motion` → single static image, no cross-fade, no pan.
- On `saveData` or `effectiveType` slower than `4g` → single static image, other frames not fetched.
- LCP element ≤ 180 KB.
- *Optional later:* if the firm supplies a CC0 or self-shot video, `HeroMedia` accepts a `videoSrc` prop and switches mode with no other change.

### FR-A-02 — Homepage Section Sequence *(M)*
Render in exactly this order:
1. Hero (FR-A-01)
2. Positioning statement + credentials strip (`{{YEARS}}` years · `{{PROJECTS_COUNT}}` homes · service areas)
3. Featured Projects — 3 large editorial cards
4. Before/After showcase — one flagship transformation (FR-C-01)
5. "What We Do" — 4 service tiles
6. Style Quiz entry (FR-G-01)
7. Cost Estimator entry with a live mini-widget (drag a carpet-area slider, see a range update instantly)
8. Animated statistics counter
9. Testimonials — 3 cards
10. "How We Work" — 5-step process timeline
11. Designer profiles — 4 portraits
12. Areas served — Leaflet/OSM map + locality links
13. From the Journal — 3 latest posts
14. Final consultation form, inline

**AC:** Each below-fold section lazy-hydrated. Homepage initial JS ≤ 170 KB gzipped.

### FR-A-03 — Global Navigation *(M)*
**AC:**
- Desktop: transparent over hero → solid `--surface` with hairline border after 80px scroll, spring transition.
- Items: Projects · Services · Visualiser · Materials · Estimate · Studio · Journal · **[Book Consultation]** · Language (EN/हिं) · Account.
- "Projects" and "Services" open thumbnail-led mega-menu panels.
- Mobile: hamburger → full-screen sheet with staggered entrance; persistent bottom bar with **Call**, **WhatsApp**, **Book**.
- Full keyboard traversal, visible focus rings, `Esc` closes, focus trapped in the mobile sheet and returned to the trigger on close.
- `aria-current="page"` on the active item.

### FR-A-04 — Global Footer *(M)*
Sitemap columns, address, `tel:` link, WhatsApp link, `mailto:` link, GSTIN placeholder, social links, newsletter form (stores locally + optional `LeadSink`), service-area links for local SEO, legal links, **OpenStreetMap attribution**, and image-credit link (Section 11.8).

### FR-A-05 — Persistent Conversion Rail *(M)*
Floating WhatsApp FAB on all pages. After 25s or 60% scroll on a project page, one non-blocking slide-up: "Like this style? Get a free estimate for your home." Dismissal remembered 7 days in `localStorage`.

---

## 6.2 MODULE B — Portfolio & Case Studies

### FR-B-01 — Project Index *(M)*
**AC:**
- Editorial/masonry grid, 3 / 2 / 1 columns.
- Card: hero image, name, locality, property type + BHK, style tag, budget band.
- Hover: image scale 1.0→1.06 over 700ms, caption slides up.
- "Load more" button always present (never infinite-scroll-only — accessibility).
- Sort: Latest / Budget ↑ / Budget ↓ / Largest area.
- **Statically generated** — all 24 demo projects pre-rendered at build time.

### FR-B-02 — Multi-Axis Filtering *(M)*
All facets combinable and reflected in the URL query string.

| Facet | Values |
|---|---|
| Locality / City | Indore localities, Bhopal, Ujjain, Dewas |
| Property type | Apartment, Villa/Bungalow, Duplex, Farmhouse, Office, Clinic, Retail, Restaurant |
| Size | 1BHK, 2BHK, 3BHK, 4BHK+, <1000 sqft, 1000–1800, 1800–3000, 3000+ |
| Room type | Living, Master Bedroom, Kids Room, Modular Kitchen, Pooja Room, Balcony, Foyer, Bathroom, Study/WFH, Utility, Parents' Room, Home Temple Wall |
| Style | Modern Indian, Contemporary, Minimal, Luxury, Traditional Indian, Indo-Modern Fusion, Scandinavian, Bohemian, Industrial, Coastal, Rustic, Art Deco |
| Budget band | <₹3L, ₹3–7L, ₹7–15L, ₹15–30L, ₹30L+ |
| Nature | New / Renovation |
| Segment | Residential / Commercial |
| Special | Vastu-aligned, Compact-home, Joint-family |

**AC:**
- Filtering is **client-side over the pre-loaded project index** (a ~40 KB JSON manifest) — instant, zero server cost.
- Active filters as dismissible chips + "Clear all".
- Result count announced via `aria-live="polite"`.
- Zero results → curated closest matches, naming the relaxed facet.
- Filter state survives navigating into a project and back.

### FR-B-03 — Project Case Study *(M)*
Route: `/projects/[slug]`. Render all present sections; never render an empty heading.

1. Full-bleed hero with the title overlaid
2. **Fact strip:** Locality · Property type · Carpet area · Style · Duration · Budget band · Year · Lead designer
3. **The Brief**
4. **The Challenge** — 2–4 specific constraints
5. **Our Solution**
6. **Before & After** slider (FR-C-01)
7. **Floor plan** — zoomable SVG with room labels
8. **Gallery** — lightbox, keyboard-navigable, captioned
9. **Video walkthrough** — *demo mode:* an auto-advancing image sequence with a scrub bar, since no video exists. Component accepts a real `videoSrc` later and switches to a click-to-load facade (no third-party JS until clicked).
10. **Materials used** — chips linking into the catalogue
11. **"Get this look"** — seeds the visualiser with this project's palette
12. **Client testimonial**
13. **Designer note**, signed and linked
14. **Similar projects** — 3 matched on style + budget + property type
15. **Sticky CTA** past 40% scroll

**AC:** `Article` + `CreativeWork` JSON-LD. OG image **pre-generated at build**. Lightbox: arrows navigate, `Esc` closes, focus trapped, swipe on touch. Reading progress indicator.

### FR-B-04 — "Get This Look" Handoff *(S)*
Opens `/visualiser?preset=<projectSlug>` with the project's wall colour, flooring, and accent materials pre-applied to a matching demo room of the same type.

---

## 6.3 MODULE C — The Room Visualiser *(headline feature)*

### FR-C-01 — Before/After Slider *(M)*
Reusable across the site.

**AC:**
- Draggable divider; arrow keys when the handle is focused (`role="slider"`, `aria-valuenow`).
- Pointer Events — mouse, touch, pen.
- Modes: `before-after`, `render-vs-built`, `day-vs-night`, `essential-vs-premium`, `layout-old-vs-new`.
- Horizontal or vertical orientation.
- Side labels fade as the divider approaches.
- Optional one-time auto-reveal on scroll into view; respects reduced motion.
- Both images preloaded before interactivity; skeleton until then.

### FR-C-02 — Visualiser Shell & Room Sources *(S)*
Route: `/visualiser`

Three entry points:
1. **Demo room** — gallery of **20 pre-masked rooms** (Section 11.6), filterable by room type and style.
2. **Upload photo** — JPEG/PNG/WebP/HEIC, ≤ 12 MB. **The file never leaves the browser.** EXIF-oriented, downscaled to max 2400px long edge, stored in IndexedDB.
3. **Continue a saved design** — from IndexedDB.

**AC:**
- MIME validated by magic bytes, not extension.
- HEIC converted client-side (`heic2any`, MIT).
- Guided capture helper: stand in a corner, include the floor and ceiling meeting the wall, avoid ultra-wide, daylight preferred.
- A prominent, honest privacy line: **"Your photo stays on your device. It is never uploaded to any server."** — this is true and is a genuine competitive advantage.

### FR-C-03 — Surface Identification *(S / C)*

**Tier 1 — Assisted manual (Phase 2, always available, zero cost):**
- Tools: **Magic Wand** (flood-fill, adjustable tolerance), **Polygon Pen**, **Brush/Eraser** (adjustable radius), **Rectangle**.
- Each region assigned a surface type: Wall, Accent Wall, Ceiling, Floor, Kitchen Cabinet (upper/lower), Wardrobe, Countertop, Backsplash, Curtain, Upholstery, Wall Panel, Door, Window Frame, Bathroom Tile, Rug, Lighting Fixture.
- Masks stored run-length-encoded at image resolution; edges feathered 1.5px.
- All mask maths in a **Web Worker**; the UI never blocks.

**Tier 2 — Click-to-segment (Phase 3, still zero cost):**
- **MobileSAM** (Apache-2.0) via ONNX Runtime Web, lazy-loaded only on user opt-in, run in a worker with determinate progress.
- Interaction: the user **clicks a point on a wall** and the model returns that surface's mask, which they accept or refine with Tier 1 tools. This is a better fit than whole-scene segmentation and uses a 10 MB model instead of a 100 MB one.
- Graceful fallback to Tier 1 with a clear message if WASM/WebGPU is unavailable or inference exceeds 20s.
- Model file served from the app's own origin (committed to `/public/models/`), not a third-party CDN.

### FR-C-04 — Material & Colour Application (Rendering Core) *(S)*

**This is the technical heart of the product. A naive `fill` with `globalCompositeOperation` is not acceptable — it produces flat, fake results.**

**Mandated algorithm — single WebGL2 fragment shader pass per surface, composited back-to-front:**

1. **Luminance extraction.** Convert the source region to linear light; extract luminance `L`, preserving all shading, shadows, highlights, and surface texture.
2. **Normalisation.** Compute median luminance `L̄` over the mask. Build shading ratio `S = L / L̄`, clamped to `[0.25, 2.2]`.
3. **Paint (solid colour).** Convert the target to OKLCH. Output `OKLCH(L_target × S, C_target × f(S), H_target)` where `f(S)` mildly desaturates extreme highlights and shadows. **This step is what makes a recolour read as real paint rather than a sticker.**
4. **Material (tile, wood, marble, laminate, fabric).**
   - A **perspective quad** per surface — auto-derived from the mask's convex hull plus a vanishing-point estimate, adjustable via 4 corner handles.
   - Tile the CC0 texture in surface space at its real-world `textureScaleCm`; apply the homography to screen space.
   - Composite `result = texture × S`, then blend the original image's high-frequency detail back at 12–20% to retain grain.
   - Apply the texture's **normal map** against the inferred light direction for grout relief and wood grain.
5. **Finish / sheen.** `finish ∈ {matte, eggshell, satin, semi-gloss, high-gloss, textured}` modulates a specular term from the top decile of `S`. High-gloss adds a subtle blurred reflection.
6. **Edge handling.** 1.5px feather plus an ambient-occlusion darkening term at surface junctions (wall/floor, wall/ceiling) to defeat the "cut-out" look.

**Performance target: 60 fps while dragging a colour slider, on a mid-range Android at 1080p.**

**User controls:**

| Control | Type | Range |
|---|---|---|
| Colour | Palette + OKLCH picker + shade search | Full synthetic shade library |
| Material | Catalogue picker | Section 6.6 |
| Pattern | Picker | Plain, geometric, floral, stripe, damask, textured, chevron, herringbone, brick-lay |
| Pattern scale | Slider | 25%–400% |
| Pattern rotation | Slider | 0°–360°, snap 15° |
| Texture intensity | Slider | 0–100% |
| Finish | Segmented | matte → high-gloss |
| Tile layout | Segmented | straight, staggered, herringbone, basketweave, diagonal |
| Grout colour & width | Colour + slider | Tiles only |
| Opacity / blend | Slider | Wallpaper layering |

### FR-C-05 — Lighting Simulator *(S)*
**AC:**
- Daylight presets: **Morning**, **Midday**, **Afternoon**, **Golden hour**, **Evening**, **Night**.
- Independent artificial layer: **Warm 2700K**, **Neutral 4000K**, **Cool 6500K**, plus **Cove**, **Pendant**, **Spotlight**, **Ambient/profile** — each with an intensity slider and a draggable position.
- Implementation: Planckian-locus colour-temperature RGB gain applied post-composite, plus a directional gradient whose azimuth derives from a user-set **window direction** (N/NE/E/SE/S/SW/W/NW) and the chosen time.
- A **Day / Night** quick toggle produces an instant A/B via FR-C-01.
- Must be a **shader uniform change**, not a scene re-render.

### FR-C-06 — Editor Chrome *(S)*
- **Undo/Redo** ≥ 50 steps, `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z`, with a visible history list.
- **Reset room** with confirmation.
- **Layer panel** — per-surface visibility, rename, reorder, delete.
- **Zoom & pan** — 50%–800%, scroll/pinch, space-drag, "fit to screen".
- **Split view** — original vs edited.
- **Autosave** every 20s to IndexedDB, with a "Saving…/Saved" indicator.
- **Touch** — one-finger pan, two-finger pinch/rotate, long-press context menu.
- **First-run coach marks** — 5 steps, skippable, persisted.
- **`?` opens a keyboard-shortcuts panel.**

### FR-C-07 — Variants & Comparison *(S)*
- "Duplicate as new variant" forks material assignments, preserving masks.
- Variants named, renameable, colour-coded.
- `/visualiser/compare` — 2/3/4-up grid with **synchronised pan and zoom**.
- **Difference summary** table between any two variants ("Wall: Ivory Mist → Sage Whisper; Floor: unchanged").
- Mark **Favourite**.
- **"Combine"** — pick elements across variants ("walls from B, floor from C") and attach that instruction to the enquiry.

### FR-C-08 — Sharing, Voting & Comments — *serverless design* *(S)*

**The zero-cost challenge:** sharing normally needs a server. Here is the mandated solution.

**Share mechanism — URL fragment encoding:**
1. Serialise the design state to a compact binary form: material IDs (2 bytes each), colour values (3 bytes), slider values (1 byte), lighting config, and **mask reference** (for demo rooms, just the template ID — masks already exist in the app).
2. Compress with `fflate` deflate, encode Base64URL.
3. Produce `https://<host>/d#<payload>` — **the fragment is never sent to any server**, so this works on pure static hosting and is inherently private.
4. Typical payload for a demo-room design: **300–600 bytes**. Well within URL limits.
5. **User-uploaded photos cannot be fragment-encoded.** For those, the share sheet offers: (a) **"Share as image"** — render to PNG/JPEG and use `navigator.share({ files })` to send the picture directly through WhatsApp, which is what users actually do anyway; and (b) **"Share design settings"** — a fragment link that reproduces the palette on a matching demo room.

**Voting & comments — reply-link model:**
- A recipient opening `/d#...` can vote (👍 / ❤️ / 👎) per variant and leave comments, including **pinned comments anchored to image coordinates**.
- Their input is stored locally, then encoded into a **"Send feedback" reply link** back to the original sender (or a pre-filled WhatsApp message containing a compact feedback code).
- The original owner opens the reply link; their app merges the incoming votes and comments into the local design record, showing an aggregated tally with voter names.
- Merge is idempotent — the same feedback applied twice does not double-count (each feedback payload carries a UUID).
- Rate-limiting is unnecessary since there is no server to protect.

**AC:** Share sheet offers WhatsApp first, then copy link, then `navigator.share`, then "download image". `/d` route is `noindex`. Guests never need an account.

> **Upgrade note:** when a backend is eventually affordable, `ShareAdapter` swaps to server-issued tokens with no UI change.

### FR-C-09 — Export & Handoff *(S)*
- **Download image** — PNG at source resolution with a discreet `{{FIRM_NAME}}` watermark, plus a 1200×630 share card.
- **Download spec sheet (PDF)** — one page: the render, a surface-by-surface material table (name, code, brand placeholder, finish), estimated material cost band, date, firm contact block. Generated **in-browser** with `@react-pdf/renderer`.
- **Send to WhatsApp** — `wa.me` with a pre-filled message plus the fragment link, or the rendered image via `navigator.share`.
- **"Request a quote for this design"** — the primary CTA. Opens the consultation flow with the design attached; the resulting WhatsApp message contains a human-readable specification of every surface and material chosen.

### FR-C-10 — Object-Level Refinement Instructions *(S)*
With a surface or region selected, attach a free-text instruction from chips or custom input: *"Keep this sofa"*, *"Change only the curtains"*, *"Add wooden wall panelling"*, *"Remove this chair"*, *"Larger TV unit"*, *"Simplify the ceiling"*, *"More storage here"*. Instructions pin to image coordinates, list in a side panel, render as numbered annotation markers on the exported image, and are transcribed into the WhatsApp enquiry. **These are designer briefs, not AI triggers.**

---

## 6.4 MODULE D — Mood Boards

### FR-D-01 — Mood Board Builder *(S)*
Route: `/moodboards/[id]` — works for guests, persisted to IndexedDB.

**AC:**
- Free-form canvas; items draggable, resizable (shift to constrain), rotatable, z-orderable.
- Item types: **image** (from the demo library or a local upload), **colour swatch**, **material chip**, **text note**, **saved design render**, **shape/divider**.
- Per-item: opacity, corner radius, shadow, border, **background removal** (U²-Net ONNX in a worker, lazy-loaded, Apache-2.0).
- Canvas: snap-to-grid, alignment guides, distribute/align, background colour or CC0 paper texture.
- **Palette extraction** — pick any image, extract 5 dominant colours (median-cut, implemented locally), add as swatches.
- 5 starting templates: Grid, Editorial, Palette-led, Room-by-room, Single-hero.
- Export: PNG, PDF, and a fragment share link.
- Autosave; version history with restore (last 10, in IndexedDB).

---

## 6.5 MODULE E — Cost Estimator

### FR-E-01 — Multi-Step Estimator *(M)*
Route: `/estimate`. Stepped wizard, progress indicator, back navigation, state in `sessionStorage`.

**Inputs:**

| Step | Fields |
|---|---|
| 1. Property | City (default Indore), locality, property type, new vs renovation, possession date |
| 2. Size | BHK, carpet area (sq ft), bathrooms, balconies |
| 3. Scope | Per-room checkboxes; full home vs selected rooms |
| 4. Kitchen | Layout (L/U/Parallel/Straight/Island), shutter material, countertop, chimney/hob, tall unit |
| 5. Storage | Wardrobe count + running feet per bedroom, openable/sliding, finish, loft |
| 6. Extras | False ceiling (sqft), TV unit, crockery unit, pooja unit, study table, beds, sofa, dining, painting, electrical, plumbing, civil |
| 7. Quality | Essential / Standard / Premium / Luxury, with a comparison table |
| 8. Style & Vastu | Preferred style; Vastu preference (Strict / Basic / None) |
| 9. Contact | Name, phone (+91 validated), email, preferred contact method, honeypot |

**Outputs:**
- **Headline range** `₹X,XX,XXX – ₹Y,YY,YYY` — never a single number
- **Room-wise breakdown** with low/high
- **Category breakdown:** Modular, Loose furniture, False ceiling, Painting, Electrical, Civil, Décor, Design fee, Execution/PM
- **GST** as a separate line
- **Timeline** in weeks with a 5-stage bar
- **EMI indication** — reducing balance at a configurable rate over 12/24/36/48 months, clearly labelled *indicative, subject to lender approval*
- **Optional upgrades** with delta pricing ("Quartz countertop: +₹38,000")
- **What's not included** — explicit list (Appendix 16.4)
- **Live tier switching** — changing tier recomputes everything instantly and **highlights exactly which line items moved**
- **Actions:** Download PDF (in-browser) · Send to WhatsApp · Copy summary · Save locally · **Book a consultation** (pre-filled)

**AC:**
- All pricing derives from a versioned `PriceBook` data file (`src/data/pricebook/2026.09.ts`). **No prices hardcoded in components.**
- **Calculation is pure, synchronous, client-side TypeScript** in `src/lib/pricing/` — no network call, no server, fully unit-testable, ₹0.
- Every estimate saved locally with its `priceBookVersion`, so historic estimates stay reproducible.
- Permanent disclaimer: *"This is an indicative range based on typical Indore projects. Your final quotation follows a site visit."*
- Mobile: one question group per screen, large targets, `inputmode="numeric"` on numeric fields.
- Completable in under 90 seconds.

### FR-E-02 — Budget-Aware Recommendations *(S)*
- Every material carries a `tier` and a `pricePerUnit` band.
- When a budget is known, the material picker shows in-budget items first, badges over-budget items with the delta, and offers **"Similar, within budget"** via a `substituteFor` chain (e.g. Imported Marble → Indian Marble → Marble-look Vitrified Tile → High-gloss Laminate).
- A **live budget meter** in the visualiser tracks running material cost against target, with under / near / over colour states.
- Toggle: "Only show materials I can afford."

---

## 6.6 MODULE F — Material & Style Libraries

### FR-F-01 — Material Catalogue *(M)*
Routes: `/materials`, `/materials/[slug]`

**Categories:** Paint · Wallpaper · Wall texture · Veneer · Laminate · Acrylic · PU finish · Glass · Marble · Granite · Quartz · Ceramic tile · Vitrified tile · Wooden flooring · Vinyl/SPC · Upholstery · Curtain fabric · Metal finish · Kitchen hardware · Wardrobe hardware · Lighting · Sanitaryware · Countertop · Handles & profiles

**Each record shows:** Name · Brand *(placeholder)* · Product/shade code · Swatch + large texture · Colourways · Finish · Recommended surfaces and rooms · Durability · Maintenance · Water/heat resistance · Price band per unit · Warranty · Availability · Tier · Sustainability note · Related projects · **"Try in visualiser"**

**AC:**
- Faceted filtering: category, colour family (visual colour-wheel picker), finish, tier, room suitability, brand, maintenance, availability.
- **Tonality filters:** warm / cool / neutral / bold / pastel / earthy / jewel.
- **"Match a colour"** — upload an image or use an eye-dropper → nearest catalogue shades ranked by **CIEDE2000 ΔE**, computed client-side with `culori`. Free, instant.
- Comparison tray — up to 4 materials, side-by-side spec table.
- Typo-tolerant search via MiniSearch.
- **All textures are CC0** (ambientCG / Poly Haven) and are the *actual* textures the visualiser renders, so the catalogue and the tool are consistent.

### FR-F-02 — Style Library *(M)*
Routes: `/styles`, `/styles/[slug]`

Modern Indian · Contemporary · Minimal · Luxury · Traditional Indian · Indo-Modern Fusion · Scandinavian · Bohemian · Industrial · Coastal · Rustic · Art Deco · Japandi · Vastu-Aligned · Budget Apartment · Premium Villa

Each: hero imagery, defining characteristics, signature palette (clickable → visualiser), typical materials, typical budget band, best-suited rooms, 4–6 example projects, "Design a room in this style".

### FR-F-03 — India-Specific Room Library *(M)*
Route: `/rooms/[slug]`

Living Room · Master Bedroom · Kids'/Study Room · Parents' Bedroom · Modular Kitchen · **Pooja Room / Home Temple Wall** · Balcony · Foyer with shoe storage · Indian Bathroom · Utility/Wash area · WFH nook · Joint-family living room · Compact 1BHK · 2BHK · 3BHK · Dining · Guest room · Servant room

Each: India-specific design considerations, typical dimensions, storage strategies, material recommendations, cost band, 6+ examples, common mistakes, and a room-specific estimator entry.

---

## 6.7 MODULE G — Engagement & Discovery

### FR-G-01 — Interactive Style Quiz *(M)*
- 8 **image-choice** questions (not text), 4 photographs each.
- Covers: colour temperature, material warmth, ornamentation tolerance, storage priority, entertaining frequency, natural-light preference, pattern appetite, budget comfort.
- Card-stack transitions, progress dots, back allowed.
- Result: a named profile (e.g. "Warm Indo-Modern") with description, palette, 3 matching projects, 5 recommended materials, CTAs into the visualiser and estimator.
- **Scoring is a pure client-side vector-match function** — free, instant, testable.
- Result shareable via a URL containing the encoded answer vector.
- Email capture **optional and shown only after the result** — never gated.

### FR-G-02 — Visual Similarity Search *(C)*
Route: `/inspiration/search`

**Zero-cost approach — no embedding API, no vector database:**
- At **build time**, compute a compact perceptual descriptor for each demo project image: a 64-bit **perceptual hash (pHash)** plus a **5-colour palette in OKLab** plus coarse **edge-density and contrast statistics**. Commit this as a ~30 KB manifest.
- At **runtime**, the user's uploaded inspiration image is processed **in the browser** with the identical descriptor function, then matched by weighted distance against the manifest.
- Returns: similar completed projects, the nearest palette from the shade library, comparable materials in three price tiers, and designers working in that style.
- Accuracy is materially lower than CLIP embeddings but is genuinely useful for palette-and-mood matching, which is what users actually want here.
- The uploaded image never leaves the device.
- Always ends with **"Get this look in your budget"**.

### FR-G-03 — Design Journal *(M)*
Routes: `/journal`, `/journal/[slug]`

- MDX with custom components: `<CostTable>`, `<BeforeAfter>`, `<MaterialCard>`, `<Callout>`, `<Checklist>`, `<FAQ>`.
- Categories, tags, author, read time, publish date, TOC with scroll-spy.
- **12 fully-written seed articles** (Section 11.7).
- `Article` + `FAQPage` JSON-LD. RSS at `/journal/rss.xml`.
- Related posts and an inline CTA at 60% scroll.

### FR-G-04 — Vastu Preference Mode *(S)*
- Selector in the estimator, visualiser, and consultation form: **Strict / Basic / Not required**.
- When Strict or Basic, an advisory panel covers kitchen position, pooja room, bed direction, entrance, study desk, mirrors, water position, staircase, and directional colours — requires the user to input the **main entrance facing direction**.
- Rendered as informational cards with a **mandatory disclaimer**: *"Vastu guidance is offered as a design preference to be discussed with your designer. It is not an engineering, structural, or religious certification."*
- Projects taggable `vastuAligned` and filterable.
- Preference carried into the WhatsApp enquiry.

---

## 6.8 MODULE H — Consultation, Leads & WhatsApp

### FR-H-01 — Consultation Booking *(M)*
Route: `/consultation`

**Types:** Video call (45 min) · Phone call (20 min) · Studio visit (60 min) · Home visit (90 min) · Site measurement (120 min) · Material selection (120 min)

**Fields:** Name · Phone (+91, 10-digit validated) · Email · City · Locality · PIN code · Property type · Size (BHK + sqft) · New/renovation · Budget band · Possession date · Preferred date + two alternate slots · Preferred contact method · Floor plan attach · Inspiration images attach · Notes · Vastu preference · Consent checkbox

**Zero-cost submission pipeline — this is the critical adaptation:**

On submit, in order:
1. **Build a complete, human-readable enquiry summary** — every field, plus a full specification of any attached design variants, materials chosen per surface, the estimate range, and refinement instructions.
2. **Persist the enquiry locally** so the user has a permanent record in their dashboard.
3. **Generate a reference number** locally (`IND-YYMM-####` from a timestamp + checksum).
4. **Open WhatsApp** via `wa.me/{{WHATSAPP}}?text=<encoded summary>` in a new tab. This is the primary delivery channel and it is free, instant, and has near-100% read rates in India.
5. **Offer a `mailto:` fallback** with the same body pre-composed, for users without WhatsApp.
6. **Offer "Download enquiry as PDF"** so nothing is ever lost.
7. **Offer "Add to calendar"** — a client-generated `.ics` download plus a Google Calendar template URL (both free, no API).
8. **Optionally** fire the configured `LeadSink` (Google Sheets Apps Script or a free form relay) if keys exist — silently no-op if not.

**AC:**
- Slot picker shows availability from a `designers.availability` data file; past and blocked slots disabled; timezone `Asia/Kolkata`.
- Home visit / site measurement restricted to serviceable PIN codes; outside that, offer video with a clear explanation.
- Attached designs, estimates, and mood boards referenced by ID and **transcribed in full** into the message body.
- Bot protection: **honeypot field + minimum-time-to-submit trap + simple client throttle**. No paid service.
- Success page: reference number, what happens next, the designer's photo and name, and a WhatsApp button.
- If the user abandons after entering a phone number, save a local draft and offer to resume on return.

> **Honest limitation, stated plainly:** without a backend, the firm receives enquiries only when the user completes the WhatsApp or email hand-off. The optional free Google Sheets `LeadSink` closes this gap at zero cost and should be configured as soon as the firm has a Google account — it is 20 lines of Apps Script and is documented in `docs/LEAD-SINK-SETUP.md`.

### FR-H-02 — WhatsApp Integration *(M)*
WhatsApp is the primary channel, implemented entirely through free click-to-chat deep links.

**AC:**
- Global FAB and mobile bottom-bar button on every page.
- **Context-aware pre-filled messages**, for example:
  - Project page: *"Hi, I saw the {{PROJECT_NAME}} project and I'd like something similar for my {{BHK}} in {{LOCALITY}}, Indore."*
  - Estimate result: *"Hi, I generated an estimate of ₹X–₹Y for my {{BHK}} ({{SQFT}} sqft, {{TIER}} finish). Can we discuss?"*
  - Visualiser: *"Hi, here's the design I created: {{FRAGMENT_URL}}"* plus a full text specification of surfaces and materials.
  - Material page: *"Hi, is {{MATERIAL_NAME}} available, and what does it cost per sqft?"*
- Messages URL-encoded correctly, tested with Devanagari and the ₹ symbol.
- Number sourced from `site.ts` only.
- Desktop opens `web.whatsapp.com`; mobile opens the app — detect and route correctly.
- Every share action offers WhatsApp first.
- A `WhatsAppProvider` interface exists so Cloud API templates can be added later without touching call sites.

---

## 6.9 MODULE I — Accounts & Dashboard

### FR-I-01 — Authentication *(M)*

**Zero-cost model — three tiers, default is tier 1:**

| Tier | Mechanism | Cost | Default |
|---|---|---|---|
| 1. **Guest** | No account. All tools fully usable. Data in IndexedDB, keyed by a locally generated `guestKey`. | ₹0 | **Yes** |
| 2. **Local profile** | User sets a display name and optional phone/email, stored locally. Enables named votes, a personalised dashboard, and export/import of their data as a JSON file. | ₹0 | Optional |
| 3. **Google Sign-In** | Auth.js + Google OAuth. Free, unlimited, no card. Enables cross-device sync *only if* DB Mode is later enabled. | ₹0 | Optional, off |

**AC:**
- **Every feature works without any account.** Nothing is gated.
- A non-blocking prompt on first save suggests setting a profile, with "Continue as guest" always available and equally prominent.
- **Export my data** — downloads all designs, boards, estimates, and enquiries as a single JSON file. **Import** restores it on another device. This is the zero-cost substitute for cloud sync, and it is honest about what it is.
- Roles exist in the type system (`CLIENT`, `DESIGNER`, `ADMIN`) for the demo dashboard and for future DB Mode.
- No password is ever stored. No phone OTP (removes the DLT cost entirely).

### FR-I-02 — Dashboard *(M)*
Route: `/dashboard`

| Section | Source in Demo Mode |
|---|---|
| Overview | Live — aggregates the user's real local data |
| My Designs | Live — IndexedDB |
| Mood Boards | Live — IndexedDB |
| Saved Materials | Live — IndexedDB |
| Favourite Projects | Live — IndexedDB |
| Estimates | Live — IndexedDB |
| My Enquiries | Live — locally recorded submissions with reference numbers |
| **Demo Project** | Seeded — a fully-populated example client project (Section 11.4) demonstrating quotations, approvals, progress, site photos, messages, payments, and documents |
| Profile | Live — local profile, language, large-text preference, export/import |

**AC:**
- The **demo project** is clearly badged *"Example project — this is how your project will look once work begins"* so nothing is misleading.
- Every section works and every state is represented: pending, in-progress, blocked, complete, overdue, empty.
- Empty states are designed — illustration, explanation, next-step CTA. Never a blank panel.

### FR-I-03 — Approval Workflow *(S)*
Operates on the demo project, fully interactively.
- **Approve**, **Reject**, or **Request changes** with mandatory comments on the latter two.
- **Object-level comments** — click any point on the attached image to pin a comment.
- **Version comparison** — any two versions side-by-side with a change summary.
- Full **audit trail** — who, what, when — rendered as an immutable timeline, persisted locally.
- On state change, offer to notify the designer via a pre-filled WhatsApp message.
- Approved artefacts lock and watermark "Approved on {date} by {name}".

### FR-I-04 — Project Progress Tracker *(C)*
- Eleven stages: Site Measurement → Requirement Discussion → Initial Concept → 3D Design → Material Selection → Design Approval → Production → Civil Work → Installation → Quality Check → Handover.
- Per stage: status, planned vs actual dates, owner, notes, photos, pending client action.
- Vertical timeline on mobile, horizontal on desktop, with overall percentage and projected completion.
- **Delays shown honestly with a reason field** — this builds more trust than hiding them.

---

## 6.10 MODULE J — Floor Planner & 3D *(Phase 3, all free)*

### FR-J-01 — 2D Floor Planner *(C)*
Route: `/planner`

- Draw walls by click-drag on a grid; live dimensions in feet-inches **and** mm; snap to 0.5 ft and to 0/45/90°.
- Type exact dimensions while drawing.
- Place doors (hinged/sliding/main), windows (with sill height), pillars, beams, staircases, balconies, platforms.
- Ceiling height, default 10 ft (typical for Indore builder flats).
- Furniture library with **real Indian dimensions**: king bed 72×78in, queen 60×78in, 3-seater sofa, 6-seater dining, wardrobe modules at 2/3/4 ft, kitchen base/wall/tall units at 600/900mm depths.
- Drag, rotate (15° snap, free with modifier), resize, duplicate, align, group.
- **Clearance checking** — flags walkway < 2.5 ft, wardrobe door swing collision, main door swing collision, dining chair pull-out < 2.5 ft, TV distance outside 1.5–2.5× diagonal, kitchen work triangle outside 4–9 ft legs.
- Auto room area labels; total carpet area.
- Layers: structure / furniture / electrical / dimensions.
- Export PNG, to-scale PDF with title block, and JSON. All client-side.

### FR-J-02 — 3D View & Walkthrough *(C)*
- One-click extrusion of the 2D plan to 3D at the set ceiling height.
- Cameras: orbit, top-down dollhouse, **first-person walkthrough** (WASD + mouse; on-screen joystick on touch).
- Applies the visualiser's materials so both tools share material state.
- Lighting matches FR-C-05 presets.
- Screenshot capture from any camera.
- ≥ 30 fps on a mid-range device, with automatic quality degradation (shadow resolution, texture size, AA) based on measured frame time.
- **Fallback:** if WebGL2 is unavailable or the device reports < 4 GB RAM, show pre-rendered orbit frames.

### FR-J-03 — AR Furniture Preview *(C)*
- **"View in your room"** on mobile via `<model-viewer>` with `ar-modes="webxr scene-viewer quick-look"`.
- Requires `.glb` + `.usdz` per item, authored at true scale — sourced CC0 (Poly Pizza, Khronos samples).
- Desktop shows a 3D turntable plus a QR code to continue on phone.
- Explicit, graceful messaging when AR is unsupported.

---

## 6.11 MODULE K — Trust, Content & Company

### FR-K-01 — "How We Work" *(M)*
Route: `/process`. States plainly: what's included, what's not, design fee structure, free revisions and the cost of extras, payment milestone percentages, timelines by project size, quality tiers explained, installation process, warranty terms per category, after-sales SLA. Includes a downloadable "What's included" PDF (generated client-side) and an FAQ accordion with `FAQPage` JSON-LD.

### FR-K-02 — Designer Profiles *(M)*
Route: `/studio/[slug]`. Portrait, experience, specialisations, styles, cities, qualifications, languages (Hindi, English, Marathi, Malwi), philosophy, projects, reviews, and **"Book a consultation with {name}"** pre-selecting that designer.

### FR-K-03 — Testimonials *(M)*
Route: `/testimonials`. Each: client name, locality, project type, budget band, timeline, designer, the specific challenge solved, photographs, written review, star rating, link to the case study. Filterable by project type and budget band. `Review` JSON-LD. *(Demo mode: no video testimonials — the component supports `videoUrl` for later.)*

### FR-K-04 — Services *(M)*
Routes: `/services`, `/services/[slug]` for: Full Home Interiors · Modular Kitchen · Wardrobes & Storage · Living Room · Bedroom · Pooja Room · False Ceiling & Lighting · Home Renovation · Office Interiors · Retail & Restaurant · Turnkey Execution · Design Consultation Only. Each: inclusions, process, cost band, timeline, examples, materials, FAQs, CTA.

### FR-K-05 — Locality Landing Pages *(M, SEO)*
Route: `/interior-designers-in-[locality]`, generated from `src/data/static/localities.ts` for 20 Indore localities and 4 nearby cities. Genuinely locality-specific content: typical property types there, projects completed there, distance from the studio, local considerations. `LocalBusiness` JSON-LD with `areaServed`. **Statically generated — free, and the highest-ROI SEO asset in the build.**

### FR-K-06 — Local Content Editor *(C)*
Route: `/studio-admin` (dev + a hidden production path).
A browser-based editor over the data files that lets a non-developer edit projects, materials, testimonials, and prices, preview live, and **export a JSON patch file** to hand to the developer for commit. This is the zero-cost substitute for a CMS. No server, no database, no subscription.

---

## 6.12 MODULE L — Accessibility & Internationalisation

### FR-L-01 — Accessibility (WCAG 2.2 AA) *(M)*
- All interactive elements keyboard-operable with a visible `:focus-visible` ring (2px `--accent`, 2px offset).
- Skip-to-content as the first focusable element.
- Contrast ≥ 4.5:1 body, ≥ 3:1 large text and UI boundaries — **verified in CI with axe**.
- Meaningful `alt` on all images; `alt=""` on decorative.
- Semantic landmarks; one `h1` per page; no heading level skips.
- Labels on all inputs; errors linked via `aria-describedby`, announced via `role="alert"`, and phrased as what to do.
- `prefers-reduced-motion` disables all transform/opacity animation, the Ken Burns pan, and parallax.
- **Large-text mode** (+125%, persisted, layout tested at that scale).
- **High-contrast mode.**
- Live regions for filter counts, save status, and estimate results.
- **Visualiser:** every canvas action has a keyboard-accessible equivalent in a side panel, and the canvas exposes a textual description of the current design state to screen readers.
- Colour never the sole carrier of meaning.
- Touch targets ≥ 44×44 CSS px.
- A persistent **"Talk to a Designer"** affordance.

### FR-L-02 — Internationalisation *(M)*
- Locales `en` (default) and `hi`; static routes `/en/...` and `/hi/...`; root redirects via `Accept-Language` with a persisted cookie override. **Statically exportable — both locales fully pre-rendered.**
- **Zero hardcoded user-facing strings in components** — all in `src/messages/{en,hi}.json`.
- Hindi uses Noto Sans Devanagari with line-height 1.75 for matras.
- `Intl` formatting with `en-IN` / `hi-IN`, Indian digit grouping in both.
- Content models support per-locale fields with English fallback.
- `hreflang` alternates and a localised sitemap.
- Language switcher preserves route and query.
- **Hindi translation priority:** cost explanations, inclusions/exclusions, consultation form, process steps, warranty terms.

---

# 7. INFORMATION ARCHITECTURE & ROUTING

```
/[locale]
├── /                                   Homepage
├── /projects                           Portfolio index (client-filtered)
│   └── /[slug]                         Case study            [SSG ×24]
├── /services  /services/[slug]                               [SSG ×12]
├── /rooms/[slug]                                             [SSG ×18]
├── /styles  /styles/[slug]                                   [SSG ×16]
├── /materials  /materials/[slug]                             [SSG ×120]
├── /visualiser
│   ├── /[designId]                     Edit a local design
│   └── /compare                        Side-by-side
├── /planner                            2D/3D planner          (Phase 3)
├── /moodboards  /moodboards/[id]
├── /estimate  /estimate/result         Wizard + result
├── /quiz  /quiz/result                 Shareable via query
├── /inspiration/search                                        (Phase 3)
├── /consultation  /consultation/confirmed
├── /studio  /studio/[slug]  /studio/careers
├── /process  /testimonials  /contact
├── /journal  /journal/[slug]                                 [SSG ×12]
├── /interior-designers-in-[locality]                         [SSG ×24]
├── /dashboard/*                        Local data, no server
├── /studio-admin                       Local content editor   (Phase 3)
├── /d                                  Shared design (reads #fragment), noindex
├── /b                                  Shared mood board, noindex
├── /legal/privacy  /legal/terms  /legal/image-credits
├── /dev/components  /dev/audit         Dev builds only
└── /sitemap.xml  /robots.txt  /journal/rss.xml  /manifest.webmanifest
```

**Total statically generated pages: ~260 per locale, ~520 total.** All pre-rendered at build, all served from a free CDN, all instant.

---

# 8. VISUAL DESIGN SYSTEM

## 8.1 Principles
1. **Photography leads, UI recedes.**
2. **Space is luxury.**
3. **Restraint in colour** — neutral canvas, one warm accent, used sparingly.
4. **Motion with purpose** — every animation explains a relationship or a state change.
5. **Weight through type, not boxes.**

## 8.2 Colour Tokens

```css
/* Light theme — default */
--canvas:        #FBF9F6;  /* Warm ivory — page background */
--surface:       #FFFFFF;  /* Cards, panels */
--surface-sunk:  #F3EFE9;  /* Wells, inputs */
--ink:           #1C1B19;  /* Charcoal — primary text */
--ink-muted:     #6B6762;
--ink-subtle:    #9C9791;
--line:          #E5DFD6;  /* Hairline borders */
--sand:          #D9CEBF;
--accent:        #B5643C;  /* Terracotta — primary CTA, links */
--accent-hover:  #9C5232;
--accent-soft:   #F5E8E0;
--forest:        #2F4739;  /* Secondary accent */
--gold:          #A8863F;  /* Premium tier badges ONLY */
--success:       #3E6B4F;
--warning:       #B5873C;
--danger:        #A14A3C;
--focus:         #B5643C;

/* Dark theme — mandatory for the visualiser workspace */
--canvas-dark:       #16150F;
--surface-dark:      #201E19;
--surface-sunk-dark: #12110D;
--ink-dark:          #F2EDE5;
--ink-muted-dark:    #A8A29A;
--line-dark:         #33302A;
```

**Rules:** Terracotta only for primary actions and links. Gold **only** for premium/luxury tier indicators. Never more than two accent colours in one viewport. **The visualiser workspace always uses the dark theme** — a neutral dark surround prevents colour-perception bias. This is a functional requirement, not a stylistic one.

## 8.3 Typography

| Role | Family | Licence | Usage |
|---|---|---|---|
| Display | **Fraunces** (variable, optical size axis) | OFL-1.1 | H1, H2, pull quotes, project titles |
| Body/UI | **Inter Variable** | OFL-1.1 | Everything else |
| Devanagari | **Noto Sans Devanagari** | OFL-1.1 | All Hindi content |
| Numeric | Inter with `font-variant-numeric: tabular-nums` | | Prices, dimensions, tables |

All self-hosted via `@fontsource`, subset to Latin + Devanagari, `font-display: swap`, with only the two critical faces preloaded. **Zero cost, zero third-party requests, better privacy and performance than Google Fonts CDN.**

**Type scale** — fluid `clamp()` from 360px to 1440px:

| Token | Min | Max | Line height | Tracking |
|---|---|---|---|---|
| `display-xl` | 2.5rem | 5.5rem | 1.02 | -0.03em |
| `display-l` | 2rem | 4rem | 1.06 | -0.025em |
| `h1` | 1.875rem | 3rem | 1.12 | -0.02em |
| `h2` | 1.5rem | 2.25rem | 1.18 | -0.015em |
| `h3` | 1.25rem | 1.625rem | 1.28 | -0.01em |
| `body-l` | 1.0625rem | 1.1875rem | 1.65 | 0 |
| `body` | 1rem | 1rem | 1.65 | 0 |
| `body-s` | 0.875rem | 0.875rem | 1.6 | 0 |
| `caption` | 0.8125rem | 0.8125rem | 1.5 | 0.01em |
| `overline` | 0.75rem | 0.75rem | 1.4 | 0.14em, uppercase |

Body copy max-width **68ch**.

## 8.4 Spacing, Radius, Elevation

**Spacing (4px base):** `0, 1(4), 2(8), 3(12), 4(16), 5(20), 6(24), 8(32), 10(40), 12(48), 16(64), 20(80), 24(96), 32(128), 40(160)`. Section rhythm `py-20` mobile → `py-32` desktop.

**Radius:** `sm 4px` · `md 8px` · `lg 16px` · `xl 24px` · `full`.

**Elevation** — soft and warm-tinted, never grey-black:
```css
--e1: 0 1px 2px rgba(28,27,25,.04), 0 1px 3px rgba(28,27,25,.06);
--e2: 0 2px 6px rgba(28,27,25,.05), 0 6px 16px rgba(28,27,25,.07);
--e3: 0 8px 24px rgba(28,27,25,.08), 0 16px 48px rgba(28,27,25,.10);
--e4: 0 24px 64px rgba(28,27,25,.14);
```

## 8.5 Motion

| Token | Duration | Easing | Use |
|---|---|---|---|
| `instant` | 100ms | `ease-out` | Hover tints, focus rings |
| `quick` | 180ms | `cubic-bezier(.4,0,.2,1)` | Buttons, toggles, chips |
| `base` | 320ms | `cubic-bezier(.22,1,.36,1)` | Panels, drawers, accordions |
| `slow` | 620ms | `cubic-bezier(.16,1,.3,1)` | Section transitions, image reveals |
| `image` | 800ms | `cubic-bezier(.16,1,.3,1)` | Hero and gallery scale |
| `kenburns` | 9000ms | `linear` | Hero pan cycle |

**Patterns:** scroll reveal (`opacity 0→1`, `translateY 24px→0`, 60ms stagger, at 15% intersection, **once**) · image reveal (clip-path wipe + 1.08→1.0 scale) · shared layout via Motion `layoutId` from project card → case study hero · card hover (`translateY(-4px)` + `--e2`→`--e3` + image scale 1.04) · number counters (ease-out 1.4s, on view, once).

**Prohibited:** full-page loading screens, parallax on more than one element per viewport, scroll-hijacking, animation blocking content beyond 400ms, auto-advancing carousels.

## 8.6 Component Inventory
Build these primitives **before** any page:

`Button` · `Input` · `Textarea` · `Select` · `Combobox` · `RadioCardGroup` (image-capable) · `Checkbox` · `Switch` · `Slider` · `RangeSlider` · `ColorSwatch` · `ColorPicker` (OKLCH) · `MaterialChip` · `Chip` · `Badge` · `Card` · `ProjectCard` · `MaterialCard` · `DesignerCard` · `TestimonialCard` · `StatCounter` · `Accordion` · `Tabs` · `Dialog` · `Sheet` · `Drawer` · `Popover` · `Tooltip` · `Toast` · `Breadcrumb` · `Pagination` · `FilterBar` · `FilterChipRow` · `EmptyState` · `Skeleton` · `Lightbox` · `BeforeAfterSlider` · `MediaFacade` · `StepIndicator` · `Timeline` · `PriceRange` · `RatingStars` · `Avatar` · `OsmMap` · `WhatsAppButton` · `ShareSheet` · `LanguageSwitcher` · `SectionHeader` · `Marquee` · `KenBurnsHero`

Each must have: all interactive states (default / hover / focus-visible / active / disabled / loading / error), a skeleton where it loads, dark-theme support, and a demo in `/dev/components`.

---

# 9. DATA MODEL

Demo Mode uses **typed TypeScript data files**, not a database. The shapes below are the contract; they are written so a Prisma schema can be mechanically derived later for DB Mode.

```ts
// src/types/content.ts — the canonical content contract

export type Locale = 'en' | 'hi';
export type Localised<T> = T | Partial<Record<Locale, T>>;

export type BudgetBand = 'UNDER_3L' | 'L3_7' | 'L7_15' | 'L15_30' | 'ABOVE_30L';
export type Tier = 'ESSENTIAL' | 'STANDARD' | 'PREMIUM' | 'LUXURY';
export type PropertyType = 'APARTMENT' | 'VILLA' | 'DUPLEX' | 'FARMHOUSE'
                         | 'OFFICE' | 'CLINIC' | 'RETAIL' | 'RESTAURANT';
export type Segment = 'RESIDENTIAL' | 'COMMERCIAL';
export type Nature  = 'NEW' | 'RENOVATION';

export interface ImageRef {
  id: string;
  src: string;            // /demo/projects/xx/01.avif
  width: number;
  height: number;
  blurHash: string;
  alt: Localised<string>;
  caption?: Localised<string>;
  roomType?: string;
  credit: ImageCredit;    // MANDATORY — see 11.8
  phash?: string;         // for FR-G-02
  palette?: string[];     // 5 OKLab colours
}

export interface ImageCredit {
  source: 'unsplash' | 'pexels' | 'ambientcg' | 'polyhaven' | 'original';
  author?: string;
  url?: string;
  licence: 'unsplash' | 'pexels' | 'cc0' | 'owned';
}

export interface Project {
  slug: string;
  title: Localised<string>;
  city: string;
  locality?: string;
  propertyType: PropertyType;
  bhk?: string;
  carpetAreaSqft?: number;
  segment: Segment;
  nature: Nature;
  styles: string[];
  roomTypes: string[];
  budgetBand: BudgetBand;
  durationWeeks?: number;
  completedOn?: string;       // ISO
  vastuAligned: boolean;
  featured: boolean;
  orderIndex: number;
  brief: Localised<string>;
  challenge: Localised<string>;
  solution: Localised<string>;
  designerNote?: Localised<string>;
  heroImage: ImageRef;
  images: ImageRef[];
  beforeAfters: BeforeAfterPair[];
  floorPlan?: { svg: string; rooms: FloorPlanRoom[] };
  materialSlugs: string[];
  designerSlugs: string[];
  testimonialId?: string;
  seo?: { title?: string; description?: string };
}

export interface BeforeAfterPair {
  id: string;
  before: ImageRef;
  after: ImageRef;
  label?: Localised<string>;
  mode: 'before-after' | 'render-vs-built' | 'day-vs-night'
      | 'essential-vs-premium' | 'layout-old-vs-new';
}

export interface Material {
  slug: string;
  name: Localised<string>;
  brand?: string;              // "{{BRAND_A}}" placeholder in demo
  productCode?: string;
  category: MaterialCategory;
  subCategory?: string;
  swatch: ImageRef;
  texture?: {                  // CC0 PBR set for the visualiser
    albedo: string;
    normal?: string;
    roughness?: string;
    scaleCm: number;           // real-world size of one tile
    credit: ImageCredit;
  };
  hex?: string;
  colorFamily?: string;
  tonality?: 'warm' | 'cool' | 'neutral' | 'bold' | 'pastel' | 'earthy' | 'jewel';
  finish?: string;
  tier: Tier;
  price?: { min: number; max: number; unit: 'sqft' | 'rft' | 'litre' | 'piece' };
  durability?: 1 | 2 | 3 | 4 | 5;
  maintenance?: 'LOW' | 'MEDIUM' | 'HIGH';
  waterResistant: boolean;
  heatResistant: boolean;
  warranty?: Localised<string>;
  availability?: 'IN_STOCK_INDORE' | 'ON_ORDER' | 'IMPORT';
  usageSurfaces: string[];
  usageRooms: string[];
  sustainability?: Localised<string>;
  substituteForSlug?: string;  // budget-down chain
}

export type MaterialCategory =
  | 'PAINT' | 'WALLPAPER' | 'WALL_TEXTURE' | 'VENEER' | 'LAMINATE' | 'ACRYLIC'
  | 'PU_FINISH' | 'GLASS' | 'MARBLE' | 'GRANITE' | 'QUARTZ' | 'CERAMIC_TILE'
  | 'VITRIFIED_TILE' | 'WOOD_FLOORING' | 'VINYL_FLOORING' | 'UPHOLSTERY'
  | 'CURTAIN' | 'METAL_FINISH' | 'KITCHEN_HARDWARE' | 'WARDROBE_HARDWARE'
  | 'LIGHTING' | 'SANITARYWARE' | 'COUNTERTOP' | 'HANDLES';

export interface RoomTemplate {
  slug: string;
  name: Localised<string>;
  roomType: string;
  style?: string;
  baseImage: ImageRef;
  lightDirection: [number, number];   // normalised 2D azimuth hint
  surfaces: SurfaceMask[];
}

export interface SurfaceMask {
  id: string;
  surfaceType: SurfaceType;
  label: Localised<string>;
  maskSrc: string;                    // 8-bit PNG alpha, same dims as base
  perspectiveQuad?: [Pt, Pt, Pt, Pt]; // image-space, for texture homography
  defaultMaterialSlug?: string;
  orderIndex: number;
}

export type SurfaceType =
  | 'WALL' | 'ACCENT_WALL' | 'CEILING' | 'FLOOR' | 'CABINET_UPPER'
  | 'CABINET_LOWER' | 'WARDROBE' | 'COUNTERTOP' | 'BACKSPLASH' | 'CURTAIN'
  | 'UPHOLSTERY' | 'WALL_PANEL' | 'DOOR' | 'WINDOW_FRAME' | 'BATH_TILE'
  | 'RUG' | 'LIGHT_FIXTURE';

export interface Designer {
  slug: string;
  name: string;
  photo: ImageRef;
  experienceYears: number;
  specialisations: string[];
  styles: string[];
  cities: string[];
  languages: string[];
  qualifications: string[];
  bio: Localised<string>;
  philosophy?: Localised<string>;
  availability: WeeklyAvailability;
  projectSlugs: string[];
}

export interface Testimonial {
  id: string;
  projectSlug?: string;
  clientName: string;
  locality?: string;
  projectType?: string;
  budgetBand?: BudgetBand;
  timelineWeeks?: number;
  designerSlug?: string;
  challenge?: Localised<string>;
  quote: Localised<string>;
  rating: 1 | 2 | 3 | 4 | 5;
  photo?: ImageRef;
  videoUrl?: string;            // null in demo; component supports it
  featured: boolean;
}

export interface PriceBook {
  version: string;              // "2026.09"
  city: string;
  effectiveFrom: string;
  rates: {
    fullHomePerSqft:   Record<Tier, number>;
    kitchenPerRft:     Record<Tier, number>;
    wardrobeOpenPerRft: Record<Tier, number>;
    wardrobeSlidePerRft: Record<Tier, number>;
    falseCeilingPerSqft: Record<Tier, number>;
    paintingPerSqft:   Record<Tier, number>;
    items:             Record<string, Record<Tier, number>>;
    designFeePct:      Record<Tier, number>;
    executionPct:      Record<Tier, number>;
    gstPct:            number;
    timelineWeeks:     Record<string, [number, number]>;
    renovationUplift:  number;
    localityMultiplier: Record<string, number>;
  };
}
```

**Local (browser) state — IndexedDB via `idb`, database `atelier`, version 1:**

```ts
// Object stores
'designs'      // Design      keyPath 'id', index 'updatedAt'
'variants'     // DesignVariant  keyPath 'id', index 'designId'
'uploads'      // { id, blob, width, height, createdAt }  — user photos, never uploaded
'moodboards'   // MoodBoard   keyPath 'id'
'estimates'    // SavedEstimate keyPath 'id'
'enquiries'    // Enquiry     keyPath 'reference'
'favourites'   // { type, slug, createdAt }
'feedback'     // merged votes + comments, keyPath 'id' (uuid, idempotent)
'profile'      // singleton: name, phone?, email?, locale, prefs
'approvals'    // demo-project approval responses + audit trail
'meta'         // guestKey, schemaVersion, coachmarksSeen, dismissals
```

**Storage discipline:** cap `uploads` at 200 MB; evict least-recently-used with a user warning; surface a "Storage used: X MB" figure in the dashboard with a "Clear old uploads" action. Handle `QuotaExceededError` explicitly with a helpful message — never a silent failure.

---

# 10. INTERNAL API & ADAPTER CONTRACTS

There are **no HTTP endpoints in Demo Mode**. These are the TypeScript interfaces every feature codes against.

```ts
// src/lib/adapters/contracts.ts

export interface ContentRepo {
  getProjects(filter?: ProjectFilter): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;
  getMaterials(filter?: MaterialFilter): Promise<Material[]>;
  getMaterial(slug: string): Promise<Material | null>;
  getRoomTemplates(): Promise<RoomTemplate[]>;
  getDesigners(): Promise<Designer[]>;
  getTestimonials(): Promise<Testimonial[]>;
  getPriceBook(version?: string): Promise<PriceBook>;
  search(query: string, scopes?: SearchScope[]): Promise<SearchHit[]>;
}
// DEFAULT: StaticContentRepo — reads bundled data files. Zero cost.
// FUTURE:  PrismaContentRepo.

export interface UserStore {
  getProfile(): Promise<Profile>;
  setProfile(p: Partial<Profile>): Promise<void>;
  listDesigns(): Promise<Design[]>;
  saveDesign(d: Design): Promise<void>;
  deleteDesign(id: string): Promise<void>;
  listMoodBoards(): Promise<MoodBoard[]>;
  saveMoodBoard(b: MoodBoard): Promise<void>;
  listEstimates(): Promise<SavedEstimate[]>;
  saveEstimate(e: SavedEstimate): Promise<void>;
  putUpload(blob: Blob): Promise<string>;   // returns local id
  getUpload(id: string): Promise<Blob | null>;
  exportAll(): Promise<Blob>;               // JSON download
  importAll(file: File): Promise<ImportReport>;
  storageUsage(): Promise<{ usedBytes: number; quotaBytes: number }>;
}
// DEFAULT: IndexedDbUserStore. Zero cost.

export interface LeadSink {
  submit(enquiry: Enquiry): Promise<LeadResult>;
}
// DEFAULT (composite, in order, all free):
//   1. LocalRecordSink   — always; writes to IndexedDB, mints the reference
//   2. WhatsAppSink      — opens wa.me with the full transcribed enquiry
//   3. MailtoSink        — offered as a fallback link
//   4. GoogleSheetsSink  — optional, fires only if APPS_SCRIPT_URL is set
//   5. FormRelaySink     — optional, fires only if a relay key is set
// Composite never throws; a failure in an optional sink is logged, not surfaced.

export interface Notifier {
  confirm(enquiry: Enquiry): Promise<void>;   // toast + .ics + calendar link
  remind(c: Consultation): Promise<void>;     // local reminder via Notification API
}
// DEFAULT: LocalNotifier — Web Notifications API (free) + downloadable .ics.

export interface ShareAdapter {
  encode(design: Design, variantIds: string[]): string;   // → URL fragment
  decode(fragment: string): SharedDesign | null;
  encodeFeedback(f: Feedback): string;
  decodeFeedback(s: string): Feedback | null;
}
// DEFAULT: FragmentShareAdapter — fflate + Base64URL. Zero cost, no server.

export interface Analytics { track(event: string, props?: Record<string, unknown>): void; }
// DEFAULT: NoopAnalytics. OPTIONAL: CloudflareWebAnalytics (free, unlimited).

export interface BotGuard { verify(formState: FormState): Promise<boolean>; }
// DEFAULT: HoneypotTimeTrapGuard — hidden field + min-dwell + submit throttle.

export interface Segmenter { segmentAtPoint(img: ImageData, pt: Pt): Promise<Mask>; }
// DEFAULT: FloodFillSegmenter (worker). PHASE 3: MobileSamSegmenter (ONNX, Apache-2.0).
```

**Enforcement:** an ESLint `no-restricted-imports` rule forbids importing any file under `src/lib/adapters/impl/**` from outside `src/lib/adapters/index.ts`. CI fails on violation.

**If and when a backend is affordable**, DB Mode adds Route Handlers mirroring these interfaces one-for-one. No UI code changes.

---

# 11. DEMO CONTENT & ASSET STRATEGY

**This section is what makes an assetless, zero-budget build look like a finished ₹8-lakh website. Follow it precisely.**

## 11.1 The Token System
`src/config/site.ts` is the **single source of truth** for every firm-specific detail:

```ts
export const site = {
  name: "{{FIRM_NAME}}",              // demo value: "Aangan Design Studio"
  shortName: "{{FIRM_SHORT}}",        // demo: "Aangan"
  tagline: "{{TAGLINE}}",             // demo: "Interiors for how Indore actually lives."
  legalName: "{{LEGAL_NAME}}",
  gstin: "{{GSTIN}}",
  foundedYear: 2014,
  phone: "{{PHONE}}",                 // demo: "+91 90000 00000"
  whatsapp: "{{WHATSAPP}}",           // demo: "919000000000"
  email: "{{EMAIL}}",                 // demo: "hello@example.com"
  address: {
    line1: "{{ADDRESS_LINE_1}}", line2: "{{ADDRESS_LINE_2}}",
    city: "Indore", state: "Madhya Pradesh",
    pincode: "{{PINCODE}}", country: "IN",
    lat: 22.7196, lng: 75.8577,       // Rajwada — replace with the real studio
  },
  social: { instagram: "{{IG}}", facebook: "{{FB}}", youtube: "{{YT}}", pinterest: "{{PIN}}" },
  stats: { projectsCompleted: 240, yearsExperience: 12, sqftDelivered: 480000,
           onTimePercent: 94, avgRating: 4.8 },
  serviceAreas: ["Indore", "Bhopal", "Ujjain", "Dewas", "Pithampur", "Mhow"],
  businessHours: { weekdays: "10:00–19:00", saturday: "10:00–19:00", sunday: "By appointment" },
  isDemoContent: true,   // drives the demo banner in FR-11.9
} as const;
```

**Rule:** replacing real data must never require editing a component. Enforce with a CI check that greps for hardcoded phone numbers, `wa.me/` literals, and email addresses outside `site.ts`.

## 11.2 Logo — zero-cost placeholder
No designer, no budget. Generate a **typographic wordmark** in `Fraunces` with an optical-size-tuned monogram lockup, committed as hand-written SVG:
- `logo-wordmark.svg`, `logo-stacked.svg`, `logo-monogram.svg` (for favicon/PWA), each in `currentColor` so it themes automatically.
- Favicon set + `apple-touch-icon` + maskable PWA icons generated from the monogram by a `scripts/generate-icons.ts` sharp script.
- Looks intentional, costs nothing, and is a single-file swap later.

## 11.3 Image Strategy — Non-Negotiable Rules

1. **Never render a grey box, and never use a random-image service.** Random images destroy the premium illusion because they are stylistically incoherent.
2. Curate a **fixed, hand-picked set of ~170 interior photographs** from **Unsplash** and **Pexels** — both licences permit commercial use with no attribution required, though the build credits them anyway.
3. Commit a **manifest** (`src/data/demo/images.ts`) with, per image: stable id, source URL, author, licence, descriptive alt text (EN + HI), dimensions, BlurHash, room type, style bucket, pHash, and extracted palette.
4. `scripts/fetch-demo-assets.ts` downloads from the manifest and generates, into `public/demo/`: AVIF + WebP at 400/800/1200/2000px widths, plus a BlurHash. **Binaries are gitignored; the manifest is committed; the script is idempotent and runs in CI.** Repo stays light; builds stay reproducible.
5. **Style-coherence rule.** Every demo project draws its 6–12 images from a single **style bucket**, so a "Minimal Scandinavian 2BHK" never shows a maximalist Art Deco bathroom. Implement `curateProjectImages(styleBucket, roomTypes, count)` and assert coherence in a unit test.
6. An `<Img>` wrapper over `next/image` always supplies BlurHash placeholder, correct `sizes`, and `alt`. **No raw `<img>` anywhere** — enforced by an ESLint rule.
7. **Before/after pairs.** Where a genuine pair is unavailable, generate the "before" deterministically from the "after" at build time: desaturate 35%, warm shift +8%, contrast −20%, mild blur on a vignette, plus a subtle "dated" colour grade. Record `synthetic: true` in the manifest and list it in the replacement checklist. Honest, and visually convincing.
8. **Hero:** three Ken Burns stills from the same style bucket. No video licensing, no bandwidth cost.

## 11.4 Demo Data Volume — minimum for the site to feel real

| Entity | Count | Notes |
|---|---|---|
| Projects | **24** | All property types, BHKs, budget bands, styles; 6 featured; 8 commercial; 10 with before/after |
| Project images | **170+** | 6–12 per project, style-coherent |
| Materials | **120** | ≥ 4 per category; 40 with CC0 PBR textures wired into the visualiser; 15 substitute chains |
| Room templates | **20** | Fully masked — Section 11.6 |
| Designers | **6** | Varied specialisations and languages |
| Testimonials | **18** | All linked to projects |
| Services | **12** | Per FR-K-04 |
| Styles | **16** | Per FR-F-02 |
| Room guides | **18** | Per FR-F-03 |
| Localities | **20 + 4 cities** | Per Section 1.6 |
| Journal posts | **12** | Fully written — Section 11.7 |
| Price book | **1** | Realistic Indore 2026 rates — Appendix 16.3 |
| Quiz profiles | **8** | Style outcome profiles |
| Furniture models (Phase 3) | **25** | CC0 GLB + USDZ, true scale |
| **Demo client project** | **1** | Fully populated: 11 stages (4 complete, 1 in progress, 1 blocked with an honest delay reason), 3 quotation versions, 4 approvals (2 pending), 6 payment milestones, 20 site photos, 8 messages, 5 documents — so **every dashboard state is demonstrable** |
| Demo personas | 3 | Client / Designer / Admin, switchable from `/dev/audit` |

## 11.5 Synthetic Shade Library — legally clean

**Do not reproduce Asian Paints, Berger, Dulux, or any brand's shade names or codes** — they are proprietary and a trademark risk.

Instead generate **240 original paint shades** programmatically:
- Sample OKLCH space along curated hue families (warm neutrals, cool neutrals, greens, terracottas, blues, ochres, greys, off-whites), weighted toward the muted, liveable range Indian homes actually use.
- Name each with an original two-word name from a curated wordlist (e.g. *Ivory Mist*, *Sage Whisper*, *Malwa Clay*, *Monsoon Grey*, *Turmeric Light*, *Rajwada Rose*). Names must be generated and then **hand-reviewed for accidental trademark collision**.
- Assign an internal code (`AG-1042`) using the firm's own `{{BRAND_PREFIX}}` token.
- Each shade carries: hex, OKLCH, colour family, tonality, LRV, recommended rooms, and tier.
- **Result:** a catalogue that looks fully professional, is 100% owned, costs nothing, and swaps to real brand shades by replacing one data file.

## 11.6 Visualiser Room Templates — the critical asset

For each of the 20 demo rooms, author masks **once, offline**, and commit them:
- Base photograph (≤ 2000px long edge, AVIF + WebP).
- One 8-bit PNG alpha mask per surface (wall-left, wall-back, ceiling, floor, cabinets, etc.), PNG-quantised — typically 15–40 KB each.
- A `perspectiveQuad` per planar surface so tile and wood textures map correctly.
- An inferred light-direction vector.
- Default material assignments.

**Authoring pipeline** (`scripts/author-masks.ts`, run locally, zero cost):
1. Run **MobileSAM** (Apache-2.0) locally over each base image to propose masks.
2. Hand-correct in any free editor (GIMP or Krita).
3. Export masks; the script computes quads, quantises PNGs, and writes the template data file.

Document this fully in `docs/AUTHORING-ROOM-TEMPLATES.md` so the firm can later add its **own completed projects** as visualiser templates — which is when the tool becomes genuinely unique.

**This asset is what makes the visualiser feel magical on first open without any upload.** Budget real effort here: roughly 45 minutes per room.

## 11.7 Journal Articles — write all 12 in full

1. What does interior design for a 2BHK cost in Indore in 2026?
2. Modular kitchen materials explained: laminate vs acrylic vs PU vs membrane
3. False ceiling: costs, types, and when you genuinely need one
4. Ten storage ideas for compact Indore apartments
5. How to design a pooja room in a modern flat
6. Best paint colours for small, low-light rooms
7. How to compare three interior quotations without getting confused
8. A realistic renovation checklist for an occupied home
9. Vastu-friendly layouts that still look contemporary
10. How long interior work actually takes — a week-by-week breakdown
11. Wardrobes: sliding vs openable, and what it costs per running foot
12. How to prepare your new flat before the interior team arrives

Each 1,200–1,800 words, genuinely useful, with at least one `<CostTable>` or `<Checklist>`. **These are the free organic-acquisition engine** — with no ad budget, they are the primary growth channel, so they must be real content, not filler.

## 11.8 Asset Licensing & Attribution — mandatory

- Every `ImageRef` **must** carry an `ImageCredit`. A unit test fails the build if any is missing.
- `/legal/image-credits` renders the full attribution table, generated from the manifest.
- Footer links to it and includes the required **OpenStreetMap** attribution.
- `docs/ASSET-LICENCES.md` records each source, its licence text, and the date verified.
- **Verify before use:** Unsplash and Pexels licences permit commercial use without attribution but prohibit redistributing the images as a competing stock library — our use is compliant. ambientCG and Poly Haven are CC0. All fonts are OFL. All code dependencies must be MIT / Apache-2.0 / BSD / ISC — **an `license-checker` CI gate fails the build on any GPL or AGPL production dependency.**

## 11.9 Demo-Mode Honesty
While `site.isDemoContent === true`:
- A dismissible top banner in **non-production builds only**: *"Demo content — projects, photographs, and prices are placeholders."*
- The `/legal/image-credits` page states clearly that project photographs are representative stock imagery.
- `data-placeholder="true"` on every placeholder text node in dev builds.

**This flag is flipped to `false` in one place when real content lands.**

## 11.10 Copy Tone Guide
- Write **real, specific, finished copy**. Never Lorem Ipsum. Never "Description goes here".
- Specific beats generic: *"A 9-foot-wide living room with three doorways"*, not *"A challenging space"*.
- Numbers build trust: *"delivered in 11 weeks"*, *"₹9.4 lakh"*, *"1,180 sq ft"*.
- Indian-English register: "wardrobe" not "closet", "curtains" not "drapes", "flat" and "apartment" both fine, "carpet area" not "usable area".
- No unevidenced superlatives. No "world-class", "best-in-class", "one-stop solution".

## 11.11 Dev-Only Content Audit
`/dev/audit` (dev builds only) lists every `{{TOKEN}}`, every `data-placeholder` node, every synthetic before/after, and every demo image, grouped by page, with a completion percentage and a direct link to the file to edit. Makes handover to the client unambiguous and costs nothing.

---

# 12. NON-FUNCTIONAL REQUIREMENTS

## 12.1 Performance Budgets

| Metric | Budget | Conditions |
|---|---|---|
| LCP | ≤ 2.0s | Moto G Power class, Slow 4G |
| INP | ≤ 180ms | all pages |
| CLS | ≤ 0.05 | all pages |
| TTFB | ≤ 200ms | Static from a free CDN edge — easily met |
| Initial JS (marketing) | ≤ 170 KB gz | |
| Initial JS (visualiser) | ≤ 300 KB gz | Heavy libs dynamically imported |
| Homepage total weight | ≤ 1.4 MB | Including hero stills |
| Visualiser frame time | ≤ 16ms | Mid-range Android, 1080p canvas |
| Lighthouse Perf / A11y / BP / SEO | ≥ 90 / 98 / 100 / 100 | Mobile, enforced in CI |

**Enforcement:** `size-limit` route budgets in CI; builds fail on regression. `three.js`, ONNX Runtime, `@react-pdf/renderer`, the background-removal model, and Leaflet are **all dynamically imported** and never in the initial marketing bundle.

**Static export is a performance advantage, not a limitation:** no cold starts, no server round-trip, no database latency — every content page is a CDN file.

## 12.2 SEO
This is the *entire* acquisition channel at ₹0 — there is no ad budget. Treat it as a primary feature.

- **All content routes statically generated.** ~520 pages pre-rendered.
- Unique `title` (≤ 60 chars) and `description` (≤ 155) per route from a central metadata factory.
- JSON-LD: `LocalBusiness`, `Organization`, `BreadcrumbList`, `Article`, `CreativeWork`, `Review`, `AggregateRating`, `FAQPage`, `Service`, `ImageObject`.
- Canonicals, `hreflang` for en/hi, sitemap split by content type, `robots.txt` blocking `/dashboard`, `/d`, `/b`, `/dev`, `/studio-admin`.
- **OG images pre-generated at build** into `/public/og/` with `satori` + `sharp` (both free) — one per project, material, style, post, and quiz result.
- Semantic lowercase-hyphenated URLs.
- **Local SEO:** NAP consistency from `site.ts`, 24 locality landing pages, OSM map embed, Google Business Profile link (free to create).
- Internal linking: every project links to its materials, styles, designers, and locality; every material links back to projects using it.

## 12.3 Security (OWASP Top 10)

Static hosting removes entire attack classes, but the remaining surface must still be handled correctly.

| Risk | Control |
|---|---|
| **A01 Broken Access Control** | No server-side data to expose. All user data is device-local. Share fragments are **never transmitted to a server** (URL fragments are not sent in HTTP requests) — this is a genuine privacy property, not a workaround. `/d`, `/b`, `/dashboard`, `/studio-admin` are `noindex`. |
| **A02 Cryptographic Failures** | HTTPS enforced by the host with HSTS (`max-age=63072000; includeSubDomains`). No secrets in the client bundle — a CI grep fails the build on any high-entropy string or known key prefix in `/out`. Optional adapter keys live in build-time env vars and are never `NEXT_PUBLIC_*` unless genuinely public (e.g. a Turnstile site key). |
| **A03 Injection** | No SQL. All user-generated text (comments, notes, profile name, imported JSON) sanitised with `isomorphic-dompurify` **before render**. `dangerouslySetInnerHTML` permitted **only** for repo-authored MDX — enforced by ESLint. |
| **A04 Insecure Design** | **Imported JSON is untrusted input** — validate every field with zod on import, cap array lengths and string sizes, reject unknown keys, and never `eval`. Same for decoded share fragments: strict zod parse, reject on any failure, cap decompressed size at 256 KB to prevent a zip bomb. Uploads validated by magic bytes, dimensions, and size; re-encoded through canvas to strip EXIF before storage. |
| **A05 Security Misconfiguration** | Strict CSP via `_headers` (Cloudflare Pages): `default-src 'self'; img-src 'self' data: blob:; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`. Note `'wasm-unsafe-eval'` is required for ONNX Runtime in Phase 3 and **must not be widened to `'unsafe-eval'`**. Plus `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying geolocation and microphone and allowing camera only on visualiser/AR routes, `X-Frame-Options: DENY`. Source maps excluded from the production build. |
| **A06 Vulnerable Components** | Dependabot + `npm audit --audit-level=high` gate in CI. `license-checker` gate rejecting GPL/AGPL. |
| **A07 Auth Failures** | No passwords stored, no OTP, so the class is largely eliminated. If Google OAuth is later enabled, use Auth.js defaults with PKCE and state validation. |
| **A08 Integrity Failures** | `package-lock.json` committed; CI uses `npm ci`. SRI on any external script (there should be none). The ONNX model and CC0 assets are served **from our own origin**, never a third-party CDN, and their SHA-256 hashes are committed and verified by `scripts/verify-assets.ts`. |
| **A09 Logging Failures** | No server logs exist. Client errors go to an error boundary with a user-facing recovery path. **Never log phone numbers, addresses, or uploaded image data** — not even to the console. If Sentry is later enabled, enable PII scrubbing. |
| **A10 SSRF** | No server-side fetching of any user-supplied URL, ever. `next.config` `images.remotePatterns` left empty — all images are local. |

**Additional, specific to this design:**
- **Clickjacking on share pages:** `frame-ancestors 'none'`.
- **WhatsApp deep links:** the message body is **URL-encoded via `encodeURIComponent`**, and any user-supplied text embedded in it is length-capped and stripped of control characters, to prevent link-structure injection.
- **`mailto:` links:** same encoding discipline; strip CR/LF to prevent header injection.
- **Third-party requests:** the production site must make **zero** third-party network requests by default. Verify with a Playwright test that asserts every request origin equals the site origin.

## 12.4 Privacy (India DPDP Act 2023)
Zero-cost architecture makes compliance dramatically easier — **most user data never leaves the device.**

- Privacy policy naming data categories, retention, and a grievance officer placeholder.
- Explicit consent checkbox before any WhatsApp/contact hand-off, with the purpose stated.
- **"Your photo stays on your device"** stated prominently in the visualiser — and true.
- User-initiated **export** and **delete all my data** in `/dashboard/profile`, both working fully.
- No third-party trackers. No cookie banner needed by default, because no tracking cookies are set.

## 12.5 Browser & Device Support
Chrome/Edge last 2, Safari 16+, Firefox last 2, Samsung Internet last 2. Mobile-first from 360px. Breakpoints `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Visualiser requires WebGL2 — provide a clear fallback screen with a "browse sample designs instead" path. IndexedDB unavailable (private mode on some browsers) → fall back to in-memory with an honest warning that work will not persist.

## 12.6 PWA
Installable manifest, offline shell for visited content, offline-capable visualiser (all assets cached), background sync not required since writes are local. "Add to Home Screen" prompted only after a second visit with ≥ 2 minutes engagement. **A fully offline-capable design tool is a genuine differentiator and costs nothing.**

## 12.7 Operational Cost Ledger

| Line item | Monthly cost |
|---|---|
| Hosting (Cloudflare Pages) | ₹0 |
| Bandwidth | ₹0 (unlimited) |
| Build minutes (GitHub Actions, public repo) | ₹0 |
| Database | ₹0 (none) |
| File storage | ₹0 (device-local) |
| Email / SMS | ₹0 (WhatsApp + mailto) |
| Analytics (Cloudflare Web Analytics) | ₹0 |
| Fonts, icons, textures, 3D models, ML model | ₹0 (OFL / CC0 / Apache-2.0) |
| Domain | ₹0 on `*.pages.dev`; ~₹900/yr if a custom domain is later wanted |
| **Total** | **₹0** |

---

# 13. PROJECT FILE STRUCTURE

```
atelier/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx  page.tsx
│   │   │   ├── (marketing)/     # projects, services, styles, materials, rooms,
│   │   │   │                    # journal, studio, process, testimonials,
│   │   │   │                    # contact, interior-designers-in-[locality]
│   │   │   ├── (tools)/         # visualiser, planner, estimate, quiz,
│   │   │   │                    # moodboards, inspiration
│   │   │   ├── (booking)/consultation/
│   │   │   ├── (account)/dashboard/
│   │   │   ├── (share)/d/  (share)/b/
│   │   │   └── legal/
│   │   ├── dev/                 # components gallery + content audit (dev only)
│   │   ├── sitemap.ts  robots.ts  manifest.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # Design-system primitives (8.6)
│   │   ├── layout/              # Header, Footer, MobileBar, MegaMenu
│   │   ├── marketing/           # KenBurnsHero, ProjectCard, BeforeAfterSlider,
│   │   │                        # StatCounter, OsmMap, MediaFacade…
│   │   ├── visualiser/
│   │   │   ├── Canvas.tsx       # WebGL2 host
│   │   │   ├── gl/              # shaders + programs + texture cache
│   │   │   │   ├── recolor.frag.glsl
│   │   │   │   ├── material.frag.glsl
│   │   │   │   ├── lighting.frag.glsl
│   │   │   │   └── composite.frag.glsl
│   │   │   ├── tools/           # MagicWand, Polygon, Brush, Perspective
│   │   │   ├── panels/          # MaterialDrawer, LayerPanel, LightingPanel,
│   │   │   │                    # BudgetMeter, AnnotationPanel, HistoryPanel
│   │   │   ├── CompareGrid.tsx  ShareSheet.tsx
│   │   ├── moodboard/  planner/  estimator/  dashboard/
│   ├── lib/
│   │   ├── adapters/
│   │   │   ├── contracts.ts     # Section 10 interfaces
│   │   │   ├── index.ts         # THE ONLY legal import site
│   │   │   └── impl/            # static-content, indexeddb, whatsapp, mailto,
│   │   │                        # sheets, fragment-share, honeypot, noop-analytics
│   │   ├── pricing/             # calculator, pricebook loader, tier logic  [pure]
│   │   ├── color/               # OKLCH, CIEDE2000, palette extraction      [pure]
│   │   ├── image/               # blurhash, phash, heic, exif-strip, resize
│   │   ├── mask/                # RLE codec, flood fill, feather (worker-safe)
│   │   ├── share/               # fragment encode/decode, feedback merge
│   │   ├── ics/                 # calendar file generation
│   │   ├── seo/                 # metadata factory, JSON-LD builders
│   │   ├── i18n/  db/ (idb)  search/ (minisearch)  utils.ts
│   ├── workers/                 # mask.worker.ts, segment.worker.ts,
│   │                            # bgremove.worker.ts, render.worker.ts
│   ├── data/
│   │   ├── demo/                # projects, materials, images, templates,
│   │   │                        # designers, testimonials, clientProject
│   │   ├── shades/              # 240 generated paint shades
│   │   ├── pricebook/2026.09.ts
│   │   └── static/              # localities, styles, roomTypes, services,
│   │                            # furnitureDims, vastuRules, quizProfiles
│   ├── messages/en.json  messages/hi.json
│   ├── config/site.ts  config/nav.ts  config/features.ts  config/runtime.ts
│   ├── hooks/  types/  styles/
├── content/journal/             # 12 MDX posts
├── public/
│   ├── demo/                    # generated images (gitignored, script-built)
│   ├── masks/  textures/  models/  fonts/  og/  icons/
│   └── _headers  _redirects     # Cloudflare Pages config
├── scripts/
│   ├── fetch-demo-assets.ts     # download + derive images
│   ├── generate-shades.ts       # 240 synthetic paint shades
│   ├── author-masks.ts          # MobileSAM-assisted mask authoring
│   ├── generate-og.ts           # satori → /public/og
│   ├── generate-icons.ts        # favicon + PWA set
│   ├── compute-phash.ts         # similarity-search manifest
│   └── verify-assets.ts         # SHA-256 integrity check
├── e2e/                         # Playwright specs
├── docs/
│   ├── ASSET-REPLACEMENT-CHECKLIST.md
│   ├── AUTHORING-ROOM-TEMPLATES.md
│   ├── LEAD-SINK-SETUP.md       # free Google Sheets Apps Script guide
│   ├── ASSET-LICENCES.md
│   ├── CONTENT-GUIDE.md
│   ├── PRICEBOOK.md
│   └── UPGRADE-TO-DB-MODE.md    # the paid path, if ever needed
├── .github/workflows/ci.yml
└── README.md  .env.example
```

---

# 14. BUILD PHASES & MILESTONES

### Phase 0 — Foundation
Repo, Next.js 15 with `output: 'export'` verified working, TS strict, Tailwind v4 with Section 8 tokens, `@fontsource` fonts, ESLint (including the adapter-import and no-raw-img rules), Prettier, Husky, **the full adapter layer with all free default implementations**, `site.ts`, i18n routing for both locales, the complete `components/ui` set with `/dev/components`, GitHub Actions CI, and a live deploy to Cloudflare Pages.

**Exit:** an empty but themed, deployed, type-safe, accessible, statically-exported shell at a public URL, costing ₹0.

### Phase 1 — Marketing Site
Modules A, B, E, F, G(01,03), H, I(01, dashboard), K, L. Full demo dataset per Section 11 including all 24 projects, 120 materials, 240 shades, 12 articles, and the demo client project. Asset pipeline scripts. OG pre-generation.

**Exit:** AT-02…AT-08 pass. Lighthouse budgets met. **The site is genuinely publishable as the firm's real website.**

### Phase 2 — The Visualiser
Module C in full (including the WebGL2 rendering core and fragment-based sharing), Module D, FR-E-02, FR-B-04, FR-G-04, FR-I-03. The 20 masked room templates.

**Exit:** AT-01 passes end-to-end on mobile and desktop, offline.

### Phase 3 — Advanced
Module J, FR-C-03 Tier 2 (MobileSAM), FR-G-02, FR-I-04, FR-K-06, full PWA offline.

**Exit:** AT-09…AT-13 pass with performance budgets still met.

---

# 15. ACCEPTANCE CRITERIA & TEST PLAN

## 15.1 Definition of Done — every feature
- TypeScript strict; no `any` outside typed third-party shims.
- Unit tests on all pure logic (pricing, colour maths, mask RLE, fragment codec, filters, validators, phash) — **≥ 85% coverage on `src/lib`**.
- Component tests for all interactive states.
- Zero axe violations on the containing page.
- Works at 360px and at 200% zoom.
- Works keyboard-only.
- Works with `prefers-reduced-motion`.
- Loading, empty, and error states implemented.
- Both `en` and `hi` render without layout breakage.
- No console errors or warnings.
- Within the route's bundle budget.
- **Works with a completely empty `.env`.**
- **Makes zero third-party network requests.**

## 15.2 Acceptance Tests (Playwright)

| ID | Test |
|---|---|
| **AT-00** | **Zero-cost invariant.** With an empty `.env`, run `next build` with `output: 'export'`, serve `/out` from a plain static file server, and execute the entire AT suite against it. Everything must pass. *This is the gate that proves the ₹0 claim.* |
| **AT-01** | **Critical journey.** Upload a photo → select a wall → apply paint → apply floor tile → switch to night lighting → save Variant A → duplicate to B with a different palette → compare 2-up → generate a share fragment → open it in a fresh browser context → vote and comment as a guest → produce a feedback link → merge it back in the original context → verify the tally → generate an estimate → submit a consultation → assert the WhatsApp URL contains the full transcribed specification, and the enquiry is recorded locally with a reference number. **Desktop Chromium + Mobile Chrome.** |
| **AT-02** | Portfolio filtering: apply 4 facets, verify counts and URL, reload, verify restored, enter a project, go back, verify filters intact. |
| **AT-03** | Estimator: complete all 9 steps, verify a range, switch Standard → Premium, verify the total rises and changed line items are highlighted, download the PDF and assert it is a valid non-empty PDF. |
| **AT-04** | Booking: select a home visit, verify an out-of-area PIN is blocked with an alternative offered, submit, verify the reference number, the `.ics` download, and the calendar link. |
| **AT-05** | i18n: switch to Hindi on a project page, verify the route, persistence, translated nav and CTAs, and Devanagari rendering without clipping. |
| **AT-06** | Accessibility sweep: axe-core across all 15 primary routes, zero violations; full keyboard traversal of header, mega-menu, mobile sheet, filter bar, lightbox, and estimator. |
| **AT-07** | Before/after slider: mouse drag, touch drag, arrow keys, `aria-valuenow` updates. |
| **AT-08** | WhatsApp: assert the deep link from a project page contains the correct number and a correctly URL-encoded, context-specific message including Devanagari and `₹`. |
| **AT-09** | Visualiser performance: apply a material, drag the colour slider 3 seconds, assert median frame time < 20ms via the Performance API. |
| **AT-10** | **Security.** Decoding a malformed/oversized share fragment fails safely with a user-facing error and no crash. Importing a malicious JSON export (unknown keys, 10 MB strings, prototype-pollution keys) is rejected by zod. A comment containing `<img src=x onerror=alert(1)>` renders as inert text. A `.exe` renamed `.jpg` is rejected on upload. |
| **AT-11** | Dashboard: open the demo project, respond to a pending approval with "Request changes" plus a pinned comment, verify the audit trail entry, the state change, and the pre-filled WhatsApp notification. |
| **AT-12** | **Data portability.** Create 2 designs, 1 mood board, 1 estimate → Export all → clear all site data → Import → verify everything restored byte-identically. |
| **AT-13** | **Offline.** Load the site, go offline, verify the visualiser opens, a demo room loads, materials apply, a design saves, and the estimator computes. |
| **AT-14** | **No third-party requests.** Intercept all network traffic across 10 representative routes; assert every request origin equals the site origin. |

## 15.3 Manual QA
Real devices: one mid-range Android (Redmi/Realme class), one iPhone, one iPad, one 1440p desktop. Throttled 4G. Bright sunlight for contrast. Test the WhatsApp hand-off with a real WhatsApp install on both Android and iOS. **Have a non-technical person over 50 attempt to book a consultation unaided — this is a pass/fail gate for FR-L-01.**

---

# 16. APPENDICES

## 16.1 Environment Variables — all optional
```
# The app runs completely with this file empty. Nothing here is required.

NEXT_PUBLIC_SITE_URL=                 # for canonical URLs; defaults to the deploy URL
NEXT_PUBLIC_CF_ANALYTICS_TOKEN=       # Cloudflare Web Analytics — free, optional
NEXT_PUBLIC_TURNSTILE_SITE_KEY=       # free, optional; honeypot used if absent
LEAD_SHEETS_WEBAPP_URL=               # free Google Apps Script endpoint, optional
LEAD_FORM_RELAY_KEY=                  # free form relay, optional
AUTH_GOOGLE_ID=                       # free, optional — only for DB Mode
AUTH_GOOGLE_SECRET=
AUTH_SECRET=
SENTRY_DSN=                           # free tier, optional
```
**Every adapter must be absent-safe.** `AT-00` enforces this.

## 16.2 Feature Flags — `src/config/features.ts`
```ts
export const features = {
  visualiser: true,
  visualiserClickSegment: false,   // Phase 3 — MobileSAM
  floorPlanner: false,             // Phase 3
  ar: false,                       // Phase 3
  similaritySearch: false,         // Phase 3
  projectTracker: true,
  moodBoards: true,
  hindi: true,
  localContentEditor: false,       // Phase 3
  demoBanner: true,                // flip when real content lands
} as const;

export const runtime = {
  dataMode: 'demo',                // 'demo' | 'db'
  authMode: 'local',               // 'local' | 'google'
} as const;
```

## 16.3 Indore Price Book — seed rates
Indicative 2026 Indore market rates for the demo `PriceBook`. **Placeholders — the structure matters more than the numbers.**

| Item | Unit | Essential | Standard | Premium | Luxury |
|---|---|---|---|---|---|
| Full home interior | ₹/sqft carpet | 900 | 1,500 | 2,400 | 3,800 |
| Modular kitchen | ₹/rft | 1,800 | 2,900 | 4,500 | 7,000 |
| Wardrobe (openable) | ₹/rft | 1,400 | 2,200 | 3,400 | 5,200 |
| Wardrobe (sliding) | ₹/rft | 1,900 | 2,800 | 4,200 | 6,400 |
| False ceiling (POP) | ₹/sqft | 85 | 120 | 170 | 240 |
| Painting (interior) | ₹/sqft | 22 | 32 | 48 | 75 |
| TV unit | ₹ each | 22,000 | 38,000 | 65,000 | 110,000 |
| Pooja unit | ₹ each | 18,000 | 32,000 | 55,000 | 95,000 |
| Crockery unit | ₹ each | 16,000 | 28,000 | 46,000 | 78,000 |
| Study table | ₹ each | 12,000 | 20,000 | 34,000 | 55,000 |
| Design fee | % of project | 0 (bundled) | 3% | 5% | 7% |
| Execution / PM | % | 8% | 10% | 12% | 12% |
| GST | % | 18 | 18 | 18 | 18 |

Timelines: 1BHK 6–8 weeks · 2BHK 8–11 · 3BHK 11–15 · 4BHK/villa 16–24. Renovation +20%.
Locality multipliers: Super Corridor / Vijay Nagar / Nipania 1.05 · central Indore 1.00 · outskirts 0.95.

## 16.4 Standard Exclusions
Structural and civil demolition · Plumbing line relocation · Main electrical panel upgrade · Appliances (chimney, hob, oven, refrigerator, washing machine, TV, AC) · Curtains and blinds unless explicitly quoted · Loose décor, artwork, plants · Society permissions and municipal approvals · Waterproofing · Grills and safety doors · Any work outside the flat boundary · Cost changes from client-initiated scope additions after design freeze.

## 16.5 Vastu Advisory Rules
Advisory only, always with the FR-G-04 disclaimer. Kitchen: South-East preferred, North-West acceptable. Pooja room: North-East preferred; avoid under a staircase or against a toilet wall. Master bedroom: South-West. Bed: head to South or East. Study desk: face North or East. Main entrance: North, East, or North-East preferred. Mirrors: avoid facing the bed; North or East walls preferred. Heavy storage: South and West walls. Colours: North-East white/light blue · South-East red/orange accents · South-West earthy browns · North green.

## 16.6 What the Firm Must Eventually Supply
The build needs **nothing** to proceed. To go from demo to real, in priority order:

| Priority | Item | Cost | Replaces |
|---|---|---|---|
| 1 | **Firm name** | ₹0 | `{{FIRM_NAME}}` |
| 2 | **A WhatsApp number** | ₹0 | `{{WHATSAPP}}` — unlocks the entire lead pipeline |
| 3 | **Studio address + phone + email** | ₹0 | Local SEO, `LocalBusiness` schema |
| 4 | **Actual rate card** | ₹0 | The price book — makes estimates real |
| 5 | **Google Business Profile** | ₹0 | Local search presence |
| 6 | **Google Sheets lead sink** (20 lines of Apps Script) | ₹0 | Closes the enquiry-capture gap |
| 7 | **Photographs of real projects** — even phone photos to start | ₹0 | Demo imagery |
| 8 | **Client testimonials** — ask past clients | ₹0 | Demo testimonials |
| 9 | Professional photo shoot | ~₹1.5–2.5 L | Full replacement of demo imagery |
| 10 | Custom domain | ~₹900/yr | `*.pages.dev` |

**Items 1–8 cost nothing and can all be gathered in a week.** Start photographing every site on day one, before work begins — those "before" shots are irreplaceable and the before/after slider is the most persuasive component on the entire site.

## 16.7 Upgrade Path (documented, not built)
`docs/UPGRADE-TO-DB-MODE.md` describes exactly what changes if the firm ever wants cross-device sync and server-side lead capture: add a Postgres instance, write `PrismaContentRepo` and `PrismaUserStore`, add Route Handlers mirroring Section 10, flip `runtime.dataMode` to `'db'`. **No UI, component, or business-logic code changes.** Expected cost at that point: ₹0–1,700/month. Designing for this from day one costs nothing today and saves a rewrite later.

## 16.8 The Single Most Important Instruction
Many interior design websites are beautiful brochures. Many design tools are ugly utilities. **This product's entire value is that it is both, and that the two are connected.**

If a trade-off must be made during the build, always preserve the continuity of the journey in Section 4.2: a visitor's design work must never be lost, must always be shareable, must always be priceable, and must always be one tap from a human designer on WhatsApp.

And note what the zero-cost constraint bought us: a site with **no cold starts, no database latency, no third-party trackers, genuine on-device privacy for customer photographs, full offline capability, and no monthly bill.** Several of those are things the expensive version could not have offered.

---

*End of SRS-IDW-002 v2.0 — Zero-Cost Edition*

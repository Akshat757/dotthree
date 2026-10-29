# Demo Implementation Plan

Goal: a polished, working client demo of the Atelier site, built on the existing code. The reference spec is `SRS.md`; this plan trims it to what the demo needs.

Rules for this plan

- Nothing is committed unless the owner asks.
- Zero-cost rules from the SRS still apply: no paid services, no third-party requests, no dead buttons.
- Demo content stays in data files, never in component code.
- Each phase ends with its own check. Do not start the next phase on a red check.

---

## Scope

### In the demo

Homepage, portfolio and case studies, before/after slider, services, studio and designers, testimonials, process, materials and styles catalogue, style quiz, journal, locations, room visualiser (light version), cost estimator with PDF, consultation booking with WhatsApp and `.ics`, local dashboard.

### Deferred (mention to the client as "planned")

Hindi/English i18n, mood boards, approval workflow and audit trail, progress tracker, full sharing/voting/comment merge, floor planner, 3D, AR, MobileSAM, similarity search, content editor, service worker and offline, full Playwright suite, strict coverage and bundle budgets, legal pages.

### Decisions

- Estimator stays at 4 steps (not the SRS 9).
- Visualiser stays a layered renderer. It must look clean, not top quality. WebGL2 only if the layered result looks flat after Phase 2.
- Demo rooms only: 5 templates. Upload-your-room is kept only if manual region selection works simply; otherwise cut it.
- Sharing is a basic copy-link. No voting or comment merge.

---

## Current state (audited)

- 60 unit tests pass.
- `tsc --noEmit` fails with 29 errors: 22 in `src/components/visualiser/editor.tsx`, 6 in `scripts/check-export-links.ts`, 1 in `src/components/consultation/booking.tsx`.
- Last `next build` failed on a stale `.next/build-manifest.json`.
- Most work since commit A3 is uncommitted (estimate, consultation, quiz, dashboard, visualiser, and others).

---

## Phase 0. Green baseline

Files: `src/types/content.ts`, `src/types/local.ts`, `src/components/visualiser/editor.tsx`, `src/components/consultation/booking.tsx`, `scripts/check-export-links.ts`

1. Reconcile the two `Finish` types (`content.ts` and `local.ts`) into one shared definition.
2. Fix the `template possibly undefined` errors in `editor.tsx` with a proper guard and not-found state.
3. Fix the one error in `booking.tsx` and the six in `check-export-links.ts`.
4. Delete `.next`, run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
5. Confirm `out/` is produced and serves with `npm start`.

Check: typecheck, lint, tests and build all pass.

## Phase 1. Visualiser, clean and usable

Files: `src/components/visualiser/editor.tsx`, `src/app/visualiser/*`, `src/types/local.ts`, `src/lib/` (new helpers)

1. Room picker: 5 demo templates with clear names and thumbnails. Show an error state if a template or mask fails to load.
2. Surface selection: click a surface (or choose from a list) with a visible highlight. Keyboard-accessible.
3. Material and colour swap: apply colour or material to the selected surface. Blend masks smoothly so edges do not look cut out. Respect surface compatibility (existing `COMPAT` table).
4. Finish control (matt, satin, gloss) and basic pattern/scale for tiles where the data supports it.
5. Lighting: morning to night presets, tuned so night is readable and not muddy.
6. Variants A and B: save, switch, duplicate, and a 2-up comparison view.
7. Save to the local store (existing adapters) and show in the dashboard.
8. Copy-link sharing of a design via the existing fragment codec (`src/lib/share/codec.ts`), read-only view, with a safe error for bad links.
9. "Send to WhatsApp" with a spec summary (use `src/lib/whatsapp`).
10. Upload your own room: decide after step 3. Keep only if a simple rectangle/polygon selection works cleanly.
11. Unit tests for any new pure logic (colour blend, variants, codec round trip).

Check: open each of the 5 rooms, change two surfaces, switch to night, save A, duplicate to B with a different palette, compare, copy link, open the link, send to WhatsApp. No console errors, usable at 360px and desktop.

## Phase 2. Estimator completion

Files: `src/components/estimate/wizard.tsx`, `src/app/estimate/*`, `src/lib/pricing/*`

1. Add `/estimate/result` (or an in-page result state) showing the range, tier comparison, line-item breakdown, EMI and timeline.
2. Switching tier highlights the line items that changed.
3. PDF download with `@react-pdf/renderer`, loaded lazily so it does not weigh on first load.
4. Save the estimate to the local store and show it in the dashboard.
5. Hand-off: consultation link and WhatsApp message prefilled from the estimate.
6. Extend `pricing.test.ts` for any new calculation.

Check: complete the wizard, see the result, switch Standard to Premium and see the change, download a non-empty valid PDF.

## Phase 3. Consultation completion

Files: `src/components/consultation/booking.tsx`, `src/app/consultation/*`

1. Add `/consultation/confirmed` with the reference number, `.ics` download, Google Calendar link and WhatsApp send.
2. Out-of-area PIN check for home visits, with an alternative offered.
3. Confirm the enquiry appears in the dashboard.

Check: book a home visit with an in-area and an out-of-area PIN, verify reference number, `.ics` and WhatsApp text (including Devanagari and the rupee sign).

## Phase 4. Demo QA and polish

1. Click through every route in `SRS.md` section 7 that exists. Fix dead buttons, `href="#"`, broken links, missing images. Run `scripts/check-export-links.ts`.
2. Check mobile (360px), tablet and desktop. Check keyboard navigation on header, filters, lightbox, estimator and visualiser.
3. Check the demo banner and demo disclosure copy are present and honest.
4. Remove or hide deferred features from nav and footer so there is nothing that looks unfinished.
5. Add 2 or 3 Playwright smoke tests: visualiser journey, estimator to PDF, consultation booking.
6. Final run: typecheck, lint, tests, build, serve `out/`, smoke tests.

Check: a fresh clone with an empty `.env` builds and serves, and the demo script in `guide.md` works end to end.

## Phase 5. guide.md

Write `guide.md` after Phases 0 to 4 are done and verified, so it describes the real build. It will contain:

1. What the project is and how to run it (install, dev, build, serve).
2. Site map: every section and route, what it does, where its data lives.
3. How to navigate each section.
4. Client showcase script: recommended order, talking points and what to click, with a 10 minute and a 3 minute version.
5. Where to edit demo content (projects, materials, prices, contacts) without touching code.
6. What is deliberately not in the demo, and the Phase 2 and 3 roadmap from `SRS.md`.
7. Known limitations and troubleshooting.

---

## Order of work

Phase 0, then 1, then 2 and 3, then 4, then 5. Phases 2 and 3 are independent of each other; Phase 1 is the largest. I will report back after each phase.

## Risks

- The visualiser may look flat with layered masks. Mitigation: tune blending first; take on WebGL2 only if it still looks odd.
- Type fixes may reveal more issues once the build runs. Mitigation: Phase 0 comes first.
- PDF library size. Mitigation: lazy-load.

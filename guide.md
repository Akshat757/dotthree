# Dot 3 Design Studio — Demo Guide

A walkthrough of the demo site: what every section does, how to move around it, and how to show it to a client.

The site is a **demo build** of a premium interior-design website for an Indore firm. Every project, price, person and photograph is illustrative. A banner at the top of every page says so. Nothing is sent anywhere unless the visitor taps a WhatsApp, email or calendar link.

---

## 1. Run it

You need Node.js 20 or later.

```bash
npm ci
npm run build      # makes the static site in ./out (about 2 minutes)
npm run start      # serves ./out at http://localhost:3000
```

For development with live reload: `npm run dev`.

Before a demo, run through these once on the machine you will present from:

```bash
npm run typecheck
npm run lint
npm test           # 60 unit tests
npm run e2e        # 8 browser smoke tests, desktop and mobile (needs ./out built first)
```

The site needs no accounts, keys or internet connection to run. The `.env` file can stay empty.

**What is saved where.** Designs, estimates and enquiries are stored in the visitor's own browser. If you demo on one laptop and then switch to another, the dashboard will be empty. The Dashboard has Export and Import buttons to move saved work between browsers.

---

## 2. Site map

| Section             | Address                                                  | What it is                                                                                                              |
| ------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Home                | `/`                                                      | Hero, recent work, services, style finder, how it works, client stories, studio, journal, map of where the studio works |
| Gallery             | `/gallery`                                               | The studio's own renders: exteriors, gardens and pools, bedrooms, bathrooms, interiors, with a viewer                   |
| Projects            | `/projects`                                              | 25 sample projects you can filter; each opens a full case study (sample data)                                           |
| Project case study  | `/projects/<name>`                                       | Cost, timeline, designer, before/after slider, gallery, "get this look"                                                 |
| Services            | `/services`, `/services/<name>`                          | 12 services, each with FAQs                                                                                             |
| Styles              | `/styles`, `/styles/<name>`                              | 16 design styles                                                                                                        |
| Rooms               | `/rooms`, `/rooms/<name>`                                | 18 room guides (living room, modular kitchen, pooja room and so on)                                                     |
| Materials           | `/materials`, `/materials/<name>`, `/materials/compare`  | 124 materials with Indore prices; side-by-side compare                                                                  |
| **Room visualiser** | `/visualiser`, `/visualiser/edit`                        | Try colours and materials on 6 demo rooms                                                                               |
| **Cost estimator**  | `/estimate`                                              | Four-step wizard, live price range, PDF                                                                                 |
| Style quiz          | `/quiz`, `/quiz/result`                                  | 8 questions, 8 result profiles                                                                                          |
| **Consultation**    | `/consultation`                                          | Booking with slots, reference number, calendar files                                                                    |
| Dashboard           | `/dashboard`                                             | Saved designs, estimates and enquiries; export and import                                                               |
| Studio              | `/studio`, `/studio/<designer>`, `/studio/careers`       | The firm, 6 designer profiles, careers                                                                                  |
| How we work         | `/process`                                               | Six-step process, what is and isn't included                                                                            |
| Testimonials        | `/testimonials`                                          | 18 reviews, filterable                                                                                                  |
| Journal             | `/journal`, `/journal/<article>`                         | 12 articles; RSS at `/journal/rss.xml`                                                                                  |
| Locations           | `/locations`, `/locations/<area>`                        | 24 areas and nearby cities, for local search                                                                            |
| Contact             | `/contact`                                               | Address, hours, WhatsApp                                                                                                |
| Search              | `/search`                                                | One search box across projects, materials and guides                                                                    |
| Legal               | `/legal/privacy`, `/legal/terms`, `/legal/image-credits` | Demo-honest policy pages                                                                                                |

The static export has 265 pages. Every internal link was checked and none are broken.

---

## 3. Section by section: how to use each one

### Home

Scroll top to bottom. Key buttons: **Try the visualiser**, **Get a cost estimate**, **Chat on WhatsApp**. There is a small estimator on the page too, and a map of the areas the studio serves. On a phone, a bottom bar gives quick access to Home, Projects, Visualiser, Estimate and Call.

### Projects

Pick filter chips (property type, size, style and more) and the list updates. The filters are kept in the address bar, so the browser Back button returns you to the same filtered list, and a filtered address can be shared. Open any project for its case study: what it cost, how long it took, who designed it, and a before/after slider you can drag or move with the arrow keys. A **Get this look** button loads that project's materials into the visualiser.

### Gallery

Filter by Exteriors, Gardens & outdoor living, Bedrooms, Bathrooms and Interiors, and open any picture full-screen with the arrow keys. These are the studio's own 3D renders. The same photos appear on the home page, as hero images, and on the Bathroom, Master bedroom, Guest room, Terrace, Courtyard and Foyer room guides.

### Services, Styles, Rooms

Browse-and-learn pages. Each links onward to the visualiser, the estimator or a consultation.

### Materials

Search and filter the catalogue. Open a material for price, finish, where it suits, and a sample request. Add up to four to the compare tray and open **Compare** to see them side by side.

### Room visualiser (the main attraction)

1. Go to **Visualiser** and choose a room (living room, kitchen, bedroom, bathroom, pooja room, kids' study).
2. In the editor, **click a surface on the room** (wall, floor, ceiling, cabinet, curtain) or choose it from the strip under the picture. The surface lights up.
3. Pick a material from the panel on the right. The room updates at once.
4. Use the **time of day** chips (Morning to Night) to see the room in different light.
5. **Duplicate as new variant** makes Variant B from A. Change B, then press **Compare** to see them side by side. Up to four variants.
6. **Original** switches back to the untouched room.
7. **Save design** keeps all variants on this device; they appear in the Dashboard.
8. **Share link** copies a link that reopens this exact combination (the active variant and its lighting).
9. **Send to a designer** opens WhatsApp with the materials listed. **Estimate with these materials** carries them into the estimator.

Not in this demo: uploading your own photo, and automatic surface detection. The rooms are illustrated scenes.

### Cost estimator

1. Choose home size, finish level, locality and rooms. Work through the four steps with Next and Back, or jump with the step buttons.
2. The price range on the right updates live. It shows timeline and monthly EMI.
3. **Compare tiers** shows all four finish levels side by side. Click a tier, and every line item that moved is highlighted with an arrow and counted ("21 changed").
4. Open **By category**, **By room** and **Line items** for the breakdown.
5. **Download PDF** makes a two-page estimate to hand over.
6. **Save this estimate** keeps it in the Dashboard. **Discuss on WhatsApp** and **Book a consultation** carry the estimate across.

### Style quiz

Answer 8 picture questions and get a style profile with matching projects and a link into the visualiser. The result has its own address, so it can be shared.

### Consultation

1. Choose a type: video call, phone call, studio visit, home visit, site measurement or material selection.
2. Optionally choose a designer, then a day and a time.
3. Fill in name, mobile and (optionally) email, PIN code and notes. Tick the consent box.
4. For home visits and site measurements, a PIN code outside Indore district (452 or 453) shows a notice and a button to switch to a video consultation.
5. **Request this slot** shows a reference number (like `IND-2610-1291`), a **Send on WhatsApp** button with the full details written out, a **Google Calendar** link and an **Apple / Outlook (.ics)** download. The enquiry is also saved in the Dashboard.

### Dashboard

Three tabs: Estimates, Designs, Enquiries. Resume a design, delete items, or **Export** everything to a file and **Import** it elsewhere. **Clear all** wipes this browser's saved data.

### Studio, Process, Testimonials, Journal, Locations, Contact

Trust-building pages. Designer profiles link to a consultation with that designer pre-selected. Journal articles have a table of contents. Location pages are written for local search ("interior designers in Vijay Nagar").

---

## 4. Showing it to the client

### Three-minute version

1. **Home** (30 seconds). "This is the front door; it works the same on a phone."
2. **Visualiser** (90 seconds). Open the living room. Click the back wall, pick a colour. Click the floor, pick a tile. Switch to Night. Press Duplicate, change the wall colour, press Compare. "Your customers do this before they ever call you."
3. **Estimator** (45 seconds). Open it, press Compare tiers, click Premium, point at the highlighted lines, press Download PDF. "A priced, printable range in under a minute."
4. **Consultation** (15 seconds). Show the booking form and mention the reference number and calendar files. "This is where the interest turns into a lead on your WhatsApp."

### Ten-minute version

1. **Home and positioning** (1 min). Scroll the page; point out the "Real homes, real budgets" tone.
2. **Projects** (2 min). Filter by 3 BHK and a style, open a case study, drag the before/after slider, press **Get this look**.
3. **Visualiser** (3 min). As above, then Save, open the Dashboard, and show the saved design. Copy the share link and open it in a new tab to show it restores the same room.
4. **Materials** (1 min). Search a material, open it, compare two.
5. **Estimator** (2 min). Fill in a real-sounding home, use the materials from the visualiser, download the PDF.
6. **Consultation** (1 min). Try a home visit with a Bhopal PIN (462001) to show the out-of-area notice, then book with 452010.
7. Close on the **Dashboard**: everything the visitor did is here, and can be exported.

### Things to say

- "Everything you see is placeholder content. Your photographs, prices and team replace it by editing data files; no redesign needed."
- "It runs on free hosting and has no monthly software cost."
- "Visitors' designs and enquiries stay on their own device until they choose to send them."

### Things to avoid in the room

- Don't promise **uploading customer photos** or **automatic wall detection**; both are planned, not built.
- Don't call the estimate a quote. The page and PDF already say it is indicative.
- The WhatsApp number and phone number are placeholders. Tapping the WhatsApp button opens a chat to a number that isn't yours.

---

## 5. Changing the demo content

All content is in `src/data/demo/` and a few config files. Components never contain content.

| To change                                                       | Edit                                                                                                                    |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Firm name, phone, WhatsApp, email, address, hours, service area | `src/config/site.ts`                                                                                                    |
| Menus and footer links                                          | `src/config/nav.ts`                                                                                                     |
| Projects                                                        | `src/data/demo/projects.ts`                                                                                             |
| Materials and prices shown on material pages                    | `src/data/demo/materials.ts`                                                                                            |
| Estimator rates                                                 | `src/data/pricebook/2026.09.ts`                                                                                         |
| Services, styles, room guides                                   | `services.ts`, `styles.ts`, `roomGuides.ts` in `src/data/demo/`                                                         |
| Designers, testimonials                                         | `designers.ts`, `testimonials.ts`                                                                                       |
| Quiz questions and results                                      | `src/data/demo/quiz.ts`                                                                                                 |
| Visualiser rooms                                                | `src/data/demo/roomTemplates.ts`; images and masks in `public/demo/templates/` (see `docs/AUTHORING-ROOM-TEMPLATES.md`) |
| Journal articles                                                | Markdown files in `content/journal/`                                                                                    |
| The studio's own photos and logo                                | Put files in `dot3_photos/`, list them in `scripts/import-client-photos.ts`, run `npm run assets:client`                |
| Which pages use which photo                                     | `src/data/client/overrides.ts`                                                                                          |
| Turn off the demo banner                                        | `isDemoContent` in `src/config/site.ts` and `demoBanner` in `src/config/features.ts`                                    |

After a change, run `npm run build` again.

To send real enquiries to a Google Sheet or an email relay, see `docs/LEAD-SINK-SETUP.md`. Both are optional and free.

---

## 6. What is not in this demo

These are in the full specification (`SRS.md`) and deliberately left for later:

- Hindi and English switching
- Mood boards
- Upload-your-own-room, and automatic surface detection
- Voting and comments on a shared design
- Client approval workflow and project progress tracker
- Floor planner, 3D walkthrough, AR furniture preview
- Visual similarity search
- In-browser content editor
- Offline use as an installed app

The menu and footer no longer link to any of these, so nothing looks unfinished.

---

## 7. Troubleshooting

| Problem                                           | Fix                                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| The dashboard is empty                            | Saved work lives in the browser you used. Use the same browser, or Export then Import. |
| The visualiser room looks plain                   | Click a surface and pick a material; rooms start with sensible defaults.               |
| Share link opens the wrong room                   | The link includes the room name; copy it again after your last change.                 |
| PDF doesn't download                              | Allow downloads for the site in the browser. The button shows a message if it fails.   |
| `npm run build` fails with a missing `.next` file | Delete the `.next` folder and build again.                                             |
| Browser tests fail with "no such file `out`"      | Run `npm run build` first.                                                             |
| WhatsApp opens the wrong number                   | Change `whatsapp` and `phone` in `src/config/site.ts`.                                 |

---

## 8. Quality checks that were run

- Type check, lint and 60 unit tests pass.
- Static export of 265 pages builds; all internal links resolve.
- 8 browser tests pass on desktop Chrome and a Pixel 7 phone: visualiser (variants, compare, save, share link), estimator (tier change, PDF), consultation (out-of-area block, booking).
- No hard-coded contact details outside `src/config/site.ts`.

Not checked yet: accessibility audit tools, real-device testing, and slow-network performance. Do these before launch, not before the demo.

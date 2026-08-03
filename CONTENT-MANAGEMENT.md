# NexaSoft — Site Content Management Guide

Ei document e full website er **konta kothay theke manage** hoy, ta map kora ache.

**Priority order (live site):**

1. **Firebase Firestore / Storage** (jodi seed/configure kora thake) → wins
2. **Local code fallbacks** (`src/lib/cms.defaults.ts` + `src/assets/`) → Firebase empty/offline hole
3. **`.env` `VITE_*` links** → shudhu offline fallback (Firestore `site_settings/main.links` wins)

---

## Admin panel (`/admin`)

Google Sign-In only. Allowed emails (default / `.env` `ADMIN_EMAILS`):

- `ssnexasoft777@gmail.com`
- `shahedroks@gmail.com`

Open: **http://localhost:8080/admin** (or your current Vite port)

From the panel you can edit:

- Brand, SEO, links, chat, nav, footer
- Every homepage section (hero → lead_capture)
- Projects (create / edit / delete + image upload)
- Image/PDF upload → Firebase Storage URL

Saves write to Firestore (`site_settings`, `cms_sections`, `projects`).  
**Requires** `serviceAccountKey.json` + seed — otherwise panel opens but Save shows Firebase offline error.

Google Cloud Console e authorized JS origin add korun: `http://localhost:8080` (and 8081/8082 if needed).

---

## Firebase on korte (REQUIRED)

Without this, site **local defaults** use kore — Firebase edits asbe na.

1. [Firebase Console](https://console.firebase.google.com) → your project  
2. **Project settings → Service accounts → Generate new private key**  
3. File rename/save → project root: `serviceAccountKey.json` (gitignored)  
4. Console e **Firestore** + **Storage** enable korun  
5. Seed:
   ```bash
   npm run seed:cms
   ```
6. Dev server restart (`npm run dev`)  
7. Check status: [http://localhost:8080/api/cms-status](http://localhost:8080/api/cms-status)  
   - `"source": "firebase"` → connected  
   - `"source": "local-defaults"` → key missing / not configured  

Pore sob text/image edit: **Firestore + Storage** (niche tables).

---

## Quick start

| Kaaj | Kothay |
|------|--------|
| Live text/image edit | Firebase Console → Firestore |
| Image upload | Firebase Console → Storage (URL Firestore e paste) |
| First-time seed | `npm run seed:cms` (service account + Storage enable thakte hobe) |
| Connection check | `GET /api/cms-status` |
| Local offline edit | `src/lib/cms.defaults.ts` + `src/assets/` |
| Social / WhatsApp / booking links | Firestore `site_settings/main` → `links` (ba `.env` fallback) |
| Stripe / Google / email secrets | `.env` only (public site text na) |

Seed source files:

- `scripts/cms-seed-sections.json` → section text
- `scripts/cms-seed-projects.json` → portfolio projects
- `scripts/seed-cms.mjs` → uploads images + writes Firestore

---

## Page sections (homepage top → bottom)

| # | UI section | React component | Firestore path | Main fields |
|---|------------|-----------------|----------------|-------------|
| 1 | Navbar | `Navbar.tsx` | `site_settings/main` | `brandName`, `availabilityLabel`, `ctaLabel`, `navLinks` |
| 2 | Hero | `Hero.tsx` + `HeroMockups.tsx` | `cms_sections/hero` | badge, headline*, subcopy, chips, CTAs, `trustedStrip`, `mockups.screens[]`, `mockups.proofs[]` |
| 3 | About | `About.tsx` | `cms_sections/about` | eyebrow, title, bio, **`portraitUrl`**, portraitAlt, availableBadge, stats[] |
| 4 | Services | `Services.tsx` | `cms_sections/services` | eyebrow, title, subtitle, items[] (iconKey, title, description, points) |
| 5 | Portfolio | `Portfolio.tsx` | `cms_sections/portfolio` + **`projects/{slug}`** | section labels/filters; project cards from `projects` collection |
| 6 | Process | `Process.tsx` | `cms_sections/process` | eyebrow, title, subtitle, steps[] |
| 7 | Tech stack | `TechStack.tsx` | `cms_sections/tech_stack` | eyebrow, title, subtitle, items[] |
| 8 | Why me | `WhyMe.tsx` | `cms_sections/why_me` | eyebrow, title, subtitle, values[] |
| 9 | Pricing | `Pricing.tsx` | `cms_sections/pricing` | plans[] (name, price, bullets, checkout flag…) |
| 10 | Hire / Fiverr–Upwork | `HireWithConfidence.tsx` | `cms_sections/hire` | platforms[] (`hrefKey` → `links.fiverrUrl` / `links.upworkUrl`) |
| 11 | Testimonials | `Testimonials.tsx` | `cms_sections/testimonials` | items[] (quote, name, title, company, avatarUrl?) |
| 12 | FAQ | `FAQ.tsx` | `cms_sections/faq` | faqs[] (`q`, `a`) |
| 13 | Contact + booking | `Contact.tsx` | `cms_sections/contact` + `site_settings/main.links` | form labels/types; booking URL = `links.bookingEmbedUrl` |
| 14 | Footer | `Footer.tsx` | `site_settings/main` | `footer.tagline`, `footer.legalLinks`, social links |
| — | Side dock / chat / lead popup | `SideDock.tsx`, `ChatWidget.tsx`, `LeadCapture.tsx` | `site_settings/main.chat` + `cms_sections/lead_capture` + `links` | chat copy, quick replies, lead title/delay |

Other routes (mostly static pages):

| Route | File | Manage |
|-------|------|--------|
| `/privacy` | `src/routes/privacy.tsx` | Code edit |
| `/terms` | `src/routes/terms.tsx` | Code edit |
| `/pricing/success` | `src/routes/pricing.success.tsx` | Code + Stripe success flow |

---

## Images — konta kothay

### Live (recommended after seed)

Firebase **Storage** path → Firestore field e **download URL** paste.

| Image | Local source file | Storage path (seed) | Firestore field |
|-------|-------------------|---------------------|-----------------|
| About portrait | `src/assets/about-portrait.jpg` | `cms/about/portrait.jpg` | `cms_sections/about` → `portraitUrl` |
| Hero laptop screen | `src/assets/hero-dashboard-admin-v2.png` | `cms/hero/dashboard-admin.png` | `cms_sections/hero` → `mockups.screens[0].src` |
| Hero phone (finance) | `src/assets/hero-screen-finance.png` | `cms/hero/finance.png` | `cms_sections/hero` → `mockups.screens[1].src` |
| Hero phone (fitness) | `src/assets/hero-screen-fitness.png` | `cms/hero/fitness.png` | `cms_sections/hero` → `mockups.screens[2].src` |
| Extra hero/project screens | `hero-screen-dashboard.png`, `hero-screen-shop.png` | `cms/hero/dashboard.png`, `cms/hero/shop.png` | used as project covers/galleries |
| Project covers | same hero screens (seed mapping) | — | `projects/{slug}` → `coverUrl`, `galleryUrls[]` |
| Estimate PDF | `public/project-estimate-guide.pdf` | `cms/docs/estimate.pdf` | `site_settings/main.links.estimatePdfUrl` |
| Favicon | `public/favicon.ico` | — | code / public folder only |

### Project slug → default cover mapping (seed)

| Project slug | Cover image source |
|--------------|-------------------|
| `fintrack` | finance screen |
| `medicare` | dashboard screen |
| `shopease` | shop screen |
| `ridenow` | shop screen |
| `edulearn` | dashboard screen |
| `fitpulse` | fitness screen |

### Local-only change (no Firebase)

1. Replace file under `src/assets/` (same filename), **or**
2. Update import / URL in `src/lib/cms.defaults.ts`

Unused / alternate assets in `src/assets/` (cutouts, old hero devices, `project-*.jpg`) code e active default path e na thakte pare — replace korar age check korun use hocche kina.

---

## Firestore collections map

```
site_settings/
  main                    → brand, SEO, links, chat, nav, footer

cms_sections/
  hero
  about
  services
  portfolio               → section headings + filters only
  process
  tech_stack
  why_me
  pricing
  hire
  testimonials
  faq
  contact
  lead_capture

projects/
  fintrack | medicare | shopease | …   → full portfolio card + coverUrl
```

### `site_settings/main.links` fields

| Field | UI use |
|-------|--------|
| `whatsappNumber` | Side dock / chat / contact WhatsApp |
| `messengerPage` | Messenger deep link |
| `bookingEmbedUrl` | Contact booking embed (Calendly etc.) |
| `githubUrl` | Social / footer |
| `linkedinUrl` | Social / footer |
| `upworkUrl` | Hire section + socials |
| `fiverrUrl` | Hire section + socials |
| `contactEmail` | Contact / mailto |
| `estimatePdfUrl` | Lead magnet / estimate download |

`.env` fallbacks (Firestore empty hole): `VITE_WHATSAPP_NUMBER`, `VITE_MESSENGER_PAGE`, `VITE_BOOKING_EMBED_URL`, `VITE_GITHUB_URL`, `VITE_LINKEDIN_URL`, `VITE_UPWORK_URL`, `VITE_FIVERR_URL`, `VITE_CONTACT_EMAIL`, `VITE_ESTIMATE_PDF_URL`.

---

## Portfolio project fields (`projects/{slug}`)

| Field | Meaning |
|-------|---------|
| `title`, `description`, `category` | Card + modal |
| `tech[]` | Tech chips |
| `coverUrl`, `galleryUrls[]` | Images |
| `problem`, `solution`, `role`, `features[]`, `impact` | Case-study detail |
| `demoUrl`, `githubUrl` | Links |
| `order` | Sort order |
| `published` | `false` hole hide |

Section labels/filters: `cms_sections/portfolio`.

---

## `.env` — secrets & integrations (content na)

Ei values public CMS text na; server/integrations er jonno:

| Area | Keys |
|------|------|
| Google Calendar / Meet | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID` |
| Google Sign-In (browser) | `VITE_GOOGLE_CLIENT_ID` |
| Firebase Admin | `FIREBASE_*` / `serviceAccountKey.json` |
| Meeting emails | `MEETING_HOST_*`, `RESEND_*`, `CONTACT_NOTIFY_EMAIL` |
| Stripe deposits | `STRIPE_*`, `VITE_STRIPE_PUBLISHABLE_KEY`, `SITE_URL` |
| Calendly webhook | `CALENDLY_WEBHOOK_SIGNING_KEY` |

Copy template: `.env.example`.

---

## Common edit recipes

### About photo change
1. Upload new image → Storage `cms/about/portrait.jpg` (or any path)
2. Copy download URL → Firestore `cms_sections/about` → `portraitUrl`
3. **Or** replace `src/assets/about-portrait.jpg` locally (fallback / no Firebase)

### Hero mockup screens change
1. Upload new PNGs to Storage
2. Update `cms_sections/hero.mockups.screens[].src` (+ `alt` / `kind`)

### New portfolio project
1. Firestore `projects/{new-slug}` document create (fields upore)
2. `coverUrl` / `galleryUrls` set
3. `published: true`, `order` set

### WhatsApp / booking / socials
Edit `site_settings/main` → `links` (preferred), or `.env` `VITE_*` for local fallback.

### Brand name / SEO title
`site_settings/main` → `brandName`, `seo.title`, `seo.description`

### Chat widget text
`site_settings/main` → `chat`

### Re-seed everything from repo
```bash
npm run seed:cms
```
⚠️ Overwrites Firestore `site_settings/main`, `cms_sections/*`, `projects/*` from seed JSON + uploads local assets. Live Console edits overwrite hoye jabe.

---

## Code vs CMS (layout / design)

| Change type | Where |
|-------------|--------|
| Text, stats, CTAs, links, images URLs | Firestore / seed / defaults |
| Colors, spacing, animation, layout | `src/styles.css`, component `.tsx` |
| Section order on homepage | `src/routes/index.tsx` |
| Types / field shapes | `src/lib/cms.types.ts` |
| Default offline content | `src/lib/cms.defaults.ts` |

---

## Mental model

```
Visitor loads /
    → loader: getCmsBundle()  (src/lib/cms.server.ts)
        → merge Firestore over getCmsDefaults()
    → CmsProvider
        → each section component reads useCms()
```

Firebase na thakle / fail hole pura site **local defaults + `src/assets`** diye cholbe.

---

## Checklist — “ami ki change korte chai?”

| Ami change korte chai… | Edit here |
|------------------------|-----------|
| About photo | `portraitUrl` ba `src/assets/about-portrait.jpg` |
| About bio / stats | `cms_sections/about` |
| Hero headline / chips | `cms_sections/hero` |
| Hero device screenshots | `cms_sections/hero` → `mockups.screens` |
| Services list | `cms_sections/services` |
| Project card / case study | `projects/{slug}` |
| Pricing plans copy | `cms_sections/pricing` |
| FAQ | `cms_sections/faq` |
| Testimonials | `cms_sections/testimonials` |
| Nav menu labels | `site_settings/main.navLinks` |
| WhatsApp number | `site_settings/main.links.whatsappNumber` |
| Calendly / booking | `site_settings/main.links.bookingEmbedUrl` |
| Fiverr / Upwork URLs | `site_settings/main.links` |
| SEO title/description | `site_settings/main.seo` |
| Estimate PDF | Storage + `links.estimatePdfUrl` ba `public/project-estimate-guide.pdf` |
| Stripe deposit amount | `.env` `STRIPE_DEPOSIT_*` |
| Meeting host email | `.env` `MEETING_HOST_*` / Resend |

---

*Last aligned with codebase CMS types, seed script, and homepage section order.*

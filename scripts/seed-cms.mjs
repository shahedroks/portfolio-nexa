/**
 * Seed Firebase CMS (Firestore + Storage) from current site content.
 *
 * Usage (from project root, with serviceAccountKey.json present):
 *   node scripts/seed-cms.mjs
 *
 * Re-runnable: overwrites site_settings/main, cms_sections/*, and projects/*.
 * After seeding, edit content in Firebase Console; replace images in Storage
 * and paste new download URLs into the matching Firestore fields.
 */

import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve, extname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

function loadEnvFile() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function loadServiceAccount() {
  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    "serviceAccountKey.json",
    "firebase-service-account.json",
  ].filter(Boolean);

  for (const relative of candidates) {
    const absolute = resolve(root, relative);
    if (!existsSync(absolute)) continue;
    const raw = JSON.parse(readFileSync(absolute, "utf8"));
    if (raw.project_id && raw.client_email && raw.private_key) return raw;
  }
  throw new Error("Missing serviceAccountKey.json (or FIREBASE_SERVICE_ACCOUNT_PATH).");
}

function contentTypeFor(path) {
  const ext = extname(path).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".pdf") return "application/pdf";
  return "application/octet-stream";
}

async function uploadFile(bucket, storagePath, localRelative) {
  const localPath = resolve(root, localRelative);
  if (!existsSync(localPath)) {
    console.warn(`  skip missing: ${localRelative}`);
    return null;
  }
  try {
    const token = randomUUID();
    const file = bucket.file(storagePath);
    await file.save(readFileSync(localPath), {
      resumable: false,
      metadata: {
        contentType: contentTypeFor(localPath),
        metadata: { firebaseStorageDownloadTokens: token },
        cacheControl: "public, max-age=31536000",
      },
    });
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
    console.log(`  uploaded ${storagePath}`);
    return url;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`  upload failed ${storagePath}: ${message}`);
    return null;
  }
}

function env(key, fallback = "") {
  return (process.env[key] || "").trim() || fallback;
}

async function main() {
  loadEnvFile();
  const sa = loadServiceAccount();
  const projectId = sa.project_id;
  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET ||
    sa.storage_bucket ||
    `${projectId}.firebasestorage.app`;
  const altBucket = `${projectId}.appspot.com`;

  const app =
    getApps()[0] ||
    initializeApp({
      credential: cert({
        projectId,
        clientEmail: sa.client_email,
        privateKey: sa.private_key,
      }),
      storageBucket: bucketName,
    });

  const db = getFirestore(app);
  const storage = getStorage(app);

  let bucket = storage.bucket(bucketName);
  try {
    const [exists] = await bucket.exists();
    if (!exists) {
      console.warn(`Bucket ${bucketName} missing, trying ${altBucket}`);
      bucket = storage.bucket(altBucket);
    }
  } catch {
    bucket = storage.bucket(altBucket);
  }

  console.log(`Seeding CMS into project ${projectId} / bucket ${bucket.name}`);
  console.log(
    "Note: if uploads fail, enable Firebase Storage in the Console, then re-run this script.",
  );

  const urls = {
    portrait: await uploadFile(bucket, "cms/about/portrait.jpg", "src/assets/about-portrait.jpg"),
    heroLaptop: await uploadFile(
      bucket,
      "cms/hero/dashboard-admin.png",
      "src/assets/hero-dashboard-admin-v2.png",
    ),
    finance: await uploadFile(bucket, "cms/hero/finance.png", "src/assets/hero-screen-finance.png"),
    fitness: await uploadFile(bucket, "cms/hero/fitness.png", "src/assets/hero-screen-fitness.png"),
    dashboard: await uploadFile(
      bucket,
      "cms/hero/dashboard.png",
      "src/assets/hero-screen-dashboard.png",
    ),
    shop: await uploadFile(bucket, "cms/hero/shop.png", "src/assets/hero-screen-shop.png"),
    estimate: await uploadFile(
      bucket,
      "cms/docs/estimate.pdf",
      "public/project-estimate-guide.pdf",
    ),
  };

  const uploadedCount = Object.values(urls).filter(Boolean).length;
  if (uploadedCount === 0) {
    console.warn(
      "\nNo Storage uploads succeeded. Firestore text will still be seeded; image fields stay empty so the site uses local asset fallbacks.\n",
    );
  }

  const whatsapp = env("VITE_WHATSAPP_NUMBER", "8801819664385").replace(/\D/g, "");
  const links = {
    whatsappNumber: whatsapp,
    messengerPage: env("VITE_MESSENGER_PAGE", "nexasoft"),
    bookingEmbedUrl: env("VITE_BOOKING_EMBED_URL", ""),
    githubUrl: env("VITE_GITHUB_URL", "https://github.com/"),
    linkedinUrl: env("VITE_LINKEDIN_URL", "https://www.linkedin.com/"),
    upworkUrl: env("VITE_UPWORK_URL", "https://www.upwork.com/freelancers/"),
    fiverrUrl: env("VITE_FIVERR_URL", "https://www.fiverr.com/"),
    contactEmail: env("VITE_CONTACT_EMAIL", "mailto:ssnexasoft777@gmail.com"),
    estimatePdfUrl: urls.estimate || "/project-estimate-guide.pdf",
  };

  const settings = {
    brandName: "NexaSoft",
    availabilityLabel: "Available for hire",
    ctaLabel: "Book a Call",
    seo: {
      title:
        "Flutter Developer for US Clients | Mobile App, Admin Panel & Web — NexaSoft",
      description:
        "Hire NexaSoft for Flutter mobile apps, admin dashboards, and conversion-focused websites. Remote-friendly delivery for US startups and growing teams.",
    },
    links,
    chat: {
      title: "Chat with NexaSoft",
      statusLabel: "Usually replies within minutes",
      intro:
        "Hi! Ask anything about Flutter apps, admin panels, timelines, or pricing — pick a channel below and we'll continue the chat instantly.",
      defaultMessage:
        "Hi NexaSoft — I visited your website and want to discuss a project.",
      fallbackMessage: "Hi NexaSoft — I'd like to chat about a project.",
      quickReplies: [
        "I need a Flutter app quote",
        "Can we book a discovery call?",
        "What's your typical timeline?",
        "Do you build admin panels too?",
      ],
    },
    navLinks: [
      { label: "Home", href: "#home" },
      { label: "About", href: "#about" },
      { label: "Services", href: "#services" },
      { label: "Projects", href: "#projects" },
      { label: "Testimonials", href: "#testimonials" },
      { label: "Contact", href: "#contact" },
    ],
    footer: {
      tagline:
        "Flutter & full-stack developer building mobile apps, admin panels, and websites for businesses worldwide.",
      legalLinks: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  };

  // Sections: write image-bearing docs fully; other sections use marker so Console has editable docs.
  // Full text lives in site defaults as fallback; seed writes complete copies for Console editing.
  const seedJsonPath = resolve(root, "scripts/cms-seed-sections.json");
  if (!existsSync(seedJsonPath)) {
    throw new Error("Missing scripts/cms-seed-sections.json");
  }
  const sections = JSON.parse(readFileSync(seedJsonPath, "utf8"));

  // Patch Storage URLs into image fields (omit when upload failed so site keeps local fallbacks)
  if (sections.about) {
    if (urls.portrait) sections.about.portraitUrl = urls.portrait;
    else delete sections.about.portraitUrl;
  }
  if (sections.hero?.mockups?.screens) {
    const screens = sections.hero.mockups.screens;
    if (urls.heroLaptop && screens[0]) screens[0].src = urls.heroLaptop;
    if (urls.finance && screens[1]) screens[1].src = urls.finance;
    if (urls.fitness && screens[2]) screens[2].src = urls.fitness;
    if (!urls.heroLaptop && !urls.finance && !urls.fitness) {
      delete sections.hero.mockups.screens;
    }
  }

  const projectCovers = {
    fintrack: urls.finance,
    medicare: urls.dashboard,
    shopease: urls.shop,
    ridenow: urls.shop,
    edulearn: urls.dashboard,
    fitpulse: urls.fitness,
  };
  const projectGalleries = {
    fintrack: [urls.finance, urls.dashboard, urls.shop],
    medicare: [urls.dashboard, urls.finance, urls.shop],
    shopease: [urls.shop, urls.dashboard, urls.finance],
    ridenow: [urls.shop, urls.fitness, urls.finance],
    edulearn: [urls.dashboard, urls.shop, urls.fitness],
    fitpulse: [urls.fitness, urls.finance, urls.dashboard],
  };

  const projectsPath = resolve(root, "scripts/cms-seed-projects.json");
  if (!existsSync(projectsPath)) {
    throw new Error("Missing scripts/cms-seed-projects.json");
  }
  const projects = JSON.parse(readFileSync(projectsPath, "utf8"));

  const now = new Date().toISOString();
  await db.collection("site_settings").doc("main").set({ ...settings, updatedAt: now }, { merge: true });
  console.log("Wrote site_settings/main");

  for (const [id, data] of Object.entries(sections)) {
    await db.collection("cms_sections").doc(id).set({ ...data, updatedAt: now }, { merge: true });
    console.log(`Wrote cms_sections/${id}`);
  }

  for (const project of projects) {
    const coverUrl = projectCovers[project.slug] || "";
    const galleryUrls = (projectGalleries[project.slug] || [coverUrl]).filter(Boolean);
    const payload = {
      ...project,
      published: true,
      updatedAt: now,
    };
    if (coverUrl) payload.coverUrl = coverUrl;
    if (galleryUrls.length) payload.galleryUrls = galleryUrls;
    await db.collection("projects").doc(project.slug).set(payload, { merge: true });
    console.log(`Wrote projects/${project.slug}`);
  }

  console.log("\nCMS seed complete. Edit content in Firebase Console.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

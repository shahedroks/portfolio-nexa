/**
 * Push public marketing link values from .env → Firestore site_settings/main.links
 *
 * Usage:
 *   node scripts/sync-env-links-to-firebase.mjs
 *
 * After this, edit links only in Firebase Console (site_settings/main → links).
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

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

function env(key, fallback = "") {
  return (process.env[key] || "").trim() || fallback;
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
  throw new Error("Missing serviceAccountKey.json");
}

async function main() {
  loadEnvFile();
  const sa = loadServiceAccount();
  const app =
    getApps()[0] ||
    initializeApp({
      credential: cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: sa.private_key,
      }),
      projectId: sa.project_id,
    });

  const links = {
    whatsappNumber: env("VITE_WHATSAPP_NUMBER", "8801000000000").replace(/\D/g, ""),
    messengerPage: env("VITE_MESSENGER_PAGE", "nexasoft"),
    bookingEmbedUrl: env("VITE_BOOKING_EMBED_URL") || env("VITE_CALENDLY_URL"),
    githubUrl: env("VITE_GITHUB_URL", "https://github.com/"),
    linkedinUrl: env("VITE_LINKEDIN_URL", "https://www.linkedin.com/"),
    upworkUrl: env("VITE_UPWORK_URL", "https://www.upwork.com/freelancers/"),
    fiverrUrl: env("VITE_FIVERR_URL", "https://www.fiverr.com/"),
    contactEmail: env("VITE_CONTACT_EMAIL", "mailto:ssnexasoft777@gmail.com"),
    estimatePdfUrl: env("VITE_ESTIMATE_PDF_URL", "/project-estimate-guide.pdf"),
  };

  const db = getFirestore(app);
  await db.collection("site_settings").doc("main").set(
    { links, updatedAt: new Date().toISOString() },
    { merge: true },
  );

  console.log("Updated site_settings/main.links:");
  console.log(JSON.stringify(links, null, 2));
  console.log("\nEdit these in Firebase Console going forward.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

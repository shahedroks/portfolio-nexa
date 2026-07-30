import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { env } from "@/lib/contact-store.server";

let app: App | null = null;
let db: Firestore | null = null;
let initTried = false;

type ServiceAccountJson = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function resolveServiceAccountPath() {
  const fromEnv = env("FIREBASE_SERVICE_ACCOUNT_PATH");
  const candidates = [
    fromEnv,
    "serviceAccountKey.json",
    "firebase-service-account.json",
    "secrets/serviceAccountKey.json",
  ].filter(Boolean) as string[];

  for (const relative of candidates) {
    const absolute = resolve(process.cwd(), relative);
    if (existsSync(absolute)) return absolute;
  }
  return null;
}

function loadServiceAccount(): ServiceAccount | null {
  const jsonPath = resolveServiceAccountPath();
  if (jsonPath) {
    const raw = JSON.parse(readFileSync(jsonPath, "utf8")) as ServiceAccountJson;
    if (raw.project_id && raw.client_email && raw.private_key) {
      return {
        projectId: raw.project_id,
        clientEmail: raw.client_email,
        privateKey: raw.private_key,
      };
    }
  }

  // Fallback: individual env vars
  const projectId = env("FIREBASE_PROJECT_ID");
  const clientEmail = env("FIREBASE_CLIENT_EMAIL");
  const privateKey = env("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  return null;
}

function initFirebase() {
  if (initTried) return db;
  initTried = true;

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.warn(
      "Firebase not configured. Place serviceAccountKey.json in the project root, or set FIREBASE_* env vars.",
    );
    return null;
  }

  try {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId,
      });
    db = getFirestore(app);
  } catch (err) {
    console.error("Firebase init failed:", err);
    db = null;
  }

  return db;
}

export function isFirebaseConfigured() {
  return Boolean(loadServiceAccount());
}

export async function saveGoogleLeadToFirebase(data: {
  name: string;
  email: string;
  picture?: string;
  source: string;
}) {
  const firestore = initFirebase();
  if (!firestore) {
    return { saved: false as const, reason: "Firebase is not configured." };
  }

  try {
    const now = new Date().toISOString();
    const ref = firestore.collection("google_leads").doc(data.email.toLowerCase());
    const existing = await ref.get();

    await ref.set(
      {
        name: data.name,
        email: data.email.toLowerCase(),
        picture: data.picture ?? null,
        source: data.source,
        updatedAt: now,
        lastSeenAt: now,
        ...(existing.exists ? {} : { createdAt: now }),
      },
      { merge: true },
    );

    await firestore.collection("google_lead_events").add({
      email: data.email.toLowerCase(),
      name: data.name,
      source: data.source,
      createdAt: now,
    });

    return { saved: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Firestore write failed.";
    console.error("Firebase Google lead save failed:", message);
    return { saved: false as const, reason: message };
  }
}

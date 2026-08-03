import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { env } from "@/lib/contact-store.server";

let app: App | null = null;
let db: Firestore | null = null;
let storage: Storage | null = null;
let initTried = false;

type ServiceAccountJson = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
  storage_bucket?: string;
};

type SaveResult = { saved: true } | { saved: false; reason: string };

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

function resolveStorageBucket(projectId?: string, fromJson?: string) {
  return (
    env("FIREBASE_STORAGE_BUCKET") ||
    fromJson ||
    (projectId ? `${projectId}.appspot.com` : undefined)
  );
}

function loadServiceAccount(): (ServiceAccount & { storageBucket?: string }) | null {
  const jsonPath = resolveServiceAccountPath();
  if (jsonPath) {
    const raw = JSON.parse(readFileSync(jsonPath, "utf8")) as ServiceAccountJson;
    if (raw.project_id && raw.client_email && raw.private_key) {
      return {
        projectId: raw.project_id,
        clientEmail: raw.client_email,
        privateKey: raw.private_key,
        storageBucket: resolveStorageBucket(raw.project_id, raw.storage_bucket),
      };
    }
  }

  const projectId = env("FIREBASE_PROJECT_ID");
  const clientEmail = env("FIREBASE_CLIENT_EMAIL");
  const privateKey = env("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey,
      storageBucket: resolveStorageBucket(projectId),
    };
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
        storageBucket: serviceAccount.storageBucket,
      });
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.error("Firebase init failed:", err);
    db = null;
    storage = null;
  }

  return db;
}

export function isFirebaseConfigured() {
  return Boolean(loadServiceAccount());
}

export function getFirebaseApp() {
  initFirebase();
  return app;
}

export function getFirestoreDb() {
  return initFirebase();
}

export function getFirebaseStorage() {
  initFirebase();
  return storage;
}

export async function readFirestoreDoc<T extends Record<string, unknown>>(
  collection: string,
  docId: string,
): Promise<T | null> {
  const firestore = initFirebase();
  if (!firestore) return null;
  try {
    const snap = await withTimeout(firestore.collection(collection).doc(docId).get());
    if (!snap.exists) return null;
    return snap.data() as T;
  } catch (err) {
    console.error(`Firebase read failed [${collection}/${docId}]:`, err);
    return null;
  }
}

export async function listFirestoreCollection<T extends Record<string, unknown>>(
  collection: string,
): Promise<Array<T & { id: string }>> {
  const firestore = initFirebase();
  if (!firestore) return [];
  try {
    const snap = await withTimeout(firestore.collection(collection).get());
    return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as T) }));
  } catch (err) {
    console.error(`Firebase list failed [${collection}]:`, err);
    return [];
  }
}

async function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Firebase timed out after ${ms}ms`)), ms),
    ),
  ]);
}

async function writeDoc(
  collection: string,
  data: Record<string, unknown>,
  docId?: string,
  options?: { merge?: boolean },
): Promise<SaveResult> {
  const firestore = initFirebase();
  if (!firestore) {
    return { saved: false, reason: "Firebase is not configured." };
  }

  try {
    const now = new Date().toISOString();
    const payload = { ...data, updatedAt: now, createdAt: data.createdAt ?? now };
    const merge = options?.merge !== false;

    if (docId) {
      const ref = firestore.collection(collection).doc(docId);
      await withTimeout(ref.set(payload, { merge }));
    } else {
      await withTimeout(firestore.collection(collection).add(payload));
    }

    return { saved: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Firestore write failed.";
    console.error(`Firebase write failed [${collection}]:`, message);
    return { saved: false, reason: message };
  }
}

/** Public CMS / admin writes */
export async function writeFirestoreDoc(
  collection: string,
  docId: string,
  data: Record<string, unknown>,
  options?: { merge?: boolean },
) {
  return writeDoc(collection, data, docId, options);
}

export async function deleteFirestoreDoc(collection: string, docId: string): Promise<SaveResult> {
  const firestore = initFirebase();
  if (!firestore) {
    return { saved: false, reason: "Firebase is not configured." };
  }
  try {
    await withTimeout(firestore.collection(collection).doc(docId).delete());
    return { saved: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Firestore delete failed.";
    console.error(`Firebase delete failed [${collection}/${docId}]:`, message);
    return { saved: false, reason: message };
  }
}

export async function uploadCmsFile(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
): Promise<{ saved: true; url: string } | { saved: false; reason: string }> {
  const bucket = getFirebaseStorage()?.bucket();
  if (!bucket) {
    return { saved: false, reason: "Firebase Storage is not configured." };
  }
  try {
    const { randomUUID } = await import("node:crypto");
    const token = randomUUID();
    const file = bucket.file(storagePath);
    await withTimeout(
      file.save(buffer, {
        resumable: false,
        metadata: {
          contentType,
          metadata: { firebaseStorageDownloadTokens: token },
          cacheControl: "public, max-age=31536000",
        },
      }),
      30_000,
    );
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
    return { saved: true, url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Storage upload failed.";
    console.error("Firebase Storage upload failed:", message);
    return { saved: false, reason: message };
  }
}

/** Google One Tap / Sign-In visitors */
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
    const email = data.email.toLowerCase();
    const ref = firestore.collection("google_leads").doc(email);
    const existing = await withTimeout(ref.get());

    await withTimeout(
      ref.set(
        {
          name: data.name,
          email,
          picture: data.picture ?? null,
          source: data.source,
          updatedAt: now,
          lastSeenAt: now,
          ...(existing.exists ? {} : { createdAt: now }),
        },
        { merge: true },
      ),
    );

    await withTimeout(
      firestore.collection("google_lead_events").add({
        email,
        name: data.name,
        source: data.source,
        createdAt: now,
      }),
    );

    // Also mirror into unified leads collection
    await withTimeout(
      firestore.collection("leads").doc(email).set(
        {
          name: data.name,
          email,
          phone: "Not provided (Google login)",
          source: data.source,
          picture: data.picture ?? null,
          updatedAt: now,
          lastSeenAt: now,
          ...(existing.exists ? {} : { createdAt: now }),
        },
        { merge: true },
      ),
    );

    return { saved: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Firestore write failed.";
    console.error("Firebase Google lead save failed:", message);
    return { saved: false as const, reason: message };
  }
}

/** Project brief / contact form */
export async function saveContactToFirebase(data: {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  message: string;
  createdAt: string;
}) {
  return writeDoc(
    "contacts",
    {
      id: data.id,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      projectType: data.projectType,
      budget: data.budget,
      message: data.message,
      createdAt: data.createdAt,
      type: "project_brief",
    },
    data.id,
  );
}

/** Lead popup / PDF magnet / newsletter */
export async function saveLeadToFirebase(data: {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  note?: string;
  createdAt: string;
}) {
  const email = data.email.toLowerCase();
  const result = await writeDoc(
    "leads",
    {
      id: data.id,
      name: data.name,
      email,
      phone: data.phone,
      source: data.source,
      note: data.note ?? null,
      createdAt: data.createdAt,
      lastSeenAt: data.createdAt,
    },
    email,
  );

  // Keep an append-only event log too
  if (result.saved) {
    await writeDoc("lead_events", {
      leadId: data.id,
      name: data.name,
      email,
      phone: data.phone,
      source: data.source,
      note: data.note ?? null,
      createdAt: data.createdAt,
    });
  }

  return result;
}

/** Site meeting bookings (custom form / Google Meet) */
export async function saveMeetingToFirebase(data: {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  notes?: string;
  meetLink?: string;
  eventId?: string;
}) {
  return writeDoc("meetings", {
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone,
    date: data.date,
    time: data.time,
    notes: data.notes ?? null,
    meetLink: data.meetLink ?? null,
    eventId: data.eventId ?? null,
    source: "site-meeting-form",
  });
}

/** Calendly bookings (optional webhook / manual log) */
export async function saveBookingToFirebase(data: {
  name?: string;
  email?: string;
  eventName?: string;
  startTime?: string;
  endTime?: string;
  meetLink?: string;
  raw?: Record<string, unknown>;
  source?: string;
}) {
  return writeDoc("bookings", {
    name: data.name ?? null,
    email: data.email?.toLowerCase() ?? null,
    eventName: data.eventName ?? null,
    startTime: data.startTime ?? null,
    endTime: data.endTime ?? null,
    meetLink: data.meetLink ?? null,
    source: data.source ?? "calendly",
    raw: data.raw ?? null,
  });
}

/** Chat widget clicks / intents */
export async function saveChatIntentToFirebase(data: {
  channel: string;
  message?: string;
  page?: string;
}) {
  return writeDoc("chat_events", {
    channel: data.channel,
    message: data.message ?? null,
    page: data.page ?? null,
    source: "chat-widget",
  });
}

/** Stripe Checkout deposits */
export async function savePaymentToFirebase(data: {
  sessionId: string;
  email?: string | null;
  amount?: number | null;
  currency?: string | null;
  plan?: string | null;
  status: string;
  paymentIntentId?: string | null;
}) {
  return writeDoc(
    "payments",
    {
      sessionId: data.sessionId,
      email: data.email?.toLowerCase() ?? null,
      amount: data.amount ?? null,
      currency: data.currency ?? "usd",
      plan: data.plan ?? null,
      status: data.status,
      paymentIntentId: data.paymentIntentId ?? null,
      source: "stripe-checkout",
    },
    data.sessionId,
  );
}

/** One-time / health: ensure core collections exist */
export async function ensureFirebaseCollections() {
  const now = new Date().toISOString();
  const results = await Promise.all([
    writeDoc("_meta", { key: "setup", status: "ok", at: now }, "setup"),
    writeDoc("leads", { name: "System", email: "_setup@nexasoft.local", source: "setup", phone: "—" }, "_setup"),
    writeDoc("contacts", { name: "System", email: "_setup@nexasoft.local", type: "setup" }, "_setup"),
    writeDoc("meetings", { name: "System", email: "_setup@nexasoft.local", source: "setup" }, "_setup"),
    writeDoc("bookings", { name: "System", email: "_setup@nexasoft.local", source: "setup" }, "_setup"),
    writeDoc("google_leads", { name: "System", email: "_setup@nexasoft.local", source: "setup" }, "_setup@nexasoft.local"),
    writeDoc("chat_events", { channel: "setup", source: "setup" }, "_setup"),
  ]);
  return results.every((r) => r.saved);
}

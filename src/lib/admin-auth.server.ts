import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/contact-store.server";

export const ADMIN_COOKIE = "nexasoft_admin";

const DEFAULT_ADMINS = ["ssnexasoft777@gmail.com", "shahedroks@gmail.com"];

export type AdminSession = {
  email: string;
  name: string;
  picture?: string;
  exp: number;
};

export function getAdminAllowlist(): string[] {
  const fromEnv = env("ADMIN_EMAILS");
  if (fromEnv?.trim()) {
    return fromEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }
  return DEFAULT_ADMINS.map((e) => e.toLowerCase());
}

export function isAdminEmail(email: string) {
  return getAdminAllowlist().includes(email.trim().toLowerCase());
}

function sessionSecret() {
  return (
    env("ADMIN_SESSION_SECRET") ||
    env("GOOGLE_CLIENT_SECRET") ||
    env("GOOGLE_CLIENT_ID") ||
    "nexasoft-dev-admin-secret"
  );
}

function b64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signAdminSession(session: Omit<AdminSession, "exp">, ttlSeconds = 60 * 60 * 24 * 7) {
  const payload: AdminSession = {
    ...session,
    email: session.email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac("sha256", sessionSecret()).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): AdminSession | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = b64url(createHmac("sha256", sessionSecret()).update(body).digest());
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(fromB64url(body).toString("utf8")) as AdminSession;
    if (!payload?.email || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!isAdminEmail(payload.email)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function adminCookieHeader(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${secure}`;
}

export function clearAdminCookieHeader() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function readCookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") || "";
  const parts = raw.split(";").map((p) => p.trim());
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

export function requireAdmin(request: Request): AdminSession | Response {
  const token = readCookie(request, ADMIN_COOKIE);
  const session = verifyAdminSessionToken(token);
  if (!session) {
    return Response.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }
  return session;
}

export async function verifyGoogleIdToken(credential: string) {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
  );
  const profile = (await res.json()) as {
    email?: string;
    name?: string;
    picture?: string;
    aud?: string;
    email_verified?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !profile.email) {
    throw new Error(profile.error_description ?? profile.error ?? "Invalid Google credential.");
  }
  const expectedAud = env("VITE_GOOGLE_CLIENT_ID") || env("GOOGLE_CLIENT_ID");
  if (expectedAud && profile.aud && profile.aud !== expectedAud) {
    throw new Error("Google credential audience mismatch.");
  }
  if (profile.email_verified === "false") {
    throw new Error("Google email is not verified.");
  }
  return {
    email: profile.email.toLowerCase(),
    name: profile.name?.trim() || profile.email.split("@")[0] || "Admin",
    picture: profile.picture,
  };
}

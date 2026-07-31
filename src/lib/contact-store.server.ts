import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resend } from "resend";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  message: string;
  createdAt: string;
}

export interface LeadSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  note?: string;
  createdAt: string;
}

const submissions: ContactSubmission[] = [];
const leads: LeadSubmission[] = [];

let envFileLoaded = false;

function loadEnvFile() {
  if (envFileLoaded) return;
  envFileLoaded = true;
  const candidates = [resolve(process.cwd(), ".env"), resolve(process.cwd(), "..", ".env")];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const i = trimmed.indexOf("=");
      if (i === -1) continue;
      const key = trimmed.slice(0, i);
      const value = trimmed.slice(i + 1);
      if (process.env[key] === undefined) process.env[key] = value;
    }
    break;
  }
}

export function env(name: string): string | undefined {
  loadEnvFile();
  return process.env[name]?.trim() || undefined;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function saveSubmission(
  data: Omit<ContactSubmission, "id" | "createdAt">,
): ContactSubmission {
  const record: ContactSubmission = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  submissions.push(record);
  return record;
}

export function saveLead(data: Omit<LeadSubmission, "id" | "createdAt">): LeadSubmission {
  const record: LeadSubmission = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  leads.push(record);
  return record;
}

async function sendResendEmail(params: {
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const apiKey = env("RESEND_API_KEY");
  // Resend test mode can only deliver to the Resend account owner email
  const to =
    env("CONTACT_NOTIFY_EMAIL") ??
    env("MEETING_HOST_EMAIL") ??
    "shahedroks@gmail.com";
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing — skipping email notify.");
    return { sent: false as const, reason: "RESEND_API_KEY missing" };
  }

  const from = env("RESEND_FROM_EMAIL") ?? "Portfolio <onboarding@resend.dev>";
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    // Soft-fail: never break lead/contact capture because of Resend test limits
    console.warn("[Resend] email not sent:", error.message);
    return { sent: false as const, reason: error.message };
  }
  return { sent: true as const };
}

/** Email the project brief to your inbox. */
export async function emailContactSubmission(
  data: Omit<ContactSubmission, "id" | "createdAt">,
): Promise<void> {
  const hostName = env("MEETING_HOST_NAME") ?? "NexaSoft";
  await sendResendEmail({
    replyTo: data.email,
    subject: `New project brief — ${data.name} (${data.projectType})`,
    html: `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
        <p>New message from your portfolio contact form.</p>
        <p>
          <strong>Name:</strong> ${escapeHtml(data.name)}<br/>
          <strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a><br/>
          <strong>Phone:</strong> <a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a><br/>
          <strong>Project type:</strong> ${escapeHtml(data.projectType)}<br/>
          <strong>Budget:</strong> ${escapeHtml(data.budget)}
        </p>
        <p><strong>Details:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>
        <p style="color:#666">— ${escapeHtml(hostName)} portfolio</p>
      </div>
    `,
  });
}

/** Quick lead popup → your inbox (name, email, phone). */
export async function emailLeadSubmission(
  data: Omit<LeadSubmission, "id" | "createdAt">,
): Promise<void> {
  const hostName = env("MEETING_HOST_NAME") ?? "NexaSoft";
  await sendResendEmail({
    replyTo: data.email,
    subject:
      data.source === "estimate-pdf"
        ? `Estimate PDF lead — ${data.email}`
        : `New lead — ${data.name} | ${data.phone}`,
    html: `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
        <p>${
          data.source === "estimate-pdf"
            ? "Someone downloaded the free project estimate PDF."
            : "A visitor shared their contact details on your site."
        }</p>
        <p>
          <strong>Name:</strong> ${escapeHtml(data.name)}<br/>
          <strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a><br/>
          <strong>Phone:</strong> ${escapeHtml(data.phone)}<br/>
          <strong>Source:</strong> ${escapeHtml(data.source)}
        </p>
        ${
          data.note
            ? `<p><strong>Note:</strong></p><p style="white-space:pre-wrap">${escapeHtml(data.note)}</p>`
            : ""
        }
        <p style="color:#666">— ${escapeHtml(hostName)} portfolio</p>
      </div>
    `,
  });
}

/** Notify host when a meeting is booked. */
export async function emailHostMeetingBooked(data: {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  meetLink: string;
  notes?: string;
}): Promise<void> {
  const hostName = env("MEETING_HOST_NAME") ?? "NexaSoft";
  await sendResendEmail({
    replyTo: data.email,
    subject: `Meeting booked — ${data.name} | ${data.date} ${data.time}`,
    html: `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
        <p>A client booked a Google Meet from your site.</p>
        <p>
          <strong>Name:</strong> ${escapeHtml(data.name)}<br/>
          <strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a><br/>
          <strong>Phone:</strong> <a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a><br/>
          <strong>When:</strong> ${escapeHtml(data.date)} at ${escapeHtml(data.time)}<br/>
          <strong>Meet:</strong> <a href="${escapeHtml(data.meetLink)}">${escapeHtml(data.meetLink)}</a>
        </p>
        ${
          data.notes
            ? `<p><strong>Notes:</strong></p><p style="white-space:pre-wrap">${escapeHtml(data.notes)}</p>`
            : ""
        }
        <p style="color:#666">— ${escapeHtml(hostName)} portfolio</p>
      </div>
    `,
  });
}

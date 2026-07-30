import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resend } from "resend";

export interface MeetingRequest {
  name: string;
  email: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  notes?: string;
}

export interface MeetingResult {
  meetLink: string;
  eventId: string;
  startsAt: string;
  endsAt: string;
}

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

function env(name: string): string | undefined {
  loadEnvFile();
  return process.env[name]?.trim() || undefined;
}

function requiredEnv(name: string): string {
  const value = env(name);
  if (!value) {
    throw new Error(`Missing ${name}. Add it to your .env file.`);
  }
  return value;
}

function meetingDurationMinutes(): number {
  const raw = env("MEETING_DURATION_MINUTES");
  const n = raw ? Number(raw) : 30;
  return Number.isFinite(n) && n > 0 ? n : 30;
}

function timeZone(): string {
  return env("MEETING_TIMEZONE") ?? "Asia/Dhaka";
}

async function getGoogleAccessToken(): Promise<string> {
  const clientId = requiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requiredEnv("GOOGLE_CLIENT_SECRET");
  const refreshToken = requiredEnv("GOOGLE_REFRESH_TOKEN");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const json = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!res.ok || !json.access_token) {
    throw new Error(
      json.error_description ?? json.error ?? "Failed to refresh Google access token.",
    );
  }
  return json.access_token;
}

function buildDateTimes(date: string, time: string) {
  const tz = timeZone();
  const duration = meetingDurationMinutes();
  const pad = (n: number) => String(n).padStart(2, "0");

  const dateParts = date.split("-").map(Number);
  const timeParts = time.split(":").map(Number);
  if (dateParts.length !== 3 || timeParts.length < 2) {
    throw new Error("Invalid date or time.");
  }

  const [yh, mh, dh] = dateParts;
  const [hh, mm] = timeParts;
  if ([yh, mh, dh, hh, mm].some((n) => Number.isNaN(n))) {
    throw new Error("Invalid date or time.");
  }

  const startDateTime = `${pad(yh)}-${pad(mh)}-${pad(dh)}T${pad(hh)}:${pad(mm)}:00`;
  const endTotal = hh * 60 + mm + duration;
  const dayOffset = Math.floor(endTotal / (24 * 60));
  const endH = Math.floor(endTotal / 60) % 24;
  const endM = endTotal % 60;
  const endDay = new Date(Date.UTC(yh, mh - 1, dh + dayOffset));
  const endDateTime = `${endDay.getUTCFullYear()}-${pad(endDay.getUTCMonth() + 1)}-${pad(endDay.getUTCDate())}T${pad(endH)}:${pad(endM)}:00`;

  return {
    timeZone: tz,
    startDateTime,
    endDateTime,
    startsAtIso: startDateTime,
    endsAtIso: endDateTime,
  };
}

export async function createGoogleMeetEvent(data: MeetingRequest): Promise<MeetingResult> {
  const accessToken = await getGoogleAccessToken();
  const hostEmail = env("MEETING_HOST_EMAIL");
  const { timeZone: tz, startDateTime, endDateTime, startsAtIso, endsAtIso } = buildDateTimes(
    data.date,
    data.time,
  );

  const calendarId = encodeURIComponent(env("GOOGLE_CALENDAR_ID") ?? "primary");
  const requestId = crypto.randomUUID();

  const eventBody = {
    summary: `Discovery call — ${data.name}`,
    description: [
      `Booked from portfolio contact form.`,
      data.notes ? `Notes: ${data.notes}` : null,
      `Guest: ${data.name} <${data.email}>`,
    ]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: startDateTime, timeZone: tz },
    end: { dateTime: endDateTime, timeZone: tz },
    attendees: [
      { email: data.email, displayName: data.name },
      ...(hostEmail ? [{ email: hostEmail }] : []),
    ],
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 60 },
        { method: "popup", minutes: 15 },
      ],
    },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventBody),
    },
  );

  const json = (await res.json()) as {
    id?: string;
    hangoutLink?: string;
    htmlLink?: string;
    conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
    error?: { message?: string };
  };

  if (!res.ok || !json.id) {
    throw new Error(json.error?.message ?? "Failed to create Google Calendar event.");
  }

  const meetFromEntry = json.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === "video",
  )?.uri;
  const meetLink = meetFromEntry ?? json.hangoutLink;

  if (!meetLink) {
    throw new Error("Event created but Google Meet link was missing. Check Calendar API Meet permissions.");
  }

  return {
    meetLink,
    eventId: json.id,
    startsAt: startsAtIso,
    endsAt: endsAtIso,
  };
}

export async function emailMeetingInvite(params: {
  to: string;
  name: string;
  meetLink: string;
  date: string;
  time: string;
  notes?: string;
}): Promise<void> {
  const apiKey = requiredEnv("RESEND_API_KEY");
  const from = env("RESEND_FROM_EMAIL") ?? "Meetings <onboarding@resend.dev>";
  const hostName = env("MEETING_HOST_NAME") ?? "Alex Rivera";
  const tz = timeZone();
  const duration = meetingDurationMinutes();

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: `Your meeting with ${hostName} is booked`,
    html: `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
        <p>Hi ${params.name},</p>
        <p>Your discovery call is confirmed.</p>
        <p>
          <strong>When:</strong> ${params.date} at ${params.time} (${tz}) · ${duration} min<br/>
          <strong>Google Meet:</strong> <a href="${params.meetLink}">${params.meetLink}</a>
        </p>
        ${params.notes ? `<p><strong>Your note:</strong> ${params.notes}</p>` : ""}
        <p>Add it to your calendar from the Google invite, or join with the link above.</p>
        <p>— ${hostName}</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message || "Failed to send meeting email.");
  }
}

export function isMeetingConfigured(): boolean {
  return Boolean(
    env("GOOGLE_CLIENT_ID") &&
      env("GOOGLE_CLIENT_SECRET") &&
      env("GOOGLE_REFRESH_TOKEN") &&
      env("RESEND_API_KEY"),
  );
}

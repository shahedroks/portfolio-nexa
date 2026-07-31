import { useEffect, useState } from "react";
import { CalendarClock, Loader2, ExternalLink } from "lucide-react";
import { useCms } from "@/lib/cms-context";

function isCalendly(url: string) {
  return /calendly\.com/i.test(url);
}

function isGoogleAppointments(url: string) {
  return /calendar\.google\.com\/calendar\/appointments/i.test(url);
}

function withEmbedParams(url: string) {
  try {
    const u = new URL(url);
    if (isCalendly(url)) {
      if (!u.searchParams.has("hide_gdpr_banner")) {
        u.searchParams.set("hide_gdpr_banner", "1");
      }
      if (!u.searchParams.has("primary_color")) {
        u.searchParams.set("primary_color", "38bdf8");
      }
    }
    if (isGoogleAppointments(url) && !u.searchParams.has("gv")) {
      u.searchParams.set("gv", "true");
    }
    return u.toString();
  } catch {
    return url;
  }
}

export function BookingEmbed() {
  const rawUrl = useCms().settings.links.bookingEmbedUrl?.trim() || "";
  const url = rawUrl ? withEmbedParams(rawUrl) : "";
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) return;
    setReady(false);
    setFailed(false);
    const t = window.setTimeout(() => setReady(true), 4000);
    return () => window.clearTimeout(t);
  }, [url]);

  if (!url) {
    return (
      <div className="rounded-xl border border-border bg-surface-2/40 px-4 py-6 text-center text-sm text-muted-foreground">
        <CalendarClock className="mx-auto mb-2 h-5 w-5 text-accent" />
        Booking calendar is not configured yet. Set{" "}
        <code className="text-accent">links.bookingEmbedUrl</code> in Firebase{" "}
        <code className="text-accent">site_settings/main</code>.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-400/15 text-sky-300">
          <CalendarClock className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">Pick a time that works</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a slot below — confirmation and Meet details are sent by Calendly. No redirect
            required.
          </p>
        </div>
        <a
          href={rawUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-foreground transition hover:bg-white/10"
        >
          Open calendar
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {failed ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Calendar embed was blocked by the browser.{" "}
          <a href={rawUrl} target="_blank" rel="noreferrer" className="underline">
            Open booking page
          </a>{" "}
          instead.
        </p>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl border border-border bg-white">
        {!ready && !failed ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 text-sm text-muted-foreground backdrop-blur-sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent" />
            Loading calendar…
          </div>
        ) : null}

        <iframe
          key={url}
          title="Book a call"
          src={url}
          className="min-h-[720px] w-full border-0"
          loading="eager"
          onLoad={() => setReady(true)}
          onError={() => {
            setFailed(true);
            setReady(true);
          }}
          allow="camera; microphone; fullscreen; payment"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

/** True when a Calendly / Google Appointment embed URL is configured in env (fallback). */
export function hasBookingEmbed() {
  return Boolean(
    (import.meta.env.VITE_BOOKING_EMBED_URL as string | undefined)?.trim() ||
      (import.meta.env.VITE_CALENDLY_URL as string | undefined)?.trim(),
  );
}

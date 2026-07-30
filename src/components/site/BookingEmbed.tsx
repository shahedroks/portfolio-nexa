import { useEffect, useRef, useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        resize?: boolean;
      }) => void;
    };
  }
}

function bookingUrl() {
  return (
    (import.meta.env.VITE_BOOKING_EMBED_URL as string | undefined)?.trim() ||
    (import.meta.env.VITE_CALENDLY_URL as string | undefined)?.trim() ||
    ""
  );
}

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
      // Dark-friendly accents when Calendly Pro allows it via query (harmless otherwise)
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

function loadCalendlyAssets() {
  const cssId = "calendly-widget-css";
  if (!document.getElementById(cssId)) {
    const link = document.createElement("link");
    link.id = cssId;
    link.rel = "stylesheet";
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(link);
  }

  const existing = document.querySelector<HTMLScriptElement>(
    'script[src="https://assets.calendly.com/assets/external/widget.js"]',
  );
  if (existing) {
    return existing.dataset.loaded === "1"
      ? Promise.resolve()
      : new Promise<void>((resolve, reject) => {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error("Calendly failed to load")), {
            once: true,
          });
        });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error("Calendly failed to load"));
    document.body.appendChild(script);
  });
}

export function BookingEmbed() {
  const rawUrl = bookingUrl();
  const url = rawUrl ? withEmbedParams(rawUrl) : "";
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !isCalendly(url)) {
      setReady(Boolean(url));
      return;
    }

    let cancelled = false;
    setReady(false);
    setError(null);

    void (async () => {
      try {
        await loadCalendlyAssets();
        if (cancelled || !containerRef.current || !window.Calendly) return;
        containerRef.current.innerHTML = "";
        window.Calendly.initInlineWidget({
          url,
          parentElement: containerRef.current,
          resize: true,
        });
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) {
          setError("Could not load the calendar. Please refresh and try again.");
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!url) {
    return (
      <div className="rounded-xl border border-border bg-surface-2/40 px-4 py-6 text-center text-sm text-muted-foreground">
        <CalendarClock className="mx-auto mb-2 h-5 w-5 text-accent" />
        Booking calendar is not configured yet. Add{" "}
        <code className="text-accent">VITE_BOOKING_EMBED_URL</code> (Calendly or Google Appointment
        Schedule link) to your <code className="text-accent">.env</code>.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-400/15 text-sky-300">
          <CalendarClock className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">Pick a time that works</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a slot below — confirmation and Meet details are sent automatically. No redirect
            required.
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl border border-border bg-white">
        {!ready ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 text-sm text-muted-foreground backdrop-blur-sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent" />
            Loading calendar…
          </div>
        ) : null}

        {isCalendly(url) ? (
          <div
            ref={containerRef}
            className="calendly-inline-widget min-h-[680px] w-full"
            style={{ minWidth: "320px" }}
          />
        ) : (
          <iframe
            title="Book a call"
            src={url}
            className="min-h-[720px] w-full border-0"
            loading="lazy"
            onLoad={() => setReady(true)}
          />
        )}
      </div>
    </div>
  );
}

/** True when a Calendly / Google Appointment embed URL is configured. */
export function hasBookingEmbed() {
  return Boolean(bookingUrl());
}

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
            itp_support?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
            getDismissedReason: () => string;
          }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              type?: "standard" | "icon";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number | string;
            },
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

const LEAD_KEY = "nexasoft-google-lead";
const SKIP_KEY = "nexasoft-google-skip";

export function SideDock() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const initialized = useRef(false);
  const buttonHost = useRef<HTMLDivElement | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const renderGoogleButton = useCallback(() => {
    if (!window.google?.accounts?.id || !buttonHost.current) return;
    buttonHost.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonHost.current, {
      theme: "outline",
      size: "large",
      type: "standard",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "left",
      width: 320,
    });
  }, []);

  const submitCredential = useCallback(async (payload: { credential?: string }) => {
    setLoading(true);
    setError(null);
    if (buttonHost.current) buttonHost.current.innerHTML = "";
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      const res = await fetch("/api/auth/google-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) {
        setError(json.error ?? "Could not save Google profile.");
        return false;
      }
      setDone(true);
      setShowPicker(false);
      localStorage.setItem(LEAD_KEY, "1");
      localStorage.removeItem(SKIP_KEY);
      return true;
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      setError(aborted ? "Saving timed out — please try again." : "Network error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const showOneTap = useCallback(() => {
    if (!window.google?.accounts?.id || !clientId) return;
    if (localStorage.getItem(LEAD_KEY) === "1") return;

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const reason = notification.isNotDisplayed()
          ? notification.getNotDisplayedReason()
          : notification.getSkippedReason();
        console.info("Google One Tap not shown:", reason);
        if (localStorage.getItem(SKIP_KEY) !== "1") {
          setShowPicker(true);
        }
      }
    });
  }, [clientId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(LEAD_KEY) === "1") {
      setDone(true);
      return;
    }
    if (localStorage.getItem(SKIP_KEY) === "1") return;
    // Don't open the picker if Google Sign-In isn't configured for this build.
    if (!clientId) return;
    const t = window.setTimeout(() => setShowPicker(true), 400);
    return () => window.clearTimeout(t);
  }, [clientId]);

  useEffect(() => {
    if (!clientId || done) {
      if (!clientId && showPicker) {
        setError("Google Sign-In is not configured on this deployment (missing VITE_GOOGLE_CLIENT_ID).");
      }
      return;
    }

    let cancelled = false;
    const loadTimeout = window.setTimeout(() => {
      if (!cancelled && !window.google?.accounts?.id) {
        setError("Google Sign-In is taking too long. Check your connection, or add this domain in Google Cloud → Authorized JavaScript origins.");
      }
    }, 12_000);

    const boot = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      setReady(true);
      setError(null);
      if (initialized.current) return;
      if (localStorage.getItem(LEAD_KEY) === "1") return;

      initialized.current = true;
      window.google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        cancel_on_tap_outside: false,
        context: "signin",
        itp_support: true,
        use_fedcm_for_prompt: false,
        callback: (response) => {
          void submitCredential({ credential: response.credential });
        },
      });

      window.setTimeout(() => showOneTap(), 700);
    };

    if (window.google?.accounts?.id) {
      boot();
      return () => {
        cancelled = true;
        window.clearTimeout(loadTimeout);
      };
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-gsi="1"]');
    if (existing) {
      if (window.google?.accounts?.id) {
        boot();
      } else {
        const onLoad = () => boot();
        existing.addEventListener("load", onLoad);
        return () => {
          cancelled = true;
          window.clearTimeout(loadTimeout);
          existing.removeEventListener("load", onLoad);
        };
      }
      return () => {
        cancelled = true;
        window.clearTimeout(loadTimeout);
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = "1";
    script.onload = () => boot();
    script.onerror = () => {
      if (!cancelled) setError("Google Sign-In failed to load. Please allow accounts.google.com and try again.");
    };
    document.head.appendChild(script);
    return () => {
      cancelled = true;
      window.clearTimeout(loadTimeout);
    };
  }, [clientId, done, showOneTap, submitCredential, showPicker]);

  // Official Google button must be rendered after modal mounts + GIS ready
  useEffect(() => {
    if (!showPicker || !ready || loading) return;
    const t = window.setTimeout(() => renderGoogleButton(), 50);
    return () => window.clearTimeout(t);
  }, [showPicker, ready, loading, renderGoogleButton, error]);

  const googleIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.9 2.4 2.7 6.6 2.7 11.7S6.9 21 12 21c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.2-1.5H12z"
      />
      <path
        fill="#34A853"
        d="M3.9 8.1 7.1 10.5C8 8.3 9.8 6.8 12 6.8c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 8.3 2.4 5.1 4.5 3.9 8.1z"
      />
      <path
        fill="#4A90E2"
        d="M12 21c2.5 0 4.6-.8 6.1-2.3l-3-2.4c-.8.6-1.9 1-3.1 1-2.4 0-4.4-1.6-5.2-3.8l-3.2 2.4C5 18.8 8.2 21 12 21z"
      />
      <path
        fill="#FBBC05"
        d="M6.8 13.5c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7L3.6 7.7C2.9 9 2.5 10.4 2.5 11.8s.4 2.8 1.1 4.1l3.2-2.4z"
      />
    </svg>
  );

  const pickerModal =
    showPicker && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="google-pick-title"
              data-google-picker="1"
              className="relative w-full max-w-sm rounded-2xl border border-white/15 bg-[#0f1524] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            >
              <button
                type="button"
                onClick={() => {
                  setShowPicker(false);
                  localStorage.setItem(SKIP_KEY, "1");
                }}
                className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
                {googleIcon}
              </div>

              <h2 id="google-pick-title" className="text-lg font-semibold text-foreground">
                Select your Gmail account
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Choose the Google email you want us to use — name & email are saved securely.
              </p>

              {error ? (
                <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/15 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              ) : null}

              <div className="mt-5 flex min-h-[48px] w-full flex-col items-center justify-center gap-3">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving your account…
                  </div>
                ) : null}

                {!ready && !loading ? (
                  <p className="text-sm text-muted-foreground">
                    {error ? "Google Sign-In unavailable." : "Loading Google…"}
                  </p>
                ) : null}

                <div
                  ref={buttonHost}
                  className={cn(
                    "flex w-full justify-center overflow-hidden",
                    (loading || !ready) && "pointer-events-none absolute opacity-0",
                  )}
                  aria-hidden={loading || !ready}
                />
              </div>

              <p className="mt-3 text-center text-[0.7rem] text-muted-foreground">
                {loading
                  ? "Please wait — we’re saving your name and email."
                  : "Use the Google button above to pick your email."}
              </p>
            </div>
          </div>,
          document.body,
        )
      : null;

  if (done) {
    return (
      <div className="fixed right-3 top-[4.75rem] z-[55] sm:right-5 sm:top-[5rem]">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/15 text-emerald-300 shadow-lg backdrop-blur-xl">
          <Check className="h-5 w-5" />
        </div>
      </div>
    );
  }

  return (
    <>
      {pickerModal}

      <div className="fixed right-3 top-[4.75rem] z-[55] flex flex-col items-end gap-2 sm:right-5 sm:top-[5rem]">
        {error && !showPicker ? (
          <p className="max-w-[13rem] rounded-xl border border-destructive/40 bg-destructive/15 px-3 py-2 text-[0.7rem] text-destructive shadow-lg">
            {error}
          </p>
        ) : null}

        <div className="relative flex flex-col gap-2 rounded-2xl border border-white/10 bg-background/70 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              setShowPicker(true);
              localStorage.removeItem(SKIP_KEY);
            }}
            disabled={loading}
            title="Select Gmail account"
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70",
              "ring-2 ring-accent/50",
            )}
            aria-label="Continue with Google"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-neutral-600" /> : googleIcon}
          </button>
        </div>
      </div>
    </>
  );
}

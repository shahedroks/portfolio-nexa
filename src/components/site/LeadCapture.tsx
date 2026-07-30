import { useEffect, useState, type FormEvent } from "react";
import { X, Phone, Loader2, CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";

type Status = { type: "idle" | "loading" | "success" | "error"; message?: string };

const STORAGE_KEY = "nexasoft-lead-dismissed";

export function LeadCapture() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    const timer = window.setTimeout(() => setOpen(true), 12_000);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ type: "loading" });

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "lead-popup" }),
      });
      const json = (await res.json()) as { success: boolean; message?: string; error?: string };

      if (!res.ok || !json.success) {
        setStatus({ type: "error", message: json.error ?? "Something went wrong." });
        return;
      }

      setStatus({ type: "success", message: json.message ?? "Thanks! We'll contact you soon." });
      form.reset();
      localStorage.setItem(STORAGE_KEY, "1");
      window.setTimeout(() => setOpen(false), 2200);
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
    }
  }

  if (!open) return null;

  const fieldClass =
    "w-full rounded-xl border border-input bg-surface-2/60 px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/40";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={dismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-start gap-3 pr-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h2 id="lead-title" className="text-lg font-semibold">
              Get a free project estimate
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Leave your email &amp; phone — we&apos;ll reply within 24 hours.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3" aria-busy={status.type === "loading"}>
          <fieldset disabled={status.type === "loading"} className="space-y-3 disabled:opacity-80">
          <div>
            <label htmlFor="lead-name" className="mb-1.5 block text-xs font-medium">
              Name
            </label>
            <input id="lead-name" name="name" required placeholder="Your name" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="lead-email" className="mb-1.5 block text-xs font-medium">
              Email
            </label>
            <input
              id="lead-email"
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="lead-phone" className="mb-1.5 block text-xs font-medium">
              Phone / WhatsApp
            </label>
            <input
              id="lead-phone"
              name="phone"
              type="tel"
              required
              placeholder="+880 1XXX-XXXXXX"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="lead-note" className="mb-1.5 block text-xs font-medium">
              What do you need? <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="lead-note"
              name="note"
              rows={2}
              placeholder="App, website, admin panel…"
              className={fieldClass}
            />
          </div>

          <button
            type="submit"
            disabled={status.type === "loading" || status.type === "success"}
            aria-busy={status.type === "loading"}
            className={`relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-wait ${
              status.type === "success"
                ? "bg-success text-background"
                : "bg-gradient-brand text-primary-foreground disabled:opacity-90"
            }`}
          >
            {status.type === "loading" ? (
              <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <span className="absolute inset-y-0 w-1/2 animate-form-shimmer bg-white/20" />
              </span>
            ) : null}
            <span className="relative z-[1] inline-flex items-center gap-2">
              {status.type === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : status.type === "success" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Sent — thanks!
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" /> Send my details
                </>
              )}
            </span>
          </button>

          {status.type === "loading" ? (
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
              Submitting your details…
            </p>
          ) : null}
          {status.type === "success" ? (
            <p
              role="status"
              className="animate-in fade-in-0 slide-in-from-bottom-2 flex items-center gap-2 text-sm text-success duration-300"
            >
              <CheckCircle2 className="h-4 w-4" /> {status.message}
            </p>
          ) : null}
          {status.type === "error" ? (
            <p
              role="alert"
              className="animate-in fade-in-0 slide-in-from-bottom-2 flex items-center gap-2 text-sm text-destructive duration-300"
            >
              <AlertCircle className="h-4 w-4" /> {status.message}
            </p>
          ) : null}
          </fieldset>
        </form>
      </div>
    </div>
  );
}

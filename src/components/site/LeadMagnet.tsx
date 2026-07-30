import { useState, type FormEvent } from "react";
import { FileDown, Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type Status = { type: "idle" | "loading" | "success" | "error"; message?: string };

const PDF_PATH =
  (import.meta.env.VITE_ESTIMATE_PDF_URL as string | undefined)?.trim() ||
  "/project-estimate-guide.pdf";

export function LeadMagnet() {
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ type: "loading" });

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          name: data.name || "PDF subscriber",
          source: "estimate-pdf",
          note: "Requested free project estimate PDF",
        }),
      });
      const json = (await res.json()) as { success: boolean; message?: string; error?: string };

      if (!res.ok || !json.success) {
        setStatus({ type: "error", message: json.error ?? "Something went wrong." });
        return;
      }

      setStatus({
        type: "success",
        message: "You're in — your free estimate PDF is ready to download.",
      });
      form.reset();

      // Instant download after capture
      const link = document.createElement("a");
      link.href = PDF_PATH;
      link.download = "NexaSoft-Project-Estimate-Guide.pdf";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
    }
  }

  return (
    <section id="estimate" className="section-pad pt-4 sm:pt-6">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/10 via-surface to-surface-2/80 p-6 sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
            />
            <div className="relative grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
                  <FileDown className="h-3 w-3" />
                  Free lead magnet
                </span>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Get a free project estimate PDF
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/70 sm:text-[0.95rem]">
                  A short guide with typical Flutter / admin / web scopes, US-market pricing
                  ranges, and a checklist so you can brief your next build with confidence.
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground/65">
                  <li className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    Scope templates
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    Budget benchmarks
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    Kickoff checklist
                  </li>
                </ul>
              </div>

              <form
                onSubmit={onSubmit}
                className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur-md sm:p-5"
                aria-busy={status.type === "loading"}
              >
                <label htmlFor="magnet-email" className="mb-1.5 block text-xs font-medium">
                  Work email
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="magnet-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      disabled={status.type === "loading" || status.type === "success"}
                      className="w-full rounded-xl border border-input bg-surface-2/50 py-3 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-ring/40 disabled:opacity-70"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status.type === "loading" || status.type === "success"}
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300",
                      status.type === "success"
                        ? "bg-success text-background"
                        : "bg-gradient-brand text-primary-foreground hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-80",
                    )}
                  >
                    {status.type === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                      </>
                    ) : status.type === "success" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Sent
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4" /> Get the PDF
                      </>
                    )}
                  </button>
                </div>

                {status.type === "success" ? (
                  <p
                    role="status"
                    className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-success"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {status.message}{" "}
                    <a
                      href={PDF_PATH}
                      download="NexaSoft-Project-Estimate-Guide.pdf"
                      className="font-semibold underline underline-offset-2"
                    >
                      Download again
                    </a>
                  </p>
                ) : null}
                {status.type === "error" ? (
                  <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {status.message}
                  </p>
                ) : null}
                {status.type === "idle" || status.type === "loading" ? (
                  <p className="mt-3 text-[0.7rem] text-muted-foreground">
                    No spam — just the PDF. Unsubscribe anytime.
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

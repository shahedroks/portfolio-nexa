import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarClock,
  FileText,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingEmbed } from "./BookingEmbed";
import { Reveal, SectionHeading } from "./Reveal";
import { SocialRow } from "./Socials";
import { useCms } from "@/lib/cms-context";

type Tab = "meeting" | "brief";
type StatusType = "idle" | "loading" | "success" | "error";
type Status = { type: StatusType; message?: string };

function FormSubmitButton({
  status,
  idle,
  loading,
  success,
}: {
  status: StatusType;
  idle: { label: string; icon: ReactNode };
  loading: string;
  success: string;
}) {
  const busy = status === "loading";
  const ok = status === "success";

  return (
    <button
      type="submit"
      disabled={busy}
      aria-busy={busy}
      className={cn(
        "relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300",
        "disabled:cursor-wait",
        ok
          ? "bg-success text-background shadow-[0_12px_32px_-16px_oklch(0.75_0.15_160)]"
          : "bg-gradient-brand text-primary-foreground hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-90",
      )}
    >
      {busy ? (
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute inset-y-0 w-1/2 animate-form-shimmer bg-white/20" />
        </span>
      ) : null}
      <span className="relative z-[1] inline-flex items-center gap-2">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loading}
          </>
        ) : ok ? (
          <>
            <CheckCircle2 className="h-4 w-4 animate-in zoom-in-50 duration-300" />
            {success}
          </>
        ) : (
          <>
            {idle.label}
            {idle.icon}
          </>
        )}
      </span>
    </button>
  );
}

function FormStatusBanner({ status }: { status: Status }) {
  if (status.type === "success") {
    return (
      <div
        role="status"
        className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success duration-300"
      >
        <p className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {status.message}
        </p>
      </div>
    );
  }
  if (status.type === "error") {
    return (
      <p
        role="alert"
        className="animate-in fade-in-0 slide-in-from-bottom-2 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive duration-300"
      >
        <AlertCircle className="h-4 w-4 shrink-0" />
        {status.message}
      </p>
    );
  }
  if (status.type === "loading") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="animate-in fade-in-0 flex items-center gap-2 rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-sm text-muted-foreground duration-200"
      >
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
        Please wait — submitting your request…
      </p>
    );
  }
  return null;
}

function tabFromHash(): Tab {
  const hash = window.location.hash;
  if (hash === "#book" || hash === "#contact") return "meeting";
  if (hash === "#brief") return "brief";
  return "meeting";
}

export function Contact() {
  const { settings, sections } = useCms();
  const { contact } = sections;
  const [tab, setTab] = useState<Tab>("meeting");
  const [projectStatus, setProjectStatus] = useState<Status>({ type: "idle" });

  const fieldClass =
    "w-full rounded-xl border border-input bg-surface-2/50 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-ring/40";

  useEffect(() => {
    const sync = () => setTab(tabFromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  async function onProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setProjectStatus({ type: "loading" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { success: boolean; message?: string; error?: string };

      if (!res.ok || !json.success) {
        setProjectStatus({
          type: "error",
          message: json.error ?? "Something went wrong. Please try again.",
        });
        return;
      }
      setProjectStatus({
        type: "success",
        message: json.message ?? "Message sent successfully.",
      });
      form.reset();
    } catch {
      setProjectStatus({
        type: "error",
        message: "Network error. Please check your connection and retry.",
      });
    }
  }

  return (
    <section id="contact" className="section-pad bg-surface/40">
      <div id="book" className="mx-auto max-w-6xl scroll-mt-28 px-5 sm:px-8">
        <SectionHeading
          eyebrow={contact.eyebrow}
          title={contact.title}
          subtitle={contact.subtitle}
        />

        <div className="mx-auto mt-12 grid max-w-5xl gap-6">
          <Reveal className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5">
              <Clock className="h-3.5 w-3.5 text-accent" />
              <span className="text-[0.7rem] font-medium tracking-wide text-foreground/80">
                {contact.responseLabel}
              </span>
            </div>
          </Reveal>

          <Reveal>
            <div className="surface-card overflow-hidden p-5 sm:p-8">
              <div
                role="tablist"
                aria-label="Contact options"
                className="mb-7 grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface-2/40 p-1.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "meeting"}
                  onClick={() => {
                    setTab("meeting");
                    history.replaceState(null, "", "#book");
                  }}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                    tab === "meeting"
                      ? "bg-gradient-brand text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                  )}
                >
                  <CalendarClock className="h-4 w-4" />
                  {settings.ctaLabel || "Book a Call"}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "brief"}
                  onClick={() => {
                    setTab("brief");
                    history.replaceState(null, "", "#brief");
                  }}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                    tab === "brief"
                      ? "bg-gradient-brand text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Project Brief
                </button>
              </div>

              {tab === "meeting" ? (
                <div role="tabpanel" className="min-w-0">
                  <BookingEmbed />
                </div>
              ) : (
                <form
                  onSubmit={onProjectSubmit}
                  className="space-y-5"
                  role="tabpanel"
                  aria-busy={projectStatus.type === "loading"}
                >
                  <fieldset
                    disabled={projectStatus.type === "loading"}
                    className="space-y-5 disabled:opacity-80"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">Send a project brief</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Prefer email first? Share details and I&apos;ll reply within 24 hours.
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="mb-2 block text-sm font-medium">
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          required
                          placeholder="Jane Cooper"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium">
                          Email Address
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="jane@company.com"
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                        WhatsApp
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+880 1XXX-XXXXXX"
                        className={fieldClass}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="projectType" className="mb-2 block text-sm font-medium">
                          Project Type
                        </label>
                        <select
                          id="projectType"
                          name="projectType"
                          required
                          defaultValue=""
                          className={fieldClass}
                        >
                          <option value="" disabled>
                            Select a project type
                          </option>
                          {contact.projectTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="budget" className="mb-2 block text-sm font-medium">
                          Budget Range
                        </label>
                        <select
                          id="budget"
                          name="budget"
                          required
                          defaultValue=""
                          className={fieldClass}
                        >
                          <option value="" disabled>
                            Select a budget range
                          </option>
                          {contact.budgets.map((budget) => (
                            <option key={budget} value={budget}>
                              {budget}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="mb-2 block text-sm font-medium">
                        Project Details
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        minLength={10}
                        placeholder="Share your goals, target platforms, and ideal launch date."
                        className={fieldClass}
                      />
                    </div>

                    <FormSubmitButton
                      status={projectStatus.type}
                      idle={{ label: "Send Message", icon: <Send className="h-4 w-4" /> }}
                      loading="Sending…"
                      success="Message sent"
                    />

                    <FormStatusBanner status={projectStatus} />
                  </fieldset>
                </form>
              )}
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="surface-card flex flex-col items-center gap-4 p-7 text-center">
              <h3 className="text-lg font-semibold">{contact.connectTitle}</h3>
              <p className="max-w-md text-sm text-muted-foreground">{contact.connectCopy}</p>
              <SocialRow withEmail className="justify-center" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

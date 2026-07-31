import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/pricing/success")({
  head: () => ({
    meta: [{ title: "Payment received — NexaSoft" }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: PricingSuccessPage,
});

function PricingSuccessPage() {
  const { session_id: sessionId } = Route.useSearch();

  return (
    <div className="min-h-screen bg-background px-5 py-16 text-foreground sm:px-8">
      <div className="mx-auto max-w-lg space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/15 text-emerald-300">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Deposit received</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Thanks — your Stripe deposit went through. A receipt has been emailed by Stripe. We&apos;ll
          follow up shortly to confirm scope and next steps.
        </p>
        {sessionId ? (
          <p className="break-all text-[0.7rem] text-muted-foreground/80">Ref: {sessionId}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="/#contact"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Send project brief
          </a>
          <a
            href="/#pricing"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-surface-2 px-5 py-3 text-sm font-semibold text-foreground"
          >
            Back to pricing
          </a>
        </div>
      </div>
    </div>
  );
}

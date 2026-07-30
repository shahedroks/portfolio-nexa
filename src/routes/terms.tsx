import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: "Terms of Use — NexaSoft" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-5 py-16 text-foreground sm:px-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <Link to="/" className="text-sm text-accent hover:underline">
          ← Back to home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Use</h1>
        <p className="text-sm text-muted-foreground">Last updated: July 2026</p>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            This website provides information about NexaSoft services. Project work is governed by
            a separate written agreement or statement of work.
          </p>
          <p>
            Content on this site is for general information. Timelines, pricing ranges, and case
            study metrics are illustrative unless confirmed in writing.
          </p>
          <p>
            By using this site you agree not to misuse forms, automated scrapers, or attempt to
            disrupt service availability.
          </p>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Policy — NexaSoft" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-5 py-16 text-foreground sm:px-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <Link to="/" className="text-sm text-accent hover:underline">
          ← Back to home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: July 2026</p>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            NexaSoft collects contact details you voluntarily submit (name, email, phone, and
            project information) to respond to inquiries and schedule calls.
          </p>
          <p>
            We do not sell personal data. Information is used only to deliver services and
            communicate about your project. Google Sign-In data (name and email) is processed only
            when you explicitly authorize sharing.
          </p>
          <p>
            For privacy questions, contact us via the website contact form or WhatsApp listed on
            the site.
          </p>
        </div>
      </div>
    </div>
  );
}

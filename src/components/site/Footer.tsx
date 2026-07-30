import { SocialRow } from "./Socials";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-12 text-center sm:px-8">
        <a href="#home" className="font-display text-[0.95rem] font-bold tracking-tight text-foreground">
          NexaSoft<span className="text-accent">.</span>
        </a>
        <p className="max-w-md text-sm text-muted-foreground">
          Flutter &amp; full-stack developer building mobile apps, admin panels, and websites for
          businesses worldwide.
        </p>
        <SocialRow size="sm" className="justify-center" />
        <nav className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <a href="/privacy" className="transition-colors hover:text-accent">
            Privacy Policy
          </a>
          <a href="/terms" className="transition-colors hover:text-accent">
            Terms
          </a>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} NexaSoft. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

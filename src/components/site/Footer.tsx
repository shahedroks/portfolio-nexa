import { SocialRow } from "./Socials";
import { useCms } from "@/lib/cms-context";

export function Footer() {
  const { settings } = useCms();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-12 text-center sm:px-8">
        <a href="#home" className="font-display text-[0.95rem] font-bold tracking-tight text-foreground">
          {settings.brandName}
          <span className="text-accent">.</span>
        </a>
        <p className="max-w-md text-sm text-muted-foreground">{settings.footer.tagline}</p>
        <SocialRow size="sm" className="justify-center" />
        <nav className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          {settings.footer.legalLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-accent">
              {link.label}
            </a>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {settings.brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

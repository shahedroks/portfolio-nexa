import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [light, setLight] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isLight = stored === "light";
    setLight(isLight);
    document.documentElement.classList.toggle("light", isLight);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActive(`#${visible[0].target.id}`);
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleTheme = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("theme", next ? "light" : "dark");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "relative transition-all duration-300",
          scrolled
            ? "border-b border-white/8 bg-background/75 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          {/* Brand */}
          <a href="#home" className="group flex min-w-0 items-center gap-3">
            <span className="min-w-0">
              <span className="block truncate font-display text-[0.95rem] font-bold tracking-tight text-foreground">
                NexaSoft<span className="text-accent">.</span>
              </span>
              <span className="hidden items-center gap-1.5 text-[0.65rem] text-muted-foreground sm:flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Available for hire
              </span>
            </span>
          </a>

          {/* Desktop links — pill shell */}
          <div className="hidden rounded-full border border-white/8 bg-white/[0.03] p-1.5 backdrop-blur-md lg:block">
            <ul className="flex items-center gap-0.5">
              {links.map((link) => {
                const isActive = active === link.href;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={cn(
                        "relative inline-flex rounded-full px-3.5 py-2 text-[0.8rem] font-medium transition-all duration-200",
                        isActive
                          ? "bg-white/10 text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
            >
              {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <a
              href="#book"
              className="group hidden items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_-14px_rgba(56,189,248,0.85)] transition-transform duration-300 hover:-translate-y-0.5 sm:inline-flex"
            >
              Book a Call
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Scroll progress */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-white/5"
          aria-hidden
        >
          <div
            className="h-full origin-left bg-gradient-brand transition-[width] duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="sr-only" aria-live="polite">
          Page scrolled {Math.round(progress)} percent
        </span>
      </div>

      {/* Mobile panel */}
      {open ? (
        <div className="border-b border-white/8 bg-background/95 backdrop-blur-2xl lg:hidden">
          <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
            <ul className="space-y-1">
              {links.map((link) => {
                const isActive = active === link.href;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-white/8 text-foreground"
                          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                      )}
                    >
                      {link.label}
                      {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
                    </a>
                  </li>
                );
              })}
            </ul>
            <a
              href="#book"
              onClick={() => setOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3.5 text-sm font-semibold text-primary-foreground"
            >
              Book a Call
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

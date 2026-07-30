import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-5 right-3 z-[54] inline-flex items-center gap-2 rounded-full border border-white/12 bg-background/85 px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-[0_12px_36px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 sm:bottom-6 sm:right-5",
        "hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-brand text-primary-foreground">
        <ArrowUp className="h-3.5 w-3.5" />
      </span>
      <span className="pr-0.5 hidden sm:inline">Back to top</span>
    </button>
  );
}

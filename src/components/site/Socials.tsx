import { Github, Linkedin, MessageCircle, Mail, Briefcase, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const socialLinks = [
  { label: "GitHub", href: "#", Icon: Github },
  { label: "LinkedIn", href: "#", Icon: Linkedin },
  { label: "Upwork", href: "#", Icon: Briefcase },
  { label: "Fiverr", href: "#", Icon: BadgeCheck },
  { label: "WhatsApp", href: `https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/\D/g, "") || "8801000000000"}`, Icon: MessageCircle },
];

export const emailLink = { label: "Email", href: "mailto:hello@example.com", Icon: Mail };

export function SocialRow({
  className,
  withEmail = false,
  size = "md",
}: {
  className?: string;
  withEmail?: boolean;
  size?: "sm" | "md";
}) {
  const items = withEmail ? [...socialLinks, emailLink] : socialLinks;
  return (
    <ul className={cn("flex flex-wrap items-center gap-3", className)}>
      {items.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={label}
            title={label}
            className={cn(
              "group flex items-center justify-center rounded-xl border border-border bg-surface-2/50 text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:text-accent hover:shadow-[0_14px_30px_-18px_var(--color-accent)]",
              size === "md" ? "h-11 w-11" : "h-9 w-9",
            )}
          >
            <Icon className={size === "md" ? "h-5 w-5" : "h-4 w-4"} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Socials() {
  return (
    <section className="pb-4">
      <div className="mx-auto flex max-w-6xl justify-center px-5 sm:px-8">
        <SocialRow withEmail className="justify-center" />
      </div>
    </section>
  );
}

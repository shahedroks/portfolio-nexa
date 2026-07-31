import type { SVGProps } from "react";
import { Github, Linkedin, MessageCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCms } from "@/lib/cms-context";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

/** Official Simple Icons — Upwork (https://simpleicons.org/icons/upwork) */
function UpworkIcon({ className, ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <title>Upwork</title>
      <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z" />
    </svg>
  );
}

/** Official Simple Icons — Fiverr (https://simpleicons.org/icons/fiverr) */
function FiverrIcon({ className, ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <title>Fiverr</title>
      <path d="M23.004 15.588a.995.995 0 1 0 .002-1.99.995.995 0 0 0-.002 1.99zm-.996-3.705h-.85c-.546 0-.84.41-.84 1.092v2.466h-1.61v-3.558h-.684c-.547 0-.84.41-.84 1.092v2.466h-1.61v-4.874h1.61v.74c.264-.574.626-.74 1.163-.74h1.972v.74c.264-.574.625-.74 1.162-.74h.527v1.316zm-6.786 1.501h-3.359c.088.546.43.858 1.006.858.43 0 .732-.175.83-.487l1.425.4c-.351.848-1.22 1.364-2.255 1.364-1.748 0-2.549-1.355-2.549-2.515 0-1.14.703-2.505 2.45-2.505 1.856 0 2.471 1.384 2.471 2.408 0 .224-.01.37-.02.477zm-1.562-.945c-.04-.42-.342-.81-.889-.81-.508 0-.81.225-.908.81h1.797zM7.508 15.44h1.416l1.767-4.874h-1.62l-.86 2.837-.878-2.837H5.72l1.787 4.874zm-6.6 0H2.51v-3.558h1.524v3.558h1.591v-4.874H2.51v-.302c0-.332.235-.536.606-.536h.918V8.412H2.85c-1.162 0-1.943.712-1.943 1.755v.4H0v1.316h.908v3.558z" />
    </svg>
  );
}

export function SocialRow({
  className,
  withEmail = false,
  size = "md",
}: {
  className?: string;
  withEmail?: boolean;
  size?: "sm" | "md";
}) {
  const { links } = useCms().settings;
  const whatsappNumber = links.whatsappNumber.replace(/\D/g, "") || "8801000000000";

  const socialLinks = [
    { label: "GitHub", href: links.githubUrl, Icon: Github },
    { label: "LinkedIn", href: links.linkedinUrl, Icon: Linkedin },
    {
      label: "Upwork",
      href: links.upworkUrl,
      Icon: UpworkIcon,
      brandClass: "text-[#14A800] group-hover:text-[#14A800]",
    },
    {
      label: "Fiverr",
      href: links.fiverrUrl,
      Icon: FiverrIcon,
      brandClass: "text-[#1DBF73] group-hover:text-[#1DBF73]",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/${whatsappNumber}`,
      Icon: MessageCircle,
      brandClass: "text-[#25D366] group-hover:text-[#25D366]",
    },
  ];

  const emailLink = {
    label: "Email",
    href: links.contactEmail,
    Icon: Mail,
  };

  const items = withEmail ? [...socialLinks, emailLink] : socialLinks;
  return (
    <ul className={cn("flex flex-wrap items-center gap-3", className)}>
      {items.map(({ label, href, Icon, ...rest }) => {
        const brandClass = "brandClass" in rest ? (rest.brandClass as string | undefined) : undefined;
        return (
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
              <Icon
                className={cn(
                  label === "Fiverr" || label === "Upwork"
                    ? size === "md"
                      ? "h-6 w-6"
                      : "h-5 w-5"
                    : size === "md"
                      ? "h-5 w-5"
                      : "h-4 w-4",
                  brandClass,
                )}
              />
            </a>
          </li>
        );
      })}
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

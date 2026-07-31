import { resolveCmsIcon } from "@/lib/cms-icons";
import { useCms } from "@/lib/cms-context";

function PhoneFrame({
  src,
  alt,
  className,
  animationClass,
  size = "md",
}: {
  src: string;
  alt: string;
  className?: string;
  animationClass: string;
  size?: "sm" | "md" | "lg";
}) {
  const width =
    size === "lg"
      ? "w-[8.5rem] sm:w-[9.5rem]"
      : size === "md"
        ? "w-[7.75rem] sm:w-[8.75rem]"
        : "w-[7rem] sm:w-[8rem]";

  return (
    <div className={`relative shrink-0 overflow-visible ${width} ${className ?? ""}`}>
      <div className={`${animationClass} relative`}>
        <div className="rounded-[1.65rem] bg-[#2a2f3a] p-[3px] shadow-[0_20px_40px_rgba(0,0,0,0.55)]">
          <div className="rounded-[1.5rem] bg-[#0a0c10] p-1.5">
            <div className="relative aspect-[9/19] overflow-hidden rounded-[1.15rem] bg-[#050608]">
              <div className="absolute left-1/2 top-1.5 z-10 h-2 w-[34%] -translate-x-1/2 rounded-full bg-black" />
              <div className="absolute inset-[3px] overflow-hidden rounded-[1rem]">
                <img
                  src={src}
                  alt={alt}
                  className="h-full w-full object-cover object-top"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroMockups() {
  const { mockups } = useCms().sections.hero;
  const laptop = mockups.screens.find((s) => s.kind === "laptop") ?? mockups.screens[0];
  const phones = mockups.screens.filter((s) => s.kind === "phone");

  return (
    <div className="relative mx-auto w-full max-w-[42rem] px-2 pb-12 pt-8 sm:px-5 lg:max-w-none">
      <div className="relative w-full pb-10 pt-3">
        <div className="hero-device-laptop relative z-10 mx-0 w-full max-w-none">
          <div className="overflow-hidden rounded-t-xl border border-white/15 bg-[#1a1e28] p-1.5 shadow-[0_32px_70px_rgba(0,0,0,0.58)] sm:p-2">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-[#0a0c12]">
              <img
                src={laptop?.src}
                alt={laptop?.alt ?? "Dashboard"}
                className="h-full w-full scale-[1.01] object-cover object-top"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
          <div className="relative mx-auto h-2.5 w-[106%] -translate-x-[3%] rounded-b-lg bg-gradient-to-b from-[#3a4150] to-[#252a35]">
            <div className="absolute left-1/2 top-0 h-1 w-16 -translate-x-1/2 rounded-b bg-[#1a1e28]/80" />
          </div>
          <div className="mx-auto h-1 w-[114%] -translate-x-[6%] rounded-b-xl bg-[#151820]" />
        </div>

        <div className="relative z-20 -mt-12 flex items-end justify-end gap-0 pr-3 sm:-mt-16 sm:pr-6">
          {phones[0] ? (
            <PhoneFrame
              src={phones[0].src}
              alt={phones[0].alt}
              animationClass="hero-device-phone-side"
              size="md"
              className="relative z-[1] -mr-5 origin-bottom -rotate-[7deg] sm:-mr-6"
            />
          ) : null}
          {phones[1] ? (
            <PhoneFrame
              src={phones[1].src}
              alt={phones[1].alt}
              animationClass="hero-device-phone"
              size="lg"
              className="relative z-[2] origin-bottom rotate-[4deg]"
            />
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-0 z-30">
          {mockups.proofs.map(({ iconKey, label, detail, tone, position }, index) => {
            const Icon = resolveCmsIcon(iconKey);
            return (
              <div
                key={label}
                className={`hero-proof-badge absolute flex items-center gap-2 rounded-xl border border-white/12 bg-background/82 px-2.5 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl ${position}`}
                style={{ animationDelay: `${index * -0.7}s` }}
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${tone}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span>
                  <span className="block text-[0.67rem] font-semibold leading-tight text-white">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-[0.57rem] leading-tight text-white/60">
                    {detail}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

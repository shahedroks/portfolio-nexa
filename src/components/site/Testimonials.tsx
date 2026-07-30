import { useState } from "react";
import { Star, Quote, BadgeCheck } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const testimonials = [
  {
    quote:
      "NexaSoft rebuilt our field-service app in Flutter and shipped both stores in nine weeks. Crash rate dropped to near zero and our technicians finally stopped complaining about the tool.",
    name: "Michael Turner",
    title: "COO",
    company: "Northline Services",
  },
  {
    quote:
      "The admin dashboard the team delivered replaced three spreadsheets and a manual billing process. Our ops team saves roughly 15 hours a week, every week.",
    name: "Priya Raman",
    title: "Founder",
    company: "CareBridge Health",
  },
  {
    quote:
      "Communication was the standout. Weekly demos, honest timelines, and they flagged risks before they became problems. Rare for a freelance engagement.",
    name: "Sarah Whitfield",
    title: "Product Lead",
    company: "Halo Digital Agency",
  },
  {
    quote:
      "Our new site loads in under a second and conversions are up 34% since launch. They handled design, build, and Stripe integration without hand-holding.",
    name: "Daniel Okafor",
    title: "CEO",
    company: "ShopEase Retail",
  },
  {
    quote:
      "We needed a wallet app with KYC and push notifications. NexaSoft owned the Flutter client, Node API, and Play Store release. Users still rate us 4.8.",
    name: "Elena Vasquez",
    title: "CTO",
    company: "PayNest Fintech",
  },
  {
    quote:
      "They took our Figma and turned it into a production fitness app with workouts, subscriptions, and analytics. Onboarding completion jumped 40%.",
    name: "James Cole",
    title: "Founder",
    company: "PulseFit",
  },
  {
    quote:
      "Role-based admin, inventory sync, and a customer portal — all in one engagement. Support tickets related to ops tooling fell by half.",
    name: "Amina Hassan",
    title: "Operations Director",
    company: "MarketLane",
  },
  {
    quote:
      "Clear estimates, clean code handoff, and App Store approval on the first try. We hired the team again for the vendor portal three months later.",
    name: "Ryan Brooks",
    title: "VP Engineering",
    company: "Freightly",
  },
  {
    quote:
      "Our booking app was late with another vendor. NexaSoft stabilized the backlog, shipped iOS + Android, and documented everything for our in-house team.",
    name: "Chloe Nguyen",
    title: "Head of Product",
    company: "Bookora",
  },
  {
    quote:
      "They built the marketing site and CMS so our content team can publish without developers. SEO traffic is up and the brand finally looks premium.",
    name: "Omar Farouk",
    title: "Marketing Lead",
    company: "Lumen Studio",
  },
  {
    quote:
      "Realtime chat, maps, and offline mode for our delivery drivers. Flutter performance on older Android devices was better than we expected.",
    name: "Laura Bennett",
    title: "COO",
    company: "SwiftDrop Logistics",
  },
  {
    quote:
      "From discovery call to production admin panel in six weeks. Charts, exports, and audit logs — exactly what our compliance team asked for.",
    name: "Kenji Sato",
    title: "Founder",
    company: "AuditFlow",
  },
];

const platformRatings = [
  { label: "5.0 on Upwork", mark: "Up" },
  { label: "4.9 on Fiverr", mark: "Fi" },
  { label: "5.0 on Clutch", mark: "Cl" },
];

function avatarUrl(name: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}

function TestimonialCard({
  item,
  className = "",
}: {
  item: (typeof testimonials)[number];
  className?: string;
}) {
  return (
    <figure className={`surface-card lift relative h-full min-h-[15.5rem] p-7 hover:lift-hover hover:border-accent/40 ${className}`}>
      <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/25" />
      <div className="flex gap-1" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, s) => (
          <Star key={s} className="h-4 w-4 fill-accent text-accent" />
        ))}
      </div>
      <blockquote className="mt-4 text-sm leading-relaxed text-foreground/75">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <img
          src={avatarUrl(item.name)}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 rounded-full bg-surface-2 ring-1 ring-border"
        />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="block text-sm font-semibold">{item.name}</span>
            <span className="inline-flex items-center gap-0.5 rounded-full border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[0.65rem] font-medium text-accent">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </span>
          </span>
          <span className="mt-0.5 block text-xs text-foreground/65">{item.title}</span>
          <span className="block text-xs font-medium text-foreground/85">{item.company}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const [allOpen, setAllOpen] = useState(false);

  return (
    <section id="testimonials" className="section-pad">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="What clients say after launch"
          subtitle="Long-term relationships built on delivery — 8 out of 10 clients come back for a second project."
        />

        <Reveal className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {platformRatings.map((p) => (
            <span
              key={p.label}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/60 px-3 py-1.5 text-xs font-medium text-foreground/80"
            >
              <span className="grid h-5 w-5 place-items-center rounded-md bg-accent/15 text-[0.6rem] font-bold text-accent">
                {p.mark}
              </span>
              <Star className="h-3 w-3 fill-accent text-accent" />
              {p.label}
            </span>
          ))}
        </Reveal>

        <Reveal className="mt-10">
          <Carousel opts={{ align: "start", loop: true }} className="relative w-full">
            <CarouselContent className="-ml-4">
              {testimonials.map((item) => (
                <CarouselItem
                  key={item.name}
                  className="basis-[88%] pl-4 sm:basis-[70%] md:basis-1/2 lg:basis-[45%]"
                >
                  <TestimonialCard item={item} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setAllOpen(true)}
                className="text-sm font-semibold text-accent underline-offset-4 transition-colors hover:text-accent/90 hover:underline"
              >
                View All Reviews
              </button>
              <div className="flex items-center gap-2">
                <CarouselPrevious className="static translate-y-0 border-border bg-surface-2 hover:border-accent hover:text-accent" />
                <CarouselNext className="static translate-y-0 border-border bg-surface-2 hover:border-accent hover:text-accent" />
              </div>
            </div>
          </Carousel>
        </Reveal>
      </div>

      <Dialog open={allOpen} onOpenChange={setAllOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-border bg-surface">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">All client reviews</DialogTitle>
            <DialogDescription>
              {testimonials.length} verified testimonials from recent product launches.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {testimonials.map((item) => (
              <TestimonialCard key={item.name} item={item} className="min-h-0" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

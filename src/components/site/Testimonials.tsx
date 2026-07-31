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
import { useCms } from "@/lib/cms-context";
import type { CmsTestimonialsSection } from "@/lib/cms.types";

type TestimonialItem = CmsTestimonialsSection["items"][number];

function avatarUrl(name: string, custom?: string) {
  if (custom) return custom;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}

function TestimonialCard({
  item,
  className = "",
}: {
  item: TestimonialItem;
  className?: string;
}) {
  return (
    <figure
      className={`surface-card lift relative h-full min-h-[15.5rem] p-7 hover:lift-hover hover:border-accent/40 ${className}`}
    >
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
          src={avatarUrl(item.name, item.avatarUrl)}
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
  const { testimonials } = useCms().sections;
  const [allOpen, setAllOpen] = useState(false);

  return (
    <section id="testimonials" className="section-pad">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
          subtitle={testimonials.subtitle}
        />

        <Reveal className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {testimonials.platformRatings.map((p) => (
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
              {testimonials.items.map((item) => (
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
              {testimonials.items.length} verified testimonials from recent product launches.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {testimonials.items.map((item) => (
              <TestimonialCard key={item.name} item={item} className="min-h-0" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

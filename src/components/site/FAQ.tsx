import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, SectionHeading } from "./Reveal";

const faqs = [
  {
    q: "What's your typical project timeline?",
    a: "Most MVPs and focused mobile apps ship in 4–8 weeks. Full app + admin panel + backend engagements usually run 8–14 weeks depending on scope, integrations, and review cycles. You'll get a dated milestone plan before kickoff.",
  },
  {
    q: "How do you handle time zone differences with US clients?",
    a: "I work US-friendly hours for standups and reviews (overlap with EST/PST as needed). Async updates happen daily via email or Slack, so progress never depends on sitting in the same time zone all day.",
  },
  {
    q: "Who owns the code and IP after the project is delivered?",
    a: "You do. On final payment, source code, designs delivered for the project, and related IP transfer to you. I don't reuse your proprietary business logic or brand assets on other client work.",
  },
  {
    q: "Do you sign NDAs?",
    a: "Yes. I'm happy to sign a mutual NDA before discovery or kickoff so product ideas, data, and credentials stay protected.",
  },
  {
    q: "What's your payment structure (upfront/milestones)?",
    a: "Typical structure is 30–40% to start, then milestone-based payments tied to demos (UI complete, API integrated, store-ready). Exact splits are written into the statement of work so both sides stay clear.",
  },
  {
    q: "Do you offer post-launch support and maintenance?",
    a: "Yes. Starter projects include a short support window; Growth and Custom engagements can include 1+ months of bug fixes, store updates, and minor improvements. Ongoing retainers are available if you want continuous iteration.",
  },
  {
    q: "What if I need revisions after delivery?",
    a: "Each milestone includes a defined revision round. Feedback inside the agreed scope is included. Larger changes after sign-off are estimated as a change request so timelines and budget stay honest.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="section-pad bg-surface/30">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Straight answers on timeline, ownership, payments, and how we work with US clients."
        />

        <Reveal className="mx-auto mt-10 max-w-5xl">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`faq-${i}`}
                className="rounded-xl border border-border bg-surface-2/40 px-4 data-[state=open]:border-accent/30"
              >
                <AccordionTrigger className="py-4 text-sm font-semibold text-foreground hover:no-underline sm:text-[0.95rem]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

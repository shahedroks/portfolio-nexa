import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, SectionHeading } from "./Reveal";
import { useCms } from "@/lib/cms-context";

export function FAQ() {
  const { faq } = useCms().sections;

  return (
    <section id="faq" className="section-pad bg-surface/30">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow={faq.eyebrow} title={faq.title} subtitle={faq.subtitle} />

        <Reveal className="mx-auto mt-10 max-w-5xl">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faq.faqs.map((item, i) => (
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

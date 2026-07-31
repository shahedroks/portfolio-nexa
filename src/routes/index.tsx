import { createFileRoute } from "@tanstack/react-router";

import { FAQ } from "@/components/site/FAQ";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Navbar } from "@/components/site/Navbar";
import { Portfolio } from "@/components/site/Portfolio";
import { Pricing } from "@/components/site/Pricing";
import { Process } from "@/components/site/Process";
import { Services } from "@/components/site/Services";
import { BackToTop } from "@/components/site/BackToTop";
import { ChatWidget } from "@/components/site/ChatWidget";
import { HireWithConfidence } from "@/components/site/HireWithConfidence";
import { LeadCapture } from "@/components/site/LeadCapture";
import { SideDock } from "@/components/site/SideDock";
import { TechStack } from "@/components/site/TechStack";
import { Testimonials } from "@/components/site/Testimonials";
import { WhyMe } from "@/components/site/WhyMe";
import { Contact } from "@/components/site/Contact";
import { About } from "@/components/site/About";
import { CmsProvider } from "@/lib/cms-context";
import { getCmsDefaults } from "@/lib/cms.defaults";
import type { CmsBundle } from "@/lib/cms.types";

export const Route = createFileRoute("/")({
  loader: async (): Promise<CmsBundle> => {
    try {
      const { getCmsBundle } = await import("@/lib/cms.server");
      return await getCmsBundle();
    } catch (err) {
      console.error("CMS loader failed:", err);
      return getCmsDefaults();
    }
  },
  head: ({ loaderData }) => {
    const seo = loaderData?.settings.seo ?? getCmsDefaults().settings.seo;
    return {
      meta: [
        { title: seo.title },
        { name: "description", content: seo.description },
        { property: "og:title", content: seo.title },
        { property: "og:description", content: seo.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: seo.title },
        { name: "twitter:description", content: seo.description },
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const cms = Route.useLoaderData();

  return (
    <CmsProvider value={cms}>
      <div className="relative min-h-screen overflow-x-hidden">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Services />
          <Portfolio />
          <Process />
          <TechStack />
          <WhyMe />
          <Pricing />
          <HireWithConfidence />
          <Testimonials />
          <FAQ />
          <Contact />
        </main>
        <Footer />
        <SideDock />
        <ChatWidget />
        <BackToTop />
        <LeadCapture />
      </div>
    </CmsProvider>
  );
}

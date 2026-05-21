import ScrollProgress from "./motion/ScrollProgress";
import Hero from "./sections/Hero";
import IndustryStrip from "./sections/IndustryStrip";
import TrustStrip from "./sections/TrustStrip";
import LiveSamples from "./sections/LiveSamples";
import HowItWorks from "./sections/HowItWorks";
import WhatYouGet from "./sections/WhatYouGet";
import ValuesBand from "./sections/ValuesBand";
import Outcomes from "./sections/Outcomes";
import PricingTeaser from "./sections/PricingTeaser";
import AuditFormBand from "./sections/AuditFormBand";
import FAQ from "./sections/FAQ";
import FinalCTA from "./sections/FinalCTA";

/**
 * V2 home page — premium minimal + medium-intensity Framer Motion,
 * structured along FlowNinja's section-flow patterns (see
 * FLOWNINJA_DESIGN_NOTES.md).
 *
 * Section order — engineered around a stacked-proof arc:
 *
 *   1.  Hero            rotating headline, inline audit form, preview
 *   2.  IndustryStrip   visual breadth (12 verticals as marquee)
 *   3.  TrustStrip      3 outcome-framed time commitments
 *   4.  LiveSamples     5 real site previews, 3D tilt
 *   5.  HowItWorks      process steps with Ken Burns photos
 *   6.  WhatYouGet      6 outcome-stat blocks (price, ownership, etc.)
 *   7.  ValuesBand      4 pillars: Boutique. Lead-first. Local. Yours.
 *   8.  Outcomes        founder quote, "Built. Launched. Grown."
 *   9.  PricingTeaser   Starter + Growth cards
 *   10. AuditFormBand   audit form repeat (lower-funnel re-engagement)
 *   11. FAQ             objection-handling
 *   12. FinalCTA        pre-footer book-a-call bookend
 *
 * Architecture:
 *   - This file is a server component. Each section is its own client
 *     component because they all need motion hooks. Layout shell
 *     (Navbar, Footer, JSON-LD) lives in app/layout.tsx.
 *   - Motion routes through components/home/motion/* primitives.
 *   - prefers-reduced-motion honored at the primitive level.
 */
export default function NewHomePage() {
  return (
    <>
      <ScrollProgress />
      <Hero />
      <IndustryStrip />
      <TrustStrip />
      <LiveSamples />
      <HowItWorks />
      <WhatYouGet />
      <ValuesBand />
      <Outcomes />
      <PricingTeaser />
      <AuditFormBand />
      <FAQ />
      <FinalCTA />
    </>
  );
}

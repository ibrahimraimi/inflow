import {
  Cta,
  Faq,
  FeaturesSection,
  GetStartedSteps,
  SiteHero,
  StatsSection,
} from "@/components/site/index";
import { PricingSection } from "@/components/site/pricing/pricing-section";

export default function Home() {
  return (
    <div className="m-auto max-w-7xl px-6">
      <SiteHero />
      <FeaturesSection />
      {/* <PricingSection /> */}
      <StatsSection />
      <Faq />
      <GetStartedSteps />
      <Cta />
    </div>
  );
}




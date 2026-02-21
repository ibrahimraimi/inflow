import { Cta, FeaturesSection, SiteHero } from "@/components/site/index";
import { PricingSection } from "@/components/site/pricing/pricing-section";

export default function Home() {
  return (
    <div className="m-auto max-w-7xl px-6">
      <SiteHero />
      <FeaturesSection />
      <PricingSection />
      <Cta />
    </div>
  );
}

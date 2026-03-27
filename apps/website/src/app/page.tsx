import {
  Cta,
  Faq,
  FeaturesSection,
  GetStartedSteps,
  SiteHero,
  StatsSection,
} from "@/components/site/index";

export default function Home() {
  return (
    <div className="m-auto max-w-7xl px-6">
      <SiteHero />
      <FeaturesSection />
      <StatsSection />
      <Faq />
      <GetStartedSteps />
      <Cta />
    </div>
  );
}




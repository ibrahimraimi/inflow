import {
  Cta,
  SiteHero,
  SiteFooter,
  Testimonial,
  Feature,
} from "@/components/site/index";

export default function Home() {
  return (
    <div className="m-auto max-w-7xl px-6">
      <SiteHero />
      <Feature />
      <Testimonial />
      <Cta />
      <SiteFooter />
    </div>
  );
}

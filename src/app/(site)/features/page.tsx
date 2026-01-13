import {
  RiFingerprintLine,
  RiLineChartFill,
  RiUser3Line,
  RiDashboardLine,
  RiTargetLine,
  RiSpeedLine,
  RiFlowChart,
  RiShieldCheckLine,
} from "@remixicon/react";

const features = [
  {
    description:
      "Get insights into your traffic so you optimize for growth. Easily see all your metrics at a glance.",
    icon: RiLineChartFill,
    name: "Traffic analysis",
  },
  {
    description:
      "Track more than just pageviews. Capture any event on your website like button clicks and form entries.",
    icon: RiFingerprintLine,
    name: "Custom events",
  },
  {
    description:
      "Get detailed breakdowns about your visitors including where they are located and what device they used.",
    icon: RiUser3Line,
    name: "Visitor analysis",
  },
  {
    description:
      "Get a realtime view of your current website traffic. See the exact pages where your visitors are landing.",
    icon: RiSpeedLine,
    name: "Realtime Data",
  },
  {
    description:
      "Track user journeys through multi-step processes to identify drop-off points and optimize conversion rates.",
    icon: RiFlowChart,
    name: "Funnel Analysis",
  },
  {
    description:
      "Set and monitor conversion goals with visual progress indicators. Measure what matters most to your business.",
    icon: RiTargetLine,
    name: "Goal Tracking",
  },
  {
    description:
      "Create personalized dashboard views with your most important metrics. Focus on what drives your success.",
    icon: RiDashboardLine,
    name: "Custom Dashboards",
  },
  {
    description:
      "GDPR compliant with anonymous tracking and no cookies. Respect your visitors' privacy without sacrificing insights.",
    icon: RiShieldCheckLine,
    name: "Privacy-First",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl py-20">
      <div className="mx-auto text-left pb-20">
        <h2 className="text-balance font-medium text-2xl md:text-4xl lg:text-5xl">
          A complete analytics solution with all the features you need.
        </h2>
        <p className="mt-4 text-balance text-muted-foreground text-sm md:text-base">
          Inflow is packed with amazing features that enable you to better
          understand your website traffic.
        </p>
      </div>
      <dl className="grid grid-cols-4 gap-5">
        {features.map((item) => (
          <div
            key={item.name}
            className="col-span-full sm:col-span-2 lg:col-span-1"
          >
            <div className="bg-foreground/10 w-fit rounded-[calc(var(--radius-lg)+0.125rem)] border p-px">
              <div className="bg-background ring-border w-fit rounded-lg p-2">
                <item.icon className="text-primary size-6" aria-hidden="true" />
              </div>
            </div>
            <dt className="text-foreground mt-6 font-semibold">{item.name}</dt>
            <dd className="text-muted-foreground mt-2 leading-7">
              {item.description}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

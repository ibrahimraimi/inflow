import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  UserSearch,
  Fingerprint,
  SlidersHorizontal,
  Activity,
  TrendingUp,
} from "lucide-react";
import type React from "react";

type FeatureType = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
};

export function Feature() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance font-medium text-2xl md:text-4xl lg:text-5xl">
          A complete analytics solution with all the features you need.
        </h2>
        <p className="mt-4 text-balance text-muted-foreground text-sm md:text-base">
          Inflow is packed with amazing features that enable you to better
          understand your website traffic.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard feature={feature} key={feature.title} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeatureCard({
  feature,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  feature: FeatureType;
}) {
  return (
    <div
      className={cn("relative overflow-hidden bg-background p-6", className)}
      {...props}
    >
      <div className="-mt-2 -ml-20 mask-[radial-gradient(farthest-side_at_top,white,transparent)] pointer-events-none absolute top-0 left-1/2 size-full">
        <GridPattern
          className="absolute inset-0 size-full stroke-foreground/20"
          height={40}
          width={40}
          x={5}
        />
      </div>
      <feature.icon
        aria-hidden
        className="size-6 text-foreground/75"
        strokeWidth={1}
      />
      <h3 className="mt-10 text-sm md:text-base">{feature.title}</h3>
      <p className="relative z-20 mt-2 font-light text-muted-foreground text-xs">
        {feature.description}
      </p>
    </div>
  );
}

const features: FeatureType[] = [
  {
    title: "Traffic analysis",
    icon: BarChart3,
    description:
      "Get insights into your traffic so you optimize for growth. Easily see all your metrics at a glance.",
  },
  {
    title: "Visitor analysis",
    icon: UserSearch,
    description:
      "Get detailed breakdowns about your visitors including where they are located and what device they used.",
  },
  {
    title: "Custom events",
    icon: Fingerprint,
    description:
      "Track more than just pageviews. Capture any event on your website like button clicks and form entries.",
  },
  {
    title: "Powerful filters",
    icon: SlidersHorizontal,
    description:
      "Dive deeper into your data using easy to apply filters. Segment your users by any metric such as browser, OS, and country.",
  },
  {
    title: "Realtime Data",
    icon: Activity,
    description:
      "Get a realtime view of your current website traffic. See the exact pages where your visitors are landing.",
  },
  {
    title: "Trend detection",
    icon: TrendingUp,
    description:
      "Compare date periods to discover key trends in your traffic. Easily measure the success of your campaigns.",
  },
];

import {
  RiFingerprintLine,
  RiLineChartFill,
  RiUser3Line,
} from "@remixicon/react";
import { Activity } from "lucide-react";

const features = [
  {
    description:
      "Get insights into your traffic so you optimize for growth. Easily see all your metrics at a glance.",
    icon: RiLineChartFill,
    name: "Traffic analysis",
  },
  {
    description:
      "Your Track more than just pageviews. Capture any event on your website like button clicks and form entries.",
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
    icon: Activity,
    name: "Realtime Data",
  },
];

export const FeaturesSection = () => {
  return (
    <div className="mx-auto w-full py-20">
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
};

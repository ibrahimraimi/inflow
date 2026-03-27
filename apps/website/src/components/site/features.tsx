import NextImage from "next/image";
const webFeatures = [
  {
    title: "Traffic analysis",
    description: "Get insights into your traffic so you optimize for growth. Easily see all your metrics at a glance.",
  },
  {
    title: "Visitor analysis",
    description: "Get detailed breakdowns about your visitors including where they are located and what device they used.",
  },
  {
    title: "Custom events",
    description: "Track more than just pageviews. Capture any event on your website like button clicks and form entries.",
  },
  {
    title: "Powerful filters",
    description: "Dive deeper into your data using easy to apply filters. Segment your users by any metric such as browser, OS, and country.",
  },
  {
    title: "Realtime data",
    description: "Get a realtime view of your current website traffic. See the exact pages where your visitors are landing.",
  },
  {
    title: "Trend detection",
    description: "Compare date periods to discover key trends in your traffic. Easily measure the success of your campaigns.",
  },
];

const productFeatures = [
  {
    title: "User journeys",
    description: "Understand how users navigate through your product.",
  },
  {
    title: "User retention",
    description: "Measure your website stickiness by tracking how often users return.",
  },
  {
    title: "Funnels",
    description: "Understand the conversion and drop-off rate of users.",
  },
];

export function FeaturesSection() {
  return (
    <div className="space-y-32 py-20">
      <section>
        <div className="text-center mb-16 space-y-4">
          <span className="text-primary font-bold text-sm uppercase tracking-wider">
            Web Analytics
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            A complete analytics solution with all the features you need.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Inflow is packed with amazing features that enable you to better
            understand your website traffic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {webFeatures.map((feature, idx) => (
            <div key={idx} className="group space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1">
          <div className="aspect-4/3 rounded-sm overflow-hidden border bg-muted/30 shadow-2xl">
            <NextImage
              src="/images/guide/4.png"
              alt="Product Analytics"
              width={800}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-8 order-1 lg:order-2">
          <div className="space-y-4">
            <span className="text-primary font-bold text-sm uppercase tracking-wider">
              Product Analytics
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Turn user behavior into insights
            </h2>
            <p className="text-muted-foreground text-lg">
              Inflow helps you understand why your users do what they do, so you
              can optimize your conversion paths.
            </p>
          </div>

          <div className="space-y-6">
            {productFeatures.map((item, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="h-10 w-px bg-border group-hover:bg-primary/50 transition-colors shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

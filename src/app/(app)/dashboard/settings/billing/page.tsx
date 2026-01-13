import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSettingsPage() {
  const plans = [
    {
      name: "Hobby",
      price: "$0",
      description: "Get started:",
      features: [
        "100K events per month",
        "Up to 3 websites",
        "6 month data retention",
        "Community support",
      ],
      buttonText: "Current plan",
      buttonVariant: "outline" as const,
      isCurrent: true,
    },
    {
      name: "Pro",
      price: "$20",
      description: "Everything in Hobby, plus:",
      features: [
        "1 million events per month",
        "$0.00002 per additional event",
        "Unlimited websites",
        "Unlimited team members",
        "5 year data retention",
        "Email support",
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default" as const,
      highlighted: true,
      trialText: "14-day free trial",
    },
    {
      name: "Enterprise",
      price: "Contact us",
      description: "Everything in Pro, plus:",
      features: [
        "Custom pricing",
        "Custom data retention",
        "Uptime SLA",
        "Invoice billing",
        "Enterprise support",
      ],
      buttonText: "Contact Us",
      buttonVariant: "default" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">
          Billing
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col relative ${
              plan.highlighted ? "border-primary ring-1 ring-primary/20" : ""
            }`}
          >
            <div className="p-8 space-y-2 grow">
              <h3 className="text-sm font-bold">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  {plan.price}
                </span>
                {plan.price.startsWith("$") && (
                  <span className="text-xs text-muted-foreground">/ month</span>
                )}
              </div>

              <div className="pt-4 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {plan.description}
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-3.5 w-3.5 mt-0.5 text-green-500 shrink-0" />
                      <span className="text-xs leading-none text-muted-foreground/90 font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-8 pt-0 flex flex-col items-center">
              <Button
                variant={plan.buttonVariant}
                size="sm"
                className={`w-full h-8 text-[11px] font-bold ${
                  plan.isCurrent
                    ? "bg-muted hover:bg-muted text-muted-foreground"
                    : ""
                }`}
                disabled={plan.isCurrent}
              >
                {plan.buttonText}
              </Button>
              {plan.trialText && (
                <p className="text-[10px] text-muted-foreground mt-3 font-medium">
                  {plan.trialText}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <a
          href="#"
          className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
        >
          See full plan comparison
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

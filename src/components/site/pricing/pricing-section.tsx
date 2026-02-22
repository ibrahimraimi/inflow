"use client";

import { cn } from "@/lib/utils";
import * as PricingCard from "./pricing-card";
import { Button } from "@/components/ui/button";
import { Briefcase, Building, CheckCircle2, Users } from "lucide-react";

export function PricingSection() {
  const plans = [
    {
      icon: <Users />,
      description: "Perfect for individuals and side projects",
      name: "Hobby",
      price: "Free",
      variant: "outline",
      features: [
        "1 Website",
        "10,000 monthly page views",
        "6 months data retention",
        "1 Team member",
        "Real-time data",
        "Community Support",
      ],
    },
    {
      icon: <Briefcase />,
      description: "Ideal for growing startups",
      name: "Starter",
      badge: "Popular",
      price: "$9",
      period: "/month",
      variant: "default",
      features: [
        "Up to 5 websites",
        "100,000 monthly page views",
        "2 years data retention",
        "Up to 3 team members",
        "Custom events",
        "Email/Slack reports",
        "Email Support",
      ],
    },
    {
      icon: <Building />,
      description: "For scaling businesses & agencies",
      name: "Pro",
      price: "$25",
      period: "/month",
      variant: "outline",
      features: [
        "Up to 20 websites",
        "500,000 monthly page views",
        "5 years data retention",
        "Up to 10 team members",
        "API access",
        "Advanced filtering",
        "Priority Support",
      ],
    },
    {
      icon: <Building />,
      name: "Enterprise",
      description: "Custom scale and compliance",
      price: "Custom",
      variant: "outline",
      features: [
        "Unlimited websites",
        "1M+ monthly page views",
        "Forever data retention",
        "Unlimited team members",
        "White-labeling",
        "SSO & Custom Auth",
        "Dedicated Manager",
        "SLA guarantees",
      ],
    },
  ];

  return (
    <section className="mx-auto grid w-full gap-4 py-20 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan, index) => (
        <PricingCard.Card
          className={cn("w-full max-w-full", index === 1 && "xl:scale-105 xl:shadow-xl xl:z-10")}
          key={plan.name}
        >
          <PricingCard.Header>
            <PricingCard.Plan>
              <PricingCard.PlanName>
                {plan.icon}
                <span className="text-muted-foreground">{plan.name}</span>
              </PricingCard.PlanName>
              {plan.badge && (
                <PricingCard.Badge>{plan.badge}</PricingCard.Badge>
              )}
            </PricingCard.Plan>
            <PricingCard.Price>
              <PricingCard.MainPrice>{plan.price}</PricingCard.MainPrice>
              <PricingCard.Period>{plan.period}</PricingCard.Period>
            </PricingCard.Price>
            <Button
              className={cn("w-full font-semibold")}
              variant={plan.variant as "outline" | "default"}
            >
              Get Started
            </Button>
          </PricingCard.Header>

          <PricingCard.Body>
            <PricingCard.Description>
              {plan.description}
            </PricingCard.Description>
            <PricingCard.List>
              {plan.features.map((item) => (
                <PricingCard.ListItem className="text-[10px] leading-tight" key={item}>
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-foreground"
                  />
                  <span>{item}</span>
                </PricingCard.ListItem>
              ))}
            </PricingCard.List>
          </PricingCard.Body>
        </PricingCard.Card>
      ))}
    </section>
  );
}

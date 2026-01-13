"use client";

import { cn } from "@/lib/utils";
import * as PricingCard from "./pricing-card";
import { Button } from "@/components/ui/button";
import { Briefcase, Building, CheckCircle2, Users } from "lucide-react";

export function PricingSection() {
  const plans = [
    {
      icon: <Users />,
      description: "Perfect for individuals",
      name: "Basic",
      price: "Free",
      variant: "outline",
      features: ["1 user", "1 Website", "Daily Schedule Overview"],
    },
    {
      icon: <Briefcase />,
      description: "Ideal for small teams",
      name: "Pro",
      badge: "Popular",
      price: "$9",
      original: "$39",
      period: "/month",
      variant: "default",
      features: [
        "All Basic Plan Features",
        "Up to 5 websites",
        "Up to 3 team members",
        "3 years of data retention",
        "Collect events",
        "Priority Support",
        "Email/Slack reports",
      ],
    },
    {
      icon: <Building />,
      name: "Enterprise",
      description: "Perfect for large scale companies",
      price: "Custom",
      variant: "outline",
      features: [
        "All Pro Plan Features",
        "10+ site",
        "10+ team members",
        "Custom user limit",
        "5+ years of data retention",
        "Custom pageviews limit",
        "Separated data storage",
        "Manual invoicing",
        "Contract redlining",
        "Priority support",
      ],
    },
  ];

  return (
    <section className="mx-auto grid w-full gap-4 py-20 md:grid-cols-3">
      {plans.map((plan, index) => (
        <PricingCard.Card
          className={cn("w-full max-w-full", index === 1 && "md:scale-105")}
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
              {plan.original && (
                <PricingCard.OriginalPrice className="ml-auto">
                  {plan.original}
                </PricingCard.OriginalPrice>
              )}
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
                <PricingCard.ListItem className="text-xs" key={item}>
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-4 w-4 text-foreground"
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

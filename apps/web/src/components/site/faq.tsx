"use client";

import { cn } from "@inflow/core/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@inflow/ui";

import { Button } from "@inflow/ui";
import Link from "next/link";

const FAQ_QUESTIONS = [
  {
    question: "How is this different from Google Analytics?",
    answer:
      "Unlike Google Analytics, Inflow is a privacy-first analytics platform that doesn't track personal data, doesn't use cookies, and provides a much cleaner, more intuitive interface focused on what matters: your growth metrics.",
  },
  {
    question: "Is my data private?",
    answer:
      "Absolutely. We do not sell your data or use it for advertising. Your data is encrypted and stored securely. We are fully GDPR, CCPA, and PECR compliant.",
  },
  {
    question: "Can I self-host?",
    answer:
      "Yes! Inflow is open-source and can be self-hosted on your own infrastructure using Docker. We also offer a managed Cloud version if you want to get started quickly without the DevOps overhead.",
  },
  {
    question: "What's the pricing?",
    answer:
      "We offer a generous Free tier for individuals and small projects. For scaling businesses, our Pro plan starts at $9/month. Enterprise custom pricing is available for very high-traffic sites.",
  },
  {
    question: "How easy is integration?",
    answer:
      "It's as simple as adding a single line of script to your website's <head> section. No complex configuration or tagging required. Most users are get set up in under 2 minutes.",
  },
  {
    question: "Does it work with single-page applications (SPAs)?",
    answer:
      "Yes, Inflow automatically tracks page views in SPAs by listening to history changes, so you don't need to manually trigger events for every navigation.",
  },
  {
    question: "Can I import my data from other tools?",
    answer:
      "We are currently working on import tools for Google Analytics and other popular platforms. Stay tuned for updates on our roadmap!",
  },
];

interface FaqProps {
  className?: string;
}

export function Faq({ className }: FaqProps) {
  return (
    <section className={cn("bg-background py-32", className)}>
      <div className="container mx-auto">
        <h2 className="mb-10 text-center text-4xl sm:text-6xl font-bold tracking-tighter text-foreground">
          Frequently Asked Questions
        </h2>
        <div className="z-20 mx-auto max-w-2xl rounded-2xl border border-border bg-background p-3">
          <Accordion
            type="single"
            collapsible
            className="flex w-full flex-col items-center justify-center gap-3"
          >
            {FAQ_QUESTIONS.map((item, index) => (
              <AccordionItem
                value={index.toString()}
                key={index}
                className="m-0 w-full rounded-xl bg-muted/50 px-4 py-2 border-none"
              >
                <AccordionTrigger className="flex flex-1 justify-between text-left font-semibold transition-all hover:no-underline py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="flex flex-col justify-center items-center gap-2 sm:flex-row mt-16 text-center">
          <div className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
            <Button asChild size="lg" variant="ghost" className="rounded-xl px-5 text-base">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


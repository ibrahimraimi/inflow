"use client";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const contactOptions = [
  {
    title: "Questions & help",
    email: "support@inflowanalytics.com",
    icon: MessageSquare,
  },
  {
    title: "Business inquiries",
    email: "hello@inflowanalytics.com",
    icon: Mail,
  },
  {
    title: "Report vulnerabilities",
    email: "security@inflowanalytics.com",
    icon: ShieldCheck,
  },
];

export default function ContactPage() {
  return (
    <Layout className="max-w-5xl mx-auto md:px-6">
      <div className="flex flex-col items-center text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Get in touch
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Have a question or need help? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {contactOptions.map((option, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-card border  rounded-lg p-5 hover:border-white/10 transition-colors group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/3 text-muted-foreground group-hover:text-white transition-colors">
              <option.icon size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {option.title}
              </span>
              <Link
                href={`mailto:${option.email}`}
                className="text-sm font-semibold flex items-center gap-1 hover:text-primary transition-colors"
              >
                {option.email}
                <ExternalLink
                  size={12}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto bg-card border border-white/5 rounded-lg p-4 md:p-6">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-3">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-muted-foreground"
            >
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="bg-black/50 border-white/5 h-12 rounded-sm focus-visible:ring-primary/50 focus-visible:border-primary/50"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="message"
              className="text-sm font-medium text-muted-foreground"
            >
              How can we help?
            </Label>
            <Textarea
              id="message"
              placeholder="Tell us about your question or issue..."
              className="bg-black/50 border-white/5 min-h-[160px] rounded-sm focus-visible:ring-primary/50 focus-visible:border-primary/50 resize-none"
            />
          </div>

          <div className="flex flex-col justify-start items-center gap-2 sm:flex-row mt-16 text-center hover:translate-x-1 transition-transform">
            <div className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
              <Button
                size="lg"
                type="submit"
                className="rounded-xl px-5 text-base"
              >
                Send Message
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}

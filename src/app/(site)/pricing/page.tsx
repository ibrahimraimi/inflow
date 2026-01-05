"use client";

import { cn } from "@/lib/utils";
import { PricingSection } from "@/components/site/pricing/pricing-section";

export default function PricingPage() {
  return (
    <div
      className={cn(
        "relative min-h-svh w-full overflow-hidden",
        "flex items-center justify-center p-4"
      )}
    >
      {/* Subtle dotted grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.08) 0.8px, transparent 0.8px)",
          backgroundSize: "14px 14px",
          maskImage:
            "radial-gradient( circle at 50% 10%, rgba(0,0,0,1), rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 70% )",
        }}
      />
      <PricingSection />
    </div>
  );
}

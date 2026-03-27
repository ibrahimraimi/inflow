"use client";

import { Check, Clipboard, Terminal } from "lucide-react";
import { useState } from "react";
import { Layout } from "../layout";

const steps = [
  {
    title: "Sign up",
    time: "30 seconds",
    description: "Create your free account on Inflow Cloud.",
    icon: Check,
  },
  {
    title: "Add tracking code",
    time: "2 minutes",
    description: "Add our privacy-friendly tracking code to your website.",
    icon: Terminal,
    code: `<script
  defer
  data-website-id="your-website-id"
  data-domain="https://your-domain.com"
  src="https://inflow.site/script.js">
</script>`,
  },
  {
    title: "See your data",
    time: "instantly",
    description: "Data will start appearing on your dashboard immediately.",
    icon: Check,
  },
];

export function GetStartedSteps() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
      <Layout className="px-0">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-foreground md:text-4xl mb-12 sm:mb-16 md:mb-20">
          Get started in 3 simple steps
        </h2>

        <div className="relative">
          {/* Vertical line for mobile */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border md:hidden" />

          {/* Horizontal line for desktop */}
          <div className="hidden md:block absolute top-[21px] left-[16.66%] right-[16.66%] h-px bg-border shadow-[0_0_10px_rgba(0,0,0,0.1)]" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative pl-12 md:pl-0 flex flex-col items-start md:items-center text-left md:text-center group"
              >
                {/* Step number badge */}
                <div className="absolute left-0 md:static top-0 md:mb-8">
                  <div className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-primary text-primary-foreground font-bold border-4 border-background shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-primary/20">
                    <span className="text-sm md:text-base">{idx + 1}</span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-center gap-2 mb-3 w-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {step.time}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {step.code && (
                  <div className="w-full mt-4 sm:mt-6 rounded-lg p-3 sm:p-4 relative group/code shadow-lg border border-border/50 bg-muted/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                        TRACKING SCRIPT
                      </span>
                      <button
                        onClick={() => copyToClipboard(step.code!)}
                        className="p-1.5 hover:bg-accent rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground"
                        aria-label="Copy code"
                      >
                        {copied ? (
                          <Check
                            size={14}
                            className="sm:w-4 sm:h-4 text-green-500"
                          />
                        ) : (
                          <Clipboard size={14} className="sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                    <div className="bg-card rounded-md p-3 sm:p-4 border border-border/50 overflow-x-auto">
                      <pre className="text-xs sm:text-sm font-mono text-left">
                        <code>
                          <span className="text-muted-foreground">&lt;</span>
                          <span className="text-[#569cd6]">script</span>
                          {"\n  "}
                          <span className="text-[#9cdcfe]">defer</span>
                          {"\n  "}
                          <span className="text-[#9cdcfe]">
                            data-website-id
                          </span>
                          <span className="text-muted-foreground">=</span>
                          <span className="text-[#ce9178]">
                            "your-website-id"
                          </span>
                          {"\n  "}
                          <span className="text-[#9cdcfe]">data-domain</span>
                          <span className="text-muted-foreground">=</span>
                          <span className="text-[#ce9178]">
                            "https://your-domain.com"
                          </span>
                          {"\n  "}
                          <span className="text-[#9cdcfe]">src</span>
                          <span className="text-muted-foreground">=</span>
                          <span className="text-[#ce9178]">
                            "https://inflow.site/script.js"
                          </span>
                          <span className="text-muted-foreground">&gt;</span>
                          {"\n"}
                          <span className="text-muted-foreground">&lt;/</span>
                          <span className="text-[#569cd6]">script</span>
                          <span className="text-muted-foreground">&gt;</span>
                        </code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Layout>
  );
}

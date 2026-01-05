import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CtaProps {
  heading: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
      className?: string;
    };
  };
  className?: string;
}

export function Cta({
  heading = "Are you ready for better analytics?",
  buttons = {
    primary: {
      text: "Get Started",
      url: "https://www.shadcnblocks.com",
    },
  },
  className,
}: CtaProps) {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="rounded-lg bg-accent p-8 md:rounded-xl lg:p-12">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="mb-4 text-3xl font-semibold md:text-5xl lg:mb-6 lg:text-6xl">
              {heading}
            </h3>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              {buttons.primary && (
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href={buttons.primary.url}>{buttons.primary.text}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

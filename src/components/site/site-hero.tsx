import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Hero8Props {
  className?: string;
}

export function SiteHero({ className }: Hero8Props) {
  return (
    <section className={cn("py-32", className)}>
      <div className="overflow-hidden border-muted">
        <div className="container">
          <div className="mx-auto flex flex-col items-center">
            <div className="z-10 items-center text-center">
              <h1 className="mb-8 text-4xl font-semibold text-pretty lg:text-7xl lg:max-w-5xl">
                The modern analytics platform for effortless insights.
              </h1>
              <p className="mx-auto max-w-3xl text-muted-foreground lg:text-xl">
                Inflow makes it easy to collect, analyze, and understand your
                website data, so you can focus on{" "}
                <span className="font-bold">growth.</span>
              </p>
              <div className="mt-12 flex flex-col justify-center items-center gap-2 sm:flex-row">
                <div className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl px-5 text-base"
                  >
                    <Link href="/login">
                      <span className="text-nowrap">Get Started</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-24 max-w-7xl">
            <Image
              src="/assets/hero.png"
              alt="Analytics Dashboard"
              width={1440}
              height={900}
              className="w-full h-auto rounded-lg border border-border/50 shadow-2xl object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

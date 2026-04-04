"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@inflow/core/lib/utils";
import { LogoMarkDark, LogoMarkLight } from "@/components/logo";
import { MobileNav } from "./mobile-nav";
import { useScroll } from "@/hooks/use-scroll";
import { Button, buttonVariants } from "@inflow/ui";
import { Layout } from "@/components/layout";
import siteConfig from "@inflow/core/configs/site";

export const navLinks = [
  {
    label: "Features",
    href: "/features",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "Docs",
    href: "https://inflowdocs.vercel.app",
  },
];

export function SiteHeader() {
  const scrolled = useScroll(10);
  const pathname = usePathname();
  if (
    ["/login", "/signup", "/dashboard", "/docs", "/forgot-password"].some((url) => pathname.startsWith(url))
  ) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full py-2 border-transparent border-b",
        {
          "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50":
            scrolled,
        }
      )}
    >
      <Layout className="lg:py-0 py-0 sm:py-0 md:py-0">
        <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between">
          <div className="p-1 hover:border hover:border-dashed">
            <Link
              className="flex items-center space-x-2"
              aria-label="home"
              href="/"
            >
            <LogoMarkDark
              className="text-foreground h-7 w-7 dark:hidden"
              aria-hidden={true}
            />
            <LogoMarkLight
              className="text-foreground hidden h-7 w-7 dark:block"
              aria-hidden={true}
            />
          </Link>
        </div>
        <div
          className={cn(
            "items-center gap-1",
            "hidden md:flex"
          )}
        >
          {navLinks.map((link) => (
              <Link
                className={buttonVariants({ variant: "link" })}
                href={link.href}
                key={link.label}
              >
                {link.label}
              </Link>
            ))}
          <Link href={`${siteConfig.dashboardUrl}/login`} className="mr-2 ml-4">
            <Button variant="outline" className="cursor-pointer">
              Sign In
            </Button>
          </Link>
          <Link href={`${siteConfig.dashboardUrl}/signup`}>
            <Button className="cursor-pointer">Get Started</Button>
          </Link>
        </div>
        {!pathname.startsWith("/dashboard") && <MobileNav />}
      </nav>
</Layout>
    </header>
  );
}

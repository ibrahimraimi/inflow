"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { MobileNav } from "./mobile-nav";
import { authClient } from "@/lib/auth-client";
import { useScroll } from "@/hooks/use-scroll";
import { UserNav } from "@/components/nav-user";
import { Button, buttonVariants } from "@/components/ui/button";

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
    href: "/docs",
  },
];

export function SiteHeader() {
  const scrolled = useScroll(10);
  const { data: session } = authClient.useSession();

  const pathname = usePathname();
  const urls = ["/dashboard", "/login", "/signup"];

  if (urls.some((url) => pathname.startsWith(url))) {
    return null;
  }

  return (
    <header
      className={cn("sticky top-0 z-50 w-full border-transparent border-b", {
        "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50":
          scrolled,
      })}
    >
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between">
        <div className="rounded-md p-2 hover:bg-accent">
          <Logo />
        </div>
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              className={buttonVariants({ variant: "ghost" })}
              href={link.href}
              key={link.label}
            >
              {link.label}
            </a>
          ))}
          {session ? (
            <UserNav user={session.user} />
          ) : (
            <>
              <Link href="/login" className="mr-2">
                <Button variant="outline" className="cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="cursor-pointer">Get Started</Button>
              </Link>
            </>
          )}
        </div>
        <MobileNav />
      </nav>
    </header>
  );
}

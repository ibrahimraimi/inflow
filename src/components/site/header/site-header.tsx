"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { LogoMarkDark, LogoMarkLight } from "@/components/logo";
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
    label: "Docs",
    href: "/docs",
  },
];

export function SiteHeader() {
  const scrolled = useScroll(10);
  const { data: session } = authClient.useSession();

  const pathname = usePathname();
  if (
    ["/login", "/signup", "/dashboard"].some((url) => pathname.startsWith(url))
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
            pathname.startsWith("/dashboard") ? "flex" : "hidden md:flex"
          )}
        >
          {!pathname.startsWith("/dashboard") &&
            navLinks.map((link) => (
              <Link
                className={buttonVariants({ variant: "link" })}
                href={link.href}
                key={link.label}
              >
                {link.label}
              </Link>
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
        {!pathname.startsWith("/dashboard") && <MobileNav />}
      </nav>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoMarkDark, LogoMarkLight } from "@/components/logo";

const links = [
  {
    href: "https://github.com/ibrahimraimi/inflow",
    title: "GitHub",
  },
  {
    href: "/privacy",
    title: "Privacy Policy",
  },
  {
    href: "/terms",
    title: "Terms of Service",
  },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (
    ["/login", "/signup", "/dashboard"].some((url) => pathname.startsWith(url))
  ) {
    return null;
  }
  return (
    <footer className="border-t py-10 mx-auto w-full max-w-7xl">
      <div className="mx-auto">
        <div className="flex flex-wrap justify-between gap-12">
          <div className="order-last flex items-center gap-3 md:order-first">
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
            <span className="text-muted-foreground block text-center text-sm">
              © {new Date().getFullYear()} Inflow, All rights reserved
            </span>
          </div>

          <div className="order-first flex flex-wrap gap-x-6 gap-y-4 md:order-last">
            {links.map((link, index) => (
              <Link
                key={index}
                className="text-muted-foreground hover:text-primary block duration-150"
                href={link.href}
              >
                <span>{link.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { GithubIcon, InstagramIcon, TwitterIcon } from "lucide-react";

export function SiteFooter() {
  const company = [
    {
      title: "About",
      href: "#",
    },
    {
      title: "Contact",
      href: "#",
    },
    {
      title: "Privacy",
      href: "#",
    },
    {
      title: "Terms",
      href: "#",
    },
  ];

  const product = [
    {
      title: "Features",
      href: "/features",
    },
    {
      title: "Pricing",
      href: "/pricing",
    },
    {
      title: "Documentation",
      href: "#",
    },
    {
      title: "Support",
      href: "#",
    },
  ];

  const socialLinks = [
    {
      icon: GithubIcon,
      link: "#",
    },
    {
      icon: InstagramIcon,
      link: "#",
    },
    {
      icon: TwitterIcon,
      link: "#",
    },
  ];
  return (
    <footer className="relative">
      <div
        className={cn(
          "mx-auto  lg:border-x",
          "dark:bg-[radial-gradient(35%_80%_at_30%_0%,--theme(--color-foreground/.1),transparent)]"
        )}
      >
        <div className="absolute inset-x-0 h-px w-full bg-border" />
        <div className="grid grid-cols-6 gap-6 p-4">
          <div className="col-span-6 flex flex-col gap-4 pt-5 md:col-span-4">
            <div className="w-max">
              <Logo />
            </div>
            <p className="max-w-sm text-balance font-mono text-muted-foreground text-sm">
              A comprehensive financial technology platform.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((item, index) => (
                <Button
                  key={`social-${item.link}-${index}`}
                  size="icon-sm"
                  variant="outline"
                >
                  <Link href={item.link} target="_blank">
                    <item.icon className="size-3.5" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-muted-foreground text-xs">Product</span>
            <div className="mt-2 flex flex-col gap-2">
              {product.map(({ href, title }) => (
                <Link
                  className="w-max text-sm hover:underline"
                  href={href}
                  key={title}
                >
                  {title}
                </Link>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-muted-foreground text-xs">Company</span>
            <div className="mt-2 flex flex-col gap-2">
              {company.map(({ href, title }) => (
                <Link
                  className="w-max text-sm hover:underline"
                  href={href}
                  key={title}
                >
                  {title}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 h-px w-full bg-border" />
        <div className="flex  flex-col justify-between gap-2 py-4">
          <p className="text-center font-light text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Inflow, All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import { createPortal } from "react-dom";

import { MenuIcon, XIcon } from "lucide-react";

import { cn } from "@inflow/core/lib/utils";
import { navLinks } from "./site-header";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button, buttonVariants } from "@inflow/ui";
import { UserNav } from "@/components/nav-user";
import { authClient } from "@inflow/core/lib/auth-client";
import Link from "next/link";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { isMobile } = useMediaQuery();
  const { data: session } = authClient.useSession();

  // Disable body scroll when open
  React.useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, isMobile]);

  // Close menu when clicking on a link
  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="md:hidden w-8 h-8"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        {open ? (
          <XIcon className="size-4.5" />
        ) : (
          <MenuIcon className="size-4.5" />
        )}
      </Button>
      {open &&
        createPortal(
          <div
            className={cn(
              "bg-background",
              "fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-y-auto md:hidden"
            )}
            id="mobile-menu"
          >
            <div
              className={cn(
                "data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
                "flex flex-col p-4"
              )}
              data-slot={open ? "open" : "closed"}
            >
              {/* Navigation Links */}
              <nav className="grid gap-y-2 mb-6">
                {navLinks.map((link) => (
                  <Link
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start",
                    })}
                    href={link.href}
                    key={link.label}
                    onClick={handleLinkClick}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Auth Section */}
              <div className="mt-auto pt-4 border-t">
                {session ? (
                  <UserNav user={session.user} isMobile />
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        handleLinkClick();
                        window.location.href = "/login";
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        handleLinkClick();
                        window.location.href = "/signup";
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
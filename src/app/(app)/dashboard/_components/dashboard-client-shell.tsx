"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, PanelRight } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LogoMarkDark, LogoMarkLight } from "@/components/logo";
import { DashboardSidebar } from "./dashboard-sidebar";
import { cn } from "@/lib/utils";

interface DashboardClientShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function DashboardClientShell({ children, user }: DashboardClientShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden flex-col lg:flex-row bg-muted/40">
      {/* Mobile Top Navigation */}
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <LogoMarkDark className="h-6 w-6 dark:hidden" />
          <LogoMarkLight className="h-6 w-6 hidden dark:block" />
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <PanelRight className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 lg:hidden",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={cn(
            "fixed inset-y-0 left-0 w-50 bg-card transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <DashboardSidebar
            user={user}
            onClose={() => setIsOpen(false)}
            className="border-r-0"
          />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <DashboardSidebar user={user} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

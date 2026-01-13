"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Globe,
  Link as LinkIcon,
  PanelLeft,
  PanelRight,
  Settings,
  ArrowLeft,
  SlidersHorizontal,
  User,
  Users,
  Mail,
  Bell,
  Key,
  Database,
  BarChart3,
  CreditCard,
  LifeBuoy,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { LogoMarkDark, LogoMarkLight } from "@/components/logo";
import { UserNav } from "@/components/nav-user";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

const mainSidebarItems = [
  {
    title: "Websites",
    href: "/dashboard",
    icon: Globe,
  },
  {
    title: "Links",
    href: "/dashboard/links",
    icon: LinkIcon,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const settingsSidebarItems = [
  {
    title: "Preferences",
    href: "/dashboard/settings",
    icon: SlidersHorizontal,
  },
  {
    title: "Account",
    href: "/dashboard/settings/account",
    icon: User,
  },
  {
    title: "Teams",
    href: "/dashboard/settings/teams",
    icon: Users,
  },
  {
    title: "Email reports",
    href: "/dashboard/settings/reports",
    icon: Mail,
  },
  {
    title: "Notifications",
    href: "/dashboard/settings/notifications",
    icon: Bell,
  },
  {
    title: "API keys",
    href: "/dashboard/settings/keys",
    icon: Key,
  },
  {
    title: "Data",
    href: "/dashboard/settings/data",
    icon: Database,
  },
  {
    title: "Usage",
    href: "/dashboard/settings/usage",
    icon: BarChart3,
  },
  {
    title: "Billing",
    href: "/dashboard/settings/billing",
    icon: CreditCard,
  },
  {
    title: "Support",
    href: "/dashboard/settings/support",
    icon: LifeBuoy,
  },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isSettings = pathname.startsWith("/dashboard/settings");
  const sidebarItems = isSettings ? settingsSidebarItems : mainSidebarItems;

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-card py-6 text-card-foreground transition-all duration-300",
        isCollapsed ? "w-15 px-2 items-center" : "w-62.5 px-2"
      )}
    >
      <div className="flex h-14 items-center px-2 justify-between mb-4">
        {isCollapsed ? (
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
        ) : (
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
            <span className="text-xl">Inflow</span>
          </Link>
        )}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(true)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto no-scrollbar">
        <nav className="flex flex-col gap-1">
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mb-2 self-center"
              onClick={() => setIsCollapsed(false)}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          )}

          {isSettings && !isCollapsed && (
            <div className="mb-4 space-y-4 px-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to app
              </Link>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">
                Settings
              </h2>
            </div>
          )}

          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-all hover:bg-muted/80",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground/80 hover:text-foreground",
                  isCollapsed ? "justify-center px-2" : "px-3"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {isSettings && !isCollapsed && (
          <div className="mt-4 px-2 space-y-3">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3 border-dashed">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Upgrade to Pro
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Get advanced analytics & more.
                </p>
              </div>
              <Button
                size="sm"
                className="w-full h-8 text-xs font-bold"
                variant="outline"
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto border-t pt-4 w-full px-2">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}
        >
          <UserNav user={user} />
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium leading-none">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground mt-1">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

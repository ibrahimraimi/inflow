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
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  LogoThirdVariantWithName,
  LogoThirdVariantWithoutName,
} from "@/components/logo";
import { UserNav } from "@/components/nav-user";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

const sidebarItems = [
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

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-card py-6 text-card-foreground transition-all duration-300",
        isCollapsed ? "w-15 px-2 items-center" : "w-62.5 px-4"
      )}
    >
      <div className="flex h-14 items-center justify-between mb-4">
        {isCollapsed ? (
          <LogoThirdVariantWithoutName />
        ) : (
          <LogoThirdVariantWithName />
        )}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsCollapsed(true)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <nav className="flex flex-col gap-2">
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mb-2 self-center"
              onClick={() => setIsCollapsed(false)}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          )}

          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-sm py-2 text-sm font-medium transition-all hover:bg-muted",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground",
                  isCollapsed ? "justify-center px-2" : "px-3"
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto border-t pt-4 w-full">
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

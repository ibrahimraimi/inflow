"use client";

import { useState } from "react";

import { PlusIcon, Search, SquarePen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const [websites] = useState([
    {
      id: "1",
      name: "Studio21",
      domain: "studio21.studio",
      icon: "21",
      iconClass: "bg-[#1C1C1C] text-white",
    },
    {
      id: "2",
      name: "Ibrahim Raimi",
      domain: "www.ibrahimraimi.com",
      icon: "",
      iconClass: "bg-[#FF5500]",
    },
  ]);

  return (
    <div className="lg:mt-8 mt-20 w-full">
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">
          Websites
        </h1>
        <div className="bg-foreground/10 rounded-[calc(var(--radius-lg)+0.125rem)] border p-0.5">
          <Link href="/dashboard/new">
            <Button
              size="default"
              className="rounded-lg px-4 text-sm font-medium cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="text-nowrap">Add website</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full rounded-xl border bg-card text-card-foreground shadow-sm border-dashed">
        <div className="p-6">
          <div className="relative max-w-sm mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-9 bg-muted/40 border-border/40 h-10 text-sm"
            />
          </div>

          <div className="w-full">
            <div className="flex items-center mb-4 px-2 text-xs font-bold text-muted-foreground tracking-wide uppercase">
              <div className="w-1/2 max-w-75">Name</div>
              <div className="flex-1">Domain</div>
              <div className="ml-auto sr-only">Actions</div>
            </div>

            <div className="divide-y divide-border/40 border-t border-border/40">
              {websites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between px-2 py-4 hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-1/2 max-w-75">
                    <div
                      className={cn(
                        "size-6 rounded flex items-center justify-center text-[10px] font-bold shadow-sm",
                        site.iconClass
                      )}
                    >
                      {site.icon}
                    </div>
                    <span className="font-medium text-sm text-foreground">
                      {site.name}
                    </span>
                  </div>
                  <div className="flex-1 text-muted-foreground text-sm">
                    {site.domain}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-70 hover:opacity-100 hover:text-foreground hover:bg-muted ml-auto"
                  >
                    <SquarePen className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@inflow/core/lib/utils";
import React from "react";

export function Layout({children, className}: {children: React.ReactNode, className?: string}) {
    return (
      <div
        className={cn(
          "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10 lg:py-24 xl:px-0",
          className
        )}
      >
        {children}
      </div>
    );
}
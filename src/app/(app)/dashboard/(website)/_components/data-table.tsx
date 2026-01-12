import { useState } from "react";
import {
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  HelpCircle,
  Chrome,
  Command,
  MousePointer2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataItem {
  name?: string;
  path?: string;
  visitors: number;
  percentage: number;
  icon?: string | null;
}

interface DataTableProps {
  title: string;
  tabs: string[];
  data: Record<string, DataItem[]>;
  type: string;
  emptyMessage?: string;
}

export function DataTable({
  title,
  tabs,
  data,
  type,
  emptyMessage = "No data available",
}: DataTableProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const currentData = data[activeTab] || [];

  const getIcon = (item: DataItem) => {
    const name = (item.name || item.path || "").toLowerCase();

    if (item.icon) {
      return (
        <img
          src={item.icon}
          alt={name}
          className="w-4 h-4 object-cover shadow-sm"
        />
      );
    }

    if (type === "browser") {
      if (name.includes("chrome")) return <Chrome className="w-4 h-4" />;
      if (name.includes("safari")) return <Command className="w-4 h-4" />;
      if (name.includes("edge")) return <Monitor className="w-4 h-4" />;
      if (name.includes("firefox")) return <Globe className="w-4 h-4" />;
      if (
        name.includes("mobile") ||
        name.includes("ios") ||
        name.includes("android")
      )
        return <Smartphone className="w-4 h-4" />;
      return <Monitor className="w-4 h-4" />;
    }

    if (type === "country") {
      // TODO: Ues the flag libary
      return <Globe className="w-4 h-4" />;
    }

    if (type === "source") {
      if (name.includes("google")) return <Globe className="w-4 h-4" />;
      if (
        name.includes("facebook") ||
        name.includes("instagram") ||
        name.includes("x") ||
        name.includes("t.co")
      )
        return <Globe className="w-4 h-4" />;
      return <MousePointer2 className="w-4 h-4" />;
    }

    return null;
  };

  const getLabel = () => {
    switch (type) {
      case "path":
        return "Page";
      case "source":
        return "Source";
      case "browser":
        return "Browser";
      case "country":
        return "Country";
      default:
        return "Item";
    }
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>

      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="px-4 pt-2 flex gap-4 border-b text-sm shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2 border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="p-2 flex-1 flex flex-col min-h-[300px]">
        {/* Header - aligned with content */}
        <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground mb-1 shrink-0">
          <div className="flex-1">{getLabel()}</div>
          <div className="flex items-center gap-8 text-right">
            <div className="w-16">Visitors</div>
            <div className="w-12">%</div>
          </div>
        </div>

        <div className="space-y-2 p-2 grow">
          {currentData.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            currentData.slice(0, 8).map((item, i) => (
              <div
                key={i}
                className="group relative flex items-center min-h-[36px] px-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                {/* Progress Bar Background */}
                <div
                  className="absolute inset-y-0 left-0 bg-primary/5 rounded-r-md transition-all rounded-l-md"
                  style={{ width: `${item.percentage}%` }}
                />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-between w-full gap-4">
                  <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                    {getIcon(item) && (
                      <span className="text-muted-foreground shrink-0">
                        {getIcon(item)}
                      </span>
                    )}
                    <span
                      className="truncate text-sm font-medium leading-none pt-0.5"
                      title={item.path || item.name}
                    >
                      {item.path || item.name || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center gap-8 text-right shrink-0">
                    <div className="w-16 text-sm font-medium">
                      {item.visitors.toLocaleString()}
                    </div>
                    <div className="w-12 text-sm text-muted-foreground">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto text-center border-t pt-2">
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors p-2 w-full">
            View more
          </button>
        </div>
      </div>
    </div>
  );
}

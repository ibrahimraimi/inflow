import { MousePointer2, ExternalLink } from "lucide-react";
import type { RageClickItem } from "@/hooks/use-rage-clicks";

interface RageClicksTableProps {
  data?: RageClickItem[];
  isLoading?: boolean;
}

export function RageClicksTable({ data = [], isLoading }: RageClicksTableProps) {
  return (
    <div className="bg-card border rounded-lg overflow-hidden shadow-sm flex flex-col h-full lg:col-span-2">
      <div className="p-4 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Rage Clicks</h3>
        </div>
      </div>

      <div className="p-2 flex-1 flex flex-col min-h-[300px]">
        <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground mb-1 shrink-0">
          <div className="flex-1">Element</div>
          <div className="flex items-center gap-8 text-right">
            <div className="w-16">Clicks</div>
            <div className="w-16">Users</div>
          </div>
        </div>

        <div className="space-y-2 p-2 grow">
          {isLoading ? (
            <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
              No rage clicks detected
            </div>
          ) : (
            data.slice(0, 5).map((item, i) => (
              <div
                key={i}
                className="group relative flex items-center min-h-[44px] px-2 rounded-md hover:bg-muted/50 transition-colors"
                title={item.element}
              >
                <div className="relative z-10 flex items-center justify-between w-full gap-4">
                  <div className="flex flex-col overflow-hidden w-full min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <MousePointer2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate text-sm font-medium leading-none">
                        {item.text || "Unknown Element"}
                      </span>
                    </div>
                    <span className="truncate text-[10px] text-muted-foreground mt-1 ml-5 flex items-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5" />
                      {item.url}
                    </span>
                  </div>

                  <div className="flex items-center gap-8 text-right shrink-0">
                    <div className="w-16 text-sm font-medium text-destructive">
                      {item.clicks}
                    </div>
                    <div className="w-16 text-sm text-muted-foreground">
                      {item.uniqueUsers}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

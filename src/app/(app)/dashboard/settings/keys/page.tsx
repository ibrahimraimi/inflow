"use client";

import { useState } from "react";
import { Key, Plus, Eye, Copy, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function KeysSettingsPage() {
  const [keys, setKeys] = useState([
    {
      id: "1",
      key: "••••••••••••••••••••••••••••••••••••",
      created: "less than a minute ago",
    },
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API Key copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight text-foreground">
          API keys
        </h1>
        <Button
          size="sm"
          variant="default"
          className="px-4 text-sm font-medium cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Create key
        </Button>
      </div>

      {keys.length > 0 ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 flex items-center border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            <div className="flex-1">Key</div>
            <div className="w-1/3">Created</div>
            <div className="w-10"></div>
          </div>
          <div className="divide-y divide-border/50">
            {keys.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 flex items-center gap-3">
                  <div className="font-mono text-sm tracking-widest text-muted-foreground/50 bg-background/50 px-3 py-1.5 rounded border flex items-center gap-2">
                    {item.key}
                    <div className="flex items-center gap-1.5 ml-2 border-l pl-2 text-muted-foreground">
                      <button className="hover:text-foreground transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard("real-key-would-be-here")
                        }
                        className="hover:text-foreground transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-1/3 text-xs font-medium text-muted-foreground">
                  {item.created}
                </div>
                <div className="w-10 flex justify-end">
                  <button className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-16 flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-4 rounded-full border-2 border-muted/50">
            <Key
              className="h-10 w-10 text-muted-foreground/50"
              strokeWidth={1.5}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold">You do not have any API keys.</h2>
            <p className="text-xs text-muted-foreground">
              API keys allow you to access your data through api.umami.is.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { ExternalLink, Mail, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SupportSettingsPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">
          Support
        </h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm px-8 py-2 divide-y divide-border/50">
        <div className="flex items-center justify-between py-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold">Email us</h3>
            <p className="text-xs text-muted-foreground">
              Our support team is always here to help.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-xs font-bold px-4"
            onClick={() => copyToClipboard("support@inflow.com")}
          >
            support@inflow.com
          </Button>
        </div>

        <div className="flex items-center justify-between py-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold">Chat with us</h3>
            <p className="text-xs text-muted-foreground">
              Join our community and get real-time support.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-xs font-bold px-4"
            asChild
          >
            <a
              href="https://discord.gg/inflow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Discord
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>

        <div className="flex items-center justify-between py-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold">Read the docs</h3>
            <p className="text-xs text-muted-foreground">
              Learn how to integrate and use Inflow.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-xs font-bold px-4"
            asChild
          >
            <a
              href="https://inflow.studio21.studio/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Documentation
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

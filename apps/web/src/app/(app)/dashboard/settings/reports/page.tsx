import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ReportsSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">
          Email reports
        </h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-16 flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 rounded-full border-2 border-muted/50">
          <Mail
            className="h-10 w-10 text-muted-foreground/50"
            strokeWidth={1.5}
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-bold">
            Email reports requires a Pro plan
          </h2>
          <p className="text-xs text-muted-foreground">
            Please{" "}
            <Link
              href="/dashboard/settings/billing"
              className="text-primary hover:underline underline-offset-4"
            >
              upgrade your account
            </Link>
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 px-6 text-xs font-bold"
          variant="outline"
        >
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}

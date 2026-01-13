import { Users } from "lucide-react";

export default function TeamsSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">Teams</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-16 flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 rounded-full border-2 border-muted/50">
          <Users
            className="h-10 w-10 text-muted-foreground/50"
            strokeWidth={1.5}
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-bold">Team Management coming soon</h2>
          <p className="text-xs text-muted-foreground">
            We're building powerful team collaboration tools. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}

import { Switch } from "@/components/ui/switch";

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">
          Notifications
        </h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold">Email preferences</h3>
          <p className="text-xs text-muted-foreground">
            Receive emails about product features and updates.
          </p>
        </div>
        <Switch />
      </div>
    </div>
  );
}

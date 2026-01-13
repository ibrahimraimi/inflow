import { Button } from "@/components/ui/button";

export default function DataSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">Data</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold">Export data</h3>
          <p className="text-xs text-muted-foreground">
            Export all your data. You will receive an email when your files are
            ready to be downloaded.
          </p>
        </div>
        <Button size="sm" className="h-8 px-6 text-xs font-bold">
          Export
        </Button>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold">Import data</h3>
          <p className="text-xs text-muted-foreground">
            Import data from an external source.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-4 text-xs font-bold"
        >
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}

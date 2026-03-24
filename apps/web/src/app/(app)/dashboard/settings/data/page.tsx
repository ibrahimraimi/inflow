"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWebsites } from "@/hooks/use-websites";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import type { AnalyticsData } from "@inflow/types";

export default function DataSettingsPage() {
  const { websites, isLoading } = useWebsites();
  const [selectedWebsite, setSelectedWebsite] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  const handleExportUTM = async () => {
    if (!selectedWebsite) {
      toast.error("Please select a website first.");
      return;
    }
    setExporting(true);
    try {
      const response = await axios.get(`/api/website/${selectedWebsite}/analytics?range=all_time`);
      const data = response.data as AnalyticsData;
      
      const campaigns = data.tables.utmCampaigns || [];
      const sources = data.tables.utmSources || [];
      const mediums = data.tables.utmMediums || [];

      let csv = "Type,Name,Visitors,Unique Visitors,Percentage\n";
      
      const appendToCSV = (type: string, list: any[]) => {
        list.forEach(item => {
          csv += `${type},"${item.name}",${item.visitors},${item.uniqueVisitors},${item.percentage}%\n`;
        });
      };

      appendToCSV("Campaign", campaigns);
      appendToCSV("Source", sources);
      appendToCSV("Medium", mediums);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `utm_reports_${selectedWebsite}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("UTM reports exported successfully!");
    } catch (e) {
      toast.error("Failed to export UTM data");
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">Data</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold">Export UTM Reports (CSV)</h3>
          <p className="text-xs text-muted-foreground">
            Export your UTM Campaign, Source, and Medium data as a CSV file for a specific website.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
            <SelectTrigger className="w-full sm:w-48 h-8 text-xs">
              <SelectValue placeholder="Select website" />
            </SelectTrigger>
            <SelectContent>
              {websites.map((w) => (
                <SelectItem key={w.website.websiteId} value={w.website.websiteId}>
                  {w.website.websiteName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            className="h-8 px-6 text-xs font-bold whitespace-nowrap" 
            onClick={handleExportUTM}
            disabled={exporting || !selectedWebsite || isLoading}
          >
            {exporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Export CSV
          </Button>
        </div>
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
          className="h-8 px-4 text-xs font-bold whitespace-nowrap"
        >
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}

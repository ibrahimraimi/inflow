"use client";

import { useState } from "react";
import { Copy, ExternalLink, Sun, Moon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SettingsPage() {
  const [dateRange, setDateRange] = useState("last_24_hours");
  const [timezone, setTimezone] = useState("africa_lagos");
  const [language, setLanguage] = useState("en_us");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const handleReset = (field: string) => {
    switch (field) {
      case "dateRange":
        setDateRange("last_24_hours");
        break;
      case "timezone":
        setTimezone("africa_lagos");
        break;
      case "language":
        setLanguage("en_us");
        break;
    }
    toast.success("Reset to default");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">
          Preferences
        </h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 space-y-10">
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Default date range
          </Label>
          <div className="flex gap-3 items-center">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full max-w-[500px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_24_hours">Last 24 hours</SelectItem>
                <SelectItem value="last_7_days">Last 7 days</SelectItem>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                <SelectItem value="last_90_days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              className="h-9 px-4 text-xs font-medium"
              onClick={() => handleReset("dateRange")}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Timezone
          </Label>
          <div className="flex gap-3 items-center">
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-full max-w-[500px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="africa_lagos">Africa/Lagos</SelectItem>
                <SelectItem value="america_new_york">
                  America/New York
                </SelectItem>
                <SelectItem value="europe_london">Europe/London</SelectItem>
                <SelectItem value="asia_tokyo">Asia/Tokyo</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              className="h-9 px-4 text-xs font-medium"
              onClick={() => handleReset("timezone")}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Language
          </Label>
          <div className="flex gap-3 items-center">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full max-w-[500px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en_us">English (US)</SelectItem>
                <SelectItem value="en_gb">English (GB)</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              className="h-9 px-4 text-xs font-medium"
              onClick={() => handleReset("language")}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Theme
          </Label>
          <div className="flex p-1 w-fit rounded-md bg-muted/50 gap-1 mt-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme("light")}
              className={cn(
                "h-7 w-7 rounded-sm transition-all",
                theme === "light"
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Sun className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme("dark")}
              className={cn(
                "h-7 w-7 rounded-sm transition-all",
                theme === "dark"
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Moon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

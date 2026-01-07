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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface SettingsPageProps {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const [name, setName] = useState(user?.name || "Ibrahim Raimi");
  const [email, setEmail] = useState(
    user?.email || "ibrahimraimi.tech@gmail.com"
  );
  const [dataRegion, setDataRegion] = useState("US");
  const [dateRange, setDateRange] = useState("last_24_hours");
  const [timezone, setTimezone] = useState("africa_lagos");
  const [language, setLanguage] = useState("en_us");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [loading, setLoading] = useState(false);

  const accountId = user?.id || "64687418-4b1e-4f88-9c2e-829c61569709";

  const handleSaveAccount = async () => {
    setLoading(true);
    try {
      // API call here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Account settings saved!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

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
    <div className="lg:mt-8 mt-20">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="accountId" className="text-sm font-medium">
                  Account ID
                </Label>
                <div className="relative">
                  <Input
                    id="accountId"
                    value={accountId}
                    readOnly
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => copyToClipboard(accountId)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataRegion" className="text-sm font-medium">
                  Data region
                </Label>
                <Select value={dataRegion} onValueChange={setDataRegion}>
                  <SelectTrigger id="dataRegion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">US</SelectItem>
                    <SelectItem value="EU">EU</SelectItem>
                    <SelectItem value="ASIA">Asia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveAccount} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <h3 className="font-medium">Change password</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Change your account password.
                </p>
              </div>
              <Button variant="secondary">Change password</Button>
            </div>

            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <h3 className="font-medium">Change email</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Change your account email.
                </p>
              </div>
              <Button variant="secondary">Change email</Button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-medium">Delete account</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your account along with all your data will be deleted.
                </p>
              </div>
              <Button variant="destructive">Delete</Button>
            </div>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-8">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Default date range</Label>
              <div className="flex gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="max-w-xs">
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
                  onClick={() => handleReset("dateRange")}
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Timezone</Label>
              <div className="flex gap-3">
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="max-w-xs">
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
                  onClick={() => handleReset("timezone")}
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Language</Label>
              <div className="flex gap-3">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="max-w-xs">
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
                  onClick={() => handleReset("language")}
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Theme</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTheme("light")}
                  className="h-10 w-10"
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTheme("dark")}
                  className="h-10 w-10"
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-6">
            <div className="flex items-start justify-between py-4">
              <div className="space-y-1">
                <h3 className="font-medium">Email us:</h3>
              </div>
              <Button
                variant="secondary"
                className="font-mono"
                onClick={() => copyToClipboard("support@inflow.com")}
              >
                support@inflow.com
              </Button>
            </div>

            <div className="flex items-start justify-between py-4 border-t">
              <div className="space-y-1">
                <h3 className="font-medium">Chat with us:</h3>
              </div>
              <Button variant="secondary" asChild>
                <a
                  href="https://discord.gg/inflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Discord
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="flex items-start justify-between py-4 border-t">
              <div className="space-y-1">
                <h3 className="font-medium">Read the docs:</h3>
              </div>
              <Button variant="secondary" asChild>
                <a
                  href="https://inflow.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Documentation
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

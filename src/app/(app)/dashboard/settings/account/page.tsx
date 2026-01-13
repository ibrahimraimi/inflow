"use client";

import { useState } from "react";
import { Copy, Loader2, Key, Mail, Trash2 } from "lucide-react";
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
import { toast } from "sonner";

export default function AccountSettingsPage() {
  const [name, setName] = useState("Ibrahim Raimi");
  const [email, setEmail] = useState("ibrahimraimi.tech@gmail.com");
  const [dataRegion, setDataRegion] = useState("US");
  const [loading, setLoading] = useState(false);

  const accountId = "64687418-4b1e-4f88-9c2e-829c61569709";

  const handleSaveAccount = async () => {
    setLoading(true);
    try {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">
          Account
        </h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 space-y-6">
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="accountId"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80"
            >
              Account ID
            </Label>
            <div className="relative">
              <Input
                id="accountId"
                value={accountId}
                readOnly
                className="pr-10 font-mono text-xs h-9 bg-muted/20"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard(accountId)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80"
            >
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs h-9 bg-muted/20"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs h-9 bg-muted/20"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="dataRegion"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80"
            >
              Data region
            </Label>
            <Select value={dataRegion} onValueChange={setDataRegion}>
              <SelectTrigger
                id="dataRegion"
                className="text-xs h-9 bg-muted/20"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">US</SelectItem>
                <SelectItem value="EU">EU</SelectItem>
                <SelectItem value="ASIA">Asia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSaveAccount}
            disabled={loading}
            size="sm"
            className="h-8 px-6 text-xs font-bold"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm px-8 py-2 divide-y divide-border/50">
        <div className="flex items-center justify-between py-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold">Change password</h3>
            <p className="text-xs text-muted-foreground">
              Change your account password.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-xs font-bold px-4"
          >
            Change password
          </Button>
        </div>

        <div className="flex items-center justify-between py-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold">Change email</h3>
            <p className="text-xs text-muted-foreground">
              Change your account email.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-xs font-bold px-4"
          >
            Change email
          </Button>
        </div>

        <div className="flex items-center justify-between py-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold">Delete account</h3>
            <p className="text-xs text-muted-foreground">
              Your account along with all your data will be deleted.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs font-bold px-4"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

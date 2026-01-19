"use client";

import { useState } from "react";

import { Copy, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ChangeEmailDialog } from "@/components/dashboard/settings/change-email-dialog";
import { ChangePasswordDialog } from "@/components/dashboard/settings/change-password-dialog";
import { DeleteAccountDialog } from "@/components/dashboard/settings/delete-account-dialog";

export default function AccountSettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dataRegion, setDataRegion] = useState("US");
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Update state when session loads
  useState(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  });

  const handleSaveAccount = async () => {
    setLoading(true);
    try {
      // TODO: Implement account update API endpoint
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

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Please sign in to view your account settings.
        </p>
      </div>
    );
  }

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
                value={session.user.id}
                readOnly
                className="pr-10 font-mono text-xs h-9 bg-muted/20"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard(session.user.id)}
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
              value={name || session.user.name}
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
              value={email || session.user.email}
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
            className="h-8 px-6 text-xs font-bold cursor-pointer"
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
            className="h-8 text-xs font-bold px-4 cursor-pointer"
            onClick={() => setPasswordDialogOpen(true)}
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
            className="h-8 text-xs font-bold px-4 cursor-pointer"
            onClick={() => setEmailDialogOpen(true)}
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
            className="h-8 text-xs font-bold px-4 cursor-pointer"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
      <ChangeEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        currentEmail={session.user.email}
      />
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}

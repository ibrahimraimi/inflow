"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMemberRole } from "@/server/teams";

interface UpdateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    id: string;
    user: {
      name: string;
      email: string;
    };
    role: "owner" | "admin" | "member";
  };
  onSuccess?: () => void;
}

export function UpdateRoleDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
}: UpdateRoleDialogProps) {
  const [role, setRole] = useState<"owner" | "admin" | "member">(member.role);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === member.role) {
      toast.info("No changes to save");
      onOpenChange(false);
      return;
    }

    setLoading(true);
    try {
      const result = await updateMemberRole(member.id, role);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Member role updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Role update error:", error);
      toast.error(error.message || "Failed to update member role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Member Role</DialogTitle>
          <DialogDescription>
            Update the role for {member.user.name || member.user.email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-role">Current Role</Label>
              <div className="text-sm font-medium capitalize px-3 py-2 rounded-md bg-muted">
                {member.role}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">New Role</Label>
              <Select
                value={role}
                onValueChange={(value: any) => setRole(value)}
                disabled={loading}
              >
                <SelectTrigger id="new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Members can view, Admins can manage members, Owners have full
                control
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating
                </>
              ) : (
                "Update Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

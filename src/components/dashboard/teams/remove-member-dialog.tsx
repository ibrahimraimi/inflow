"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { removeMember } from "@/server/teams";

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    id: string;
    user: {
      name: string;
      email: string;
    };
    role: string;
  };
  onSuccess?: () => void;
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
}: RemoveMemberDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      const result = await removeMember(member.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Member removed successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Remove member error:", error);
      toast.error(error.message || "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove Team Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this member from your team?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription className="text-xs">
              {member.user.name || member.user.email} will lose access to the
              team and all shared resources immediately. This action cannot be
              undone.
            </AlertDescription>
          </Alert>
          <div className="p-3 rounded-md bg-muted space-y-1">
            <p className="text-sm font-medium">
              {member.user.name || "Unnamed User"}
            </p>
            <p className="text-xs text-muted-foreground">{member.user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">
              Role: {member.role}
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Removing
              </>
            ) : (
              "Remove Member"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

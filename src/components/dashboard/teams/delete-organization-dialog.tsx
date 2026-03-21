"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteOrganization } from "@/server/organizations";

interface DeleteOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
}

export function DeleteOrganizationDialog({
  open,
  onOpenChange,
  organizationId,
  organizationName,
}: DeleteOrganizationDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmName !== organizationName) {
      toast.error("Organization name does not match");
      return;
    }

    setLoading(true);
    try {
      const result = await deleteOrganization(organizationId);

      if (result && !result.success) {
        throw new Error(result.error);
      }

      toast.success("Organization deleted successfully");
      onOpenChange(false);
      // Redirect to dashboard or home after deletion
      router.push("/dashboard");
    } catch (error) {
      console.error("Deletion error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Delete Organization</DialogTitle>
          </div>
          <DialogDescription>
            This action is **permanent** and cannot be undone. This will delete
            the organization <strong>{organizationName}</strong> and remove all
            members.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirmName">
              Type <strong>{organizationName}</strong> to confirm:
            </Label>
            <Input
              id="confirmName"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              disabled={loading}
              placeholder="Enter organization name"
              className="border-destructive/50 focus-visible:ring-destructive"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || confirmName !== organizationName}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Organization"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

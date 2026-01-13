"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import axios from "axios";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { ArrowLeft, Copy, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WebsiteType } from "@/configs/types";
import { Button } from "@/components/ui/button";
import { useWebsite } from "@/hooks/use-website";

export default function EditWebsitePage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const { mutate: mutateGlobal } = useSWRConfig();
  const {
    website,
    isLoading: loading,
    isError,
    mutate,
  } = useWebsite(websiteId);

  useEffect(() => {
    if (website) {
      setName(website.websiteName);
      setDomain(website.domain);
    }
  }, [website]);

  const trackingCode = website
    ? `<script defer data-website-id="${website.websiteId}" data-domain="${website.domain}" src="${window.location.origin}/analytics.js"></script>`
    : "";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSave = async () => {
    if (!name.trim() || !domain.trim()) {
      toast.error("Name and domain are required");
      return;
    }

    setSaveLoading(true);
    try {
      await axios.put(`/api/website/${websiteId}`, {
        websiteName: name,
        domain: domain,
      });
      mutate();
      toast.success("Website updated successfully!");
    } catch (error: unknown) {
      let message = "Failed to update website";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        message = error.response.data.error;
      }
      toast.error(message);
      console.error("Error updating website:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all statistics for this website? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.post(`/api/website/${websiteId}/reset`);
      mutate();
      toast.success("Website statistics reset successfully!");
    } catch (error) {
      toast.error("Failed to reset website");
      console.error("Error resetting website:", error);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this website? All data will be permanently deleted. This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/website/${websiteId}`);
      mutateGlobal(
        (key: unknown) =>
          Array.isArray(key) &&
          typeof key[0] === "string" &&
          key[0].startsWith("/api/website")
      );
      toast.success("Website deleted successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to delete website");
      console.error("Error deleting website:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!website) {
    return null;
  }

  return (
    <div className="lg:mt-8 mt-20">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Websites</span>
        </Link>

        <div className="flex items-center gap-3 mt-4">
          <div
            className={cn(
              "size-10 rounded flex items-center justify-center text-[10px] font-bold shadow-sm bg-primary/10 text-primary"
            )}
          >
            <span className="text-2xl">
              {website.websiteName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{website.websiteName}</h1>
            <p className="text-sm text-muted-foreground">{website.domain}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Website Details Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Website Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="websiteId" className="text-sm font-medium">
                Website ID
              </Label>
              <div className="relative">
                <Input
                  id="websiteId"
                  value={website.websiteId}
                  readOnly
                  className="pr-10 font-mono text-sm bg-muted/50"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => copyToClipboard(website.websiteId)}
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
                placeholder="My Website"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain" className="text-sm font-medium">
                Domain
              </Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Tracking Code Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Tracking Code</h3>
            <p className="text-sm text-muted-foreground">
              To track stats for this website, place the following code in the
              &lt;head&gt; section of your HTML.
            </p>
            <div className="relative">
              <Input
                value={trackingCode}
                readOnly
                className="pr-10 font-mono text-xs bg-muted/50"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => copyToClipboard(trackingCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className="rounded-xl border border-destructive/50 bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-destructive">
            Danger Zone
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <h3 className="font-medium">Reset Website Statistics</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All statistics for this website will be deleted, but your
                  settings will remain intact.
                </p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-medium">Delete Website</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All website data will be permanently deleted. This action
                  cannot be undone.
                </p>
              </div>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

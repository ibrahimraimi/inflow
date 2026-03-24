"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import axios from "axios";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { ArrowLeft, Copy, Loader2, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { WebsiteType } from "@/configs/types";
import { Button } from "@/components/ui/button";
import { useWebsite } from "@/hooks/use-website";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function EditWebsitePage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
      setIsPublic(!!website.isPublic);
    }
  }, [website]);

  const publicLink = website?.publicToken
    ? `${window.location.origin}/share/${website.publicToken}`
    : "";

  const sdkTrackingCode = website
    ? `<script defer src="${window.location.origin}/cdn/inflow.js"></script>
<script>
  window.addEventListener('load', () => {
    inflow.init({ 
      apiKey: 'YOUR_API_KEY', // Get your key from Settings -> Keys
      websiteId: '${website.websiteId}',
      endpoint: '${window.location.origin}/api/track'
    });
  });
</script>`
    : "";

  const npmTrackingCode = website
    ? `import inflow from '@inflow/sdk';
    
inflow.init({ 
  apiKey: 'YOUR_API_KEY', // Get your key from Settings -> Keys
  websiteId: '${website.websiteId}',
  endpoint: '${window.location.origin}/api/track'
});`
    : "";

  const highlightCode = (code: string, lang: "html" | "js") => {
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"(.*?)"/g, '<span class="text-emerald-600">"$1"</span>')
      .replace(/'(.*?)'/g, '<span class="text-emerald-600">\'$1\'</span>');

    if (lang === "js") {
      highlighted = highlighted
        .replace(/\b(import|from|window|inflow|apiKey|websiteId|endpoint)\b/g, '<span class="text-blue-600 font-semibold">$1</span>')
        .replace(/\b(inflow\.init)\b/g, '<span class="text-purple-500">$1</span>')
        .replace(/\b(\w+):(?!\/\/)/g, '<span class="text-orange-600">$1</span>:');
    } else {
      highlighted = highlighted
        .replace(/&lt;script(.*?)&gt;/g, '&lt;<span class="text-blue-600 font-semibold">script</span>$1&gt;')
        .replace(/&lt;\/script&gt;/g, '&lt;/<span class="text-blue-600 font-semibold">script</span>&gt;')
        .replace(/\b(src|defer|apiKey|websiteId|endpoint)\b=/g, '<span class="text-orange-600">$1</span>=')
        .replace(/window\.addEventListener/g, '<span class="text-blue-500 font-semibold">window.addEventListener</span>')
        .replace(/inflow\.init/g, '<span class="text-purple-500">inflow.init</span>');
    }

    return highlighted;
  };

  const CodeBlock = ({ code, lang }: { code: string; lang: "html" | "js" }) => (
    <div className="relative group">
      <pre
        className="p-4 rounded-xl bg-muted/30 text-xs font-mono overflow-x-auto border"
        dangerouslySetInnerHTML={{ __html: highlightCode(code, lang) }}
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(code)}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

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
        isPublic: isPublic,
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
    setResetLoading(true);
    try {
      await axios.post(`/api/website/${websiteId}/reset`);
      mutate();
      toast.success("Website statistics reset successfully!");
      setIsResetOpen(false);
    } catch (error) {
      toast.error("Failed to reset website");
      console.error("Error resetting website:", error);
    } finally {
      setResetLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/website/${websiteId}`);
      mutateGlobal(
        (key: unknown) =>
          Array.isArray(key) &&
          typeof key[0] === "string" &&
          key[0].startsWith("/api/website"),
      );
      toast.success("Website deleted successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to delete website");
      console.error("Error deleting website:", error);
    } finally {
      setDeleteLoading(false);
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
    <div className="lg:mt-8 mt-10">
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
              "size-10 rounded flex items-center justify-center text-[10px] font-bold shadow-sm bg-primary/10 text-primary",
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDomain(e.target.value)
                }
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

        {/* SDK Integration Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SDK Integration</h3>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="text-sm font-semibold">Account API Key Required</h4>
              </div>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
                Create an API key from the {" "}
                <Link
                  href="/dashboard/settings/keys"
                  className="font-bold underline hover:text-blue-800 dark:hover:text-blue-300"
                >
                  API Settings
                </Link>{" "}
                to initialize the SDK.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Script Tag (CDN)</Label>
                <CodeBlock code={sdkTrackingCode} lang="html" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">NPM / ES Modules</Label>
                <CodeBlock code={npmTrackingCode} lang="js" />
              </div>
            </div>
          </div>
        </div>

        {/* Public Share Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Public Share</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Allow anyone with the link to view this website's analytics
                  dashboard.
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={saveLoading}
              />
            </div>

            {isPublic && publicLink && (
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-medium">Public Link</Label>
                <div className="relative">
                  <Input
                    value={publicLink}
                    readOnly
                    className="pr-10 font-mono text-sm bg-muted/50"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => copyToClipboard(publicLink)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: Remember to click "Save Changes" if you toggle public
                  access.
                </p>
              </div>
            )}

            {isPublic && !publicLink && (
              <p className="text-xs text-muted-foreground pt-2">
                Click "Save Changes" to generate a public link.
              </p>
            )}
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
              <Button
                variant="outline"
                onClick={() => setIsResetOpen(true)}
                disabled={resetLoading}
              >
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
              <Button
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
                disabled={deleteLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        <ConfirmDialog
          open={isResetOpen}
          onOpenChange={setIsResetOpen}
          title="Reset website statistics?"
          description="Are you sure you want to reset all statistics for this website? All historical data will be permanently deleted. This action cannot be undone."
          confirmText="Yes, reset statistics"
          onConfirm={handleReset}
          isLoading={resetLoading}
          variant="destructive"
        />

        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Delete website?"
          description="Are you sure you want to delete this website? All data, including statistics and configurations, will be permanently deleted. This action cannot be undone."
          confirmText="Yes, delete website"
          onConfirm={handleDelete}
          isLoading={deleteLoading}
          variant="destructive"
        />
      </div>
    </div>
  );
}

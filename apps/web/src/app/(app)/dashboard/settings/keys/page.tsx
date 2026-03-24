"use client";

import useSWR from "swr";
import axios from "axios";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Key, Plus, Eye, Copy, Trash2, Loader2, AlertTriangle, Terminal, Activity, ShieldCheck, ShieldAlert } from "lucide-react";

import { fetcher } from "@inflow/core/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string | null;
  hint: string;
  scope: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface ApiKeyLog {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  createdAt: string;
}

export default function KeysSettingsPage() {
  const { data: keys, error, isLoading, mutate } = useSWR<ApiKey[]>("/api/account/keys", fetcher);

  // Creation State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  
  // Show Raw Key State
  const [rawKey, setRawKey] = useState<string | null>(null);

  // Logs Modal State
  const [logsKeyId, setLogsKeyId] = useState<string | null>(null);

  // Revocation State
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const copyToClipboard = (text: string, resource: string = "API Key") => {
    navigator.clipboard.writeText(text);
    toast.success(`${resource} copied to clipboard`);
  };

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      const res = await axios.post("/api/account/keys", { 
        name: newKeyName,
        scope: newKeyScope
      });
      
      // Setup UI to show the raw key
      setRawKey(res.data.key);
      
      // Cleanup inputs
      setNewKeyName("");
      setNewKeyScope("all");
      setIsCreateOpen(false);
      
      // Refresh list
      mutate();
      toast.success("API Key generated successfully");
    } catch (e) {
      toast.error("Failed to generate API Key");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeId) return;
    try {
      setIsRevoking(true);
      await axios.delete(`/api/account/keys/${revokeId}`);
      toast.success("API Key revoked successfully");
      mutate();
    } catch (e) {
      toast.error("Failed to revoke API Key");
    } finally {
      setIsRevoking(false);
      setRevokeId(null);
    }
  };

  const closeRawKeyDialog = () => {
    setRawKey(null);
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight text-foreground">
          API keys
        </h1>
        <Button
          size="sm"
          variant="default"
          onClick={() => setIsCreateOpen(true)}
          className="px-4 text-sm font-medium cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create key
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : keys && keys.length > 0 ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 flex items-center border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            <div className="flex-1">Key</div>
            <div className="w-1/3">Created</div>
            <div className="w-10"></div>
          </div>
          <div className="divide-y divide-border/50">
            {keys.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        {item.name || "API Key"}
                      </span>
                      {item.scope === "all" ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        >
                          Full Access
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                        >
                          {item.scope === "read_stats"
                            ? "Read-only Stats"
                            : item.scope}
                        </Badge>
                      )}
                    </div>
                    <div className="font-mono text-xs tracking-widest text-muted-foreground/80 bg-background/50 px-2 py-1 rounded border inline-block w-fit">
                      {item.hint}
                    </div>
                  </div>
                </div>
                <div className="w-1/3 flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                  <span>
                    Created {formatDistanceToNow(new Date(item.createdAt))} ago
                  </span>
                  {item.lastUsedAt && (
                    <span className="text-[10px] text-muted-foreground/60">
                      Last used {formatDistanceToNow(new Date(item.lastUsedAt))}{" "}
                      ago
                    </span>
                  )}
                </div>
                <div className="w-10 flex justify-end items-center gap-2">
                  <Button
                    onClick={() => setLogsKeyId(item.id)}
                    className="h-9 w-9 sm:h-8 sm:w-8 cursor-pointer"
                    title="View Usage Logs"
                    variant="outline"
                    size="icon"
                  >
                    <Activity className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={isRevoking && revokeId === item.id}
                    onClick={() => setRevokeId(item.id)}
                    className="h-9 w-9 sm:h-8 sm:w-8 cursor-pointer"
                    variant="outline"
                    size="icon"
                  >
                    {isRevoking && revokeId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-16 flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-4 rounded-full border-2 border-muted/50">
            <Key
              className="h-10 w-10 text-muted-foreground/50"
              strokeWidth={1.5}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold">You do not have any API keys.</h2>
            <p className="text-xs text-muted-foreground">
              API keys allow you to access your data through api.umami.is.
            </p>
          </div>
        </div>
      )}

      {/* Usage Example Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-bold text-sm">How to use your API key</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Use the API key by passing it as a Bearer token in the `Authorization`
          header of your HTTP requests.
        </p>
        <div className="bg-muted p-4 rounded-md font-mono text-xs overflow-x-auto relative group">
          <button
            onClick={() =>
              copyToClipboard(
                'curl -H "Authorization: Bearer <YOUR_API_KEY>" "https://your-domain.com/api/v1/stats?websiteId=<WEBSITE_ID>"',
                "Example code",
              )
            }
            className="absolute top-2 right-2 p-1.5 bg-background shadow-sm border rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <code>
            curl -H "Authorization: Bearer &lt;YOUR_API_KEY&gt;" \<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"https://your-domain.com/api/v1/stats?websiteId=&lt;WEBSITE_ID&gt;&amp;range=last_30_days"
          </code>
        </div>
      </div>

      {/* Modals & Dialogs */}

      {/* 1. Create Key Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Assign a recognizable name to easily identify this key later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Key Name (optional)</Label>
              <Input
                id="name"
                placeholder="e.g. Zapier Integration"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scope">Access Scope</Label>
              <Select value={newKeyScope} onValueChange={setNewKeyScope}>
                <SelectTrigger id="scope">
                  <SelectValue placeholder="Select access scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span>Full Access (Read/Write)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="read_stats">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      <span>Read-only Analytics</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Show Raw Key Dialog (One time only) */}
      <Dialog open={!!rawKey} onOpenChange={closeRawKeyDialog}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Store your API key securely</DialogTitle>
            <DialogDescription className="flex items-start gap-2 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-md mt-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>
                Please save this secret key somewhere safe and accessible.{" "}
                <strong>
                  For security reasons, you won't be able to view it again.
                </strong>{" "}
                If you lose this secret key, you'll need to generate a new one.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Input
                id="rawKey"
                readOnly
                value={rawKey || ""}
                className="font-mono text-sm"
              />
            </div>
            <Button
              size="sm"
              className="px-3"
              onClick={() => copyToClipboard(rawKey || "", "API Key")}
            >
              <span className="sr-only">Copy</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <DialogFooter className="sm:justify-start mt-4">
            <Button type="button" variant="default" onClick={closeRawKeyDialog}>
              I have saved it safely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Revoke Confirmation */}
      <Dialog
        open={!!revokeId}
        onOpenChange={(open: boolean) => !open && setRevokeId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Any applications using this API key
              will immediately lose access and requests will fail.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isRevoking}
              onClick={() => setRevokeId(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                handleRevoke();
              }}
              disabled={isRevoking}
              variant="destructive"
            >
              {isRevoking ? "Revoking..." : "Revoke Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Logs Viewer Sheet */}
      <LogsSheet keyId={logsKeyId} onClose={() => setLogsKeyId(null)} />
    </div>
  );
}

function LogsSheet({ keyId, onClose }: { keyId: string | null; onClose: () => void }) {
  const { data: logs, isLoading } = useSWR<ApiKeyLog[]>(
    keyId ? `/api/account/keys/${keyId}/logs` : null,
    fetcher
  );

  return (
    <Sheet open={!!keyId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle>API Usage Logs</SheetTitle>
          <SheetDescription>
            Recent requests made using this API key.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4 px-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-primary uppercase">{log.method}</span>
                      <span className="text-muted-foreground truncate max-w-[180px]">{log.endpoint}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${log.status >= 200 && log.status < 300 ? 'bg-emerald-500' : 'bg-destructive'}`} />
                    <span className="font-mono font-bold">{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 text-muted-foreground">
              <Activity className="h-8 w-8 opacity-20" />
              <p className="text-xs">No activity recorded for this key yet.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

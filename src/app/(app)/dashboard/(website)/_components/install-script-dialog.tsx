"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InstallScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  websiteId: string;
  domain: string;
}

export default function InstallScriptDialog({
  open,
  onOpenChange,
  websiteId,
  domain,
}: InstallScriptDialogProps) {
  const scriptCode = `<script
  defer
  data-website-id='${websiteId}'
  data-domain='${domain}'
  src="${domain}/analytics.js">
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    toast.success("Script copied to clipboard!");
  };

  const handleComplete = () => {
    onOpenChange(false);
    toast.success("Great! Your website is now tracking analytics.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add the tracking script to your website
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Copy and paste the following script into the{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
              &lt;head&gt;
            </code>{" "}
            section of your website's HTML.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4">
          <div className="bg-[#1e1e1e] rounded-lg p-6 font-mono text-sm overflow-x-auto">
            <Button
              variant="secondary"
              size="icon"
              onClick={copyToClipboard}
              className="absolute top-4 right-4 h-9 w-9 bg-white hover:bg-white/90"
            >
              <Copy className="h-4 w-4 text-black" />
            </Button>
            <pre className="text-white">
              <code>
                <span className="text-[#569cd6]">&lt;script</span>
                {"\n  "}
                <span className="text-[#9cdcfe]">defer</span>
                {"\n  "}
                <span className="text-[#9cdcfe]">data-website-id</span>
                <span className="text-white">=</span>
                <span className="text-[#ce9178]">{`'${websiteId}'`}</span>
                {"\n  "}
                <span className="text-[#9cdcfe]">data-domain</span>
                <span className="text-white">=</span>
                <span className="text-[#ce9178]">{`'${domain}'`}</span>
                {"\n  "}
                <span className="text-[#9cdcfe]">src</span>
                <span className="text-white">=</span>
                <span className="text-[#ce9178]">{`"${domain}/analytics.js"`}</span>
                <span className="text-[#569cd6]">&gt;</span>
                {"\n"}
                <span className="text-[#569cd6]">&lt;/script&gt;</span>
              </code>
            </pre>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleComplete}
            className="w-full sm:w-auto px-8"
            size="lg"
          >
            Ok, I've installed the script
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

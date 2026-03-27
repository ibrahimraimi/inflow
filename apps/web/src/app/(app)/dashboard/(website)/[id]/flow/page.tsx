"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Activity, Info } from "lucide-react";

import { Button } from "@inflow/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@inflow/ui";
import { useWebsite } from "@/hooks/use-website";
import { useFlow } from "@/hooks/use-flow";
import { FlowDiagram } from "../../_components/flow-diagram";
import { Alert, AlertDescription, AlertTitle } from "@inflow/ui";

export default function FlowPage() {
  const params = useParams();
  const websiteId = params.id as string;
  const [dateRange, setDateRange] = useState("last_7_days");

  const { website, isLoading: websiteLoading } = useWebsite(websiteId);
  const { flow, isLoading: flowLoading, isValidating } = useFlow(websiteId, dateRange);

  if (websiteLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="lg:mt-8 mt-10 w-full text-center py-12">
        <p className="text-muted-foreground">Website not found</p>
        <Link href="/dashboard">
          <Button variant="link" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:mt-8 mt-10 space-y-8">
      <div className="border-b pb-6">
        <Link
          href={`/dashboard/${websiteId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Analytics</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Conversion Path</h1>
              <p className="text-sm text-muted-foreground font-medium">
                Visualize how users navigate through {website.websiteName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isValidating && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last_7_days">Last 7 days</SelectItem>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Alert variant="default" className="bg-muted/30 border-primary/10">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-xs font-bold uppercase tracking-widest opacity-70">How it works</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground pt-1">
          This diagram tracks the top sequences of pages and events per user session. The width of each connection represent how many users followed that specific transition.
        </AlertDescription>
      </Alert>

      {flowLoading && !flow ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground opacity-20" />
        </div>
      ) : (
        <FlowDiagram data={flow!} websiteId={websiteId} />
      )}
    </div>
  );
}

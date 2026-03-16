"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";

import { useWebsite } from "@/hooks/use-website";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFunnels } from "@/hooks/use-funnels";

export default function FunnelsListPage() {
  const params = useParams();
  const websiteId = params.id as string;
  const router = useRouter();

  const {
    website,
    isLoading: websiteLoading,
  } = useWebsite(websiteId);

  const {
    funnels,
    isLoading: funnelsLoading,
    deleteFunnel,
  } = useFunnels(websiteId);

  if (websiteLoading || funnelsLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="lg:mt-8 mt-10 w-full text-center py-12">
        <p className="text-muted-foreground">Website not found</p>
        <Link href="/dashboard">
          <Button variant="link" className="mt-4">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:mt-8 mt-10 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-10">
        <div>
          <Link
            href={`/dashboard/${websiteId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Website</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">
            Conversion Funnels
          </h1>
          <p className="text-muted-foreground">
            Analyze drop-off rates across key user journeys.
          </p>
        </div>

        <div className="bg-foreground/10 rounded-[calc(var(--radius-lg)+0.125rem)] border p-0.5">
          <Link href={`/dashboard/${websiteId}/funnels/new`}>
            <Button
              size="default"
              className="rounded-lg px-4 text-sm font-medium cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="text-nowrap">Create Funnel</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {funnels?.map((funnel) => (
          <Card
            key={funnel.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() =>
              router.push(`/dashboard/${websiteId}/funnels/${funnel.id}`)
            }
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{funnel.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 -mt-2 -mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm("Are you sure you want to delete this funnel?")
                    ) {
                      deleteFunnel(funnel.id.toString());
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {Array.isArray(funnel.steps) ? funnel.steps.length : 0} steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Created on {new Date(funnel.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}

        {!funnels?.length && (
          <div className="col-span-full p-12 text-center w-full rounded-xl border bg-card text-card-foreground shadow-sm border-dashed">
            <h3 className="text-lg font-medium mb-2 text-foreground">
              No funnels found
            </h3>
            <p className="mb-6">
              Create a funnel to start tracking conversion rates across your
              website.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/${websiteId}/funnels/new`)}
            >
              Create your first funnel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

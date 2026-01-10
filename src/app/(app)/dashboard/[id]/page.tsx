"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import axios from "axios";
import { ArrowLeft, Loader2, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WebsiteType } from "@/configs/types";

export default function WebsiteDetailPage() {
  const params = useParams();
  const websiteId = params.id as string;

  const [website, setWebsite] = useState<WebsiteType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const response = await axios.get(`/api/website/${websiteId}`);
        setWebsite(response.data);
      } catch (error) {
        console.error("Error fetching website:", error);
      } finally {
        setLoading(false);
      }
    };

    if (websiteId) {
      fetchWebsite();
    }
  }, [websiteId]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="lg:mt-8 mt-20 w-full">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Website not found</p>
          <Link href="/dashboard">
            <Button variant="link" className="mt-4">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
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

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
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

          <Link href={`/dashboard/${websiteId}/edit`}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Analytics content will go here */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <p className="text-muted-foreground text-center py-12">
            Analytics dashboard coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

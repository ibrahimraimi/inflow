"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import axios from "axios";
import {
  PlusIcon,
  Search,
  Copy,
  ExternalLink,
  MoreVertical,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface LinkType {
  id: string;
  linkId: string;
  name: string;
  shortCode: string;
  destinationUrl: string;
  createdAt: string;
}

export default function LinksPage() {
  const [linkList, setLinkList] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const GetUserLinks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await axios.get("/api/links");
      setLinkList(result.data);
    } catch (error) {
      toast.error("Failed to load links");
      console.error("Error loading links:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    GetUserLinks();
  }, [GetUserLinks]);

  const filteredLinks = linkList.filter(
    (link) =>
      link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.destinationUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="lg:mt-8 mt-20 w-full">
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <h1 className="font-bold text-xl lg:text-4xl tracking-tight">Links</h1>
        <div className="bg-foreground/10 rounded-[calc(var(--radius-lg)+0.125rem)] border p-0.5">
          <Link href="/dashboard/links/new">
            <Button
              size="default"
              className="rounded-lg px-4 text-sm font-medium cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="text-nowrap">Add link</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full rounded-xl border bg-card text-card-foreground shadow-sm border-dashed">
        <div className="p-6">
          <div className="relative max-w-sm mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/40 border-border/40 h-10 text-sm"
            />
          </div>

          <div className="w-full">
            <div className="flex items-center mb-4 px-2 text-xs font-bold text-muted-foreground tracking-wide uppercase">
              <div className="w-1/4 min-w-37.5">Name</div>
              <div className="w-1/4 min-w-37.5">Link</div>
              <div className="flex-1 min-w-50">Destination URL</div>
              <div className="w-30">Created</div>
              <div className="w-30 ml-auto sr-only">Actions</div>
            </div>

            <div className="divide-y divide-border/40 border-t border-border/40">
              {loading ? (
                // biome-ignore lint/complexity/noUselessFragments: false positive
                <>
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 px-2 py-4"
                    >
                      <Skeleton className="h-4 w-1/4 min-w-37.7" />
                      <Skeleton className="h-4 w-1/4 min-w-37.7" />
                      <Skeleton className="h-4 flex-1 min-w-50" />
                      <Skeleton className="h-4 w-30" />
                      <Skeleton className="h-8 w-8 rounded ml-auto" />
                    </div>
                  ))}
                </>
              ) : filteredLinks.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  {searchQuery
                    ? "No links found"
                    : "No links yet. Create your first link!"}
                </div>
              ) : (
                // biome-ignore lint/complexity/noUselessFragments: false positive
                <>
                  {filteredLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-4 px-2 py-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="w-1/4 min-w-37.5">
                        <span className="font-medium text-sm text-foreground truncate block">
                          {link.name}
                        </span>
                      </div>

                      <div className="w-1/4 min-w-37.5 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground font-mono truncate">
                          /{link.shortCode}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/${link.shortCode}`
                            )
                          }
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex-1 min-w-50 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground truncate">
                          {link.destinationUrl}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(link.destinationUrl, "_blank")
                          }
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="w-30">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(link.createdAt)}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          toast.info("Link actions coming soon!");
                        }}
                        className="h-8 w-8 text-muted-foreground opacity-70 hover:opacity-100 hover:text-foreground hover:bg-muted ml-auto"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

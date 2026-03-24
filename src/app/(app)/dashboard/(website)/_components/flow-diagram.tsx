"use client";

import { useState } from "react";
import { Sankey, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, ArrowRight, Users, Play } from "lucide-react";
import type { FlowData } from "@/configs/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SessionList } from "./session-list";
import { SessionReplayViewer } from "./session-replay-viewer";

const COLORS = {
  page: "#6366f1", // Indigo
  event: "#ec4899", // Pink
  other: "#94a3b8", // Slate
};

const CustomNode = (props: any) => {
  const { x, y, width, height, payload, containerWidth } = props;
  if (!payload) return null;

  const isRightSide = x > containerWidth * 0.7;
  const displayName = payload.name;
  const nodeColor = payload.type === "event" ? COLORS.event : COLORS.page;
  const fill = payload.name === "Other" ? COLORS.other : nodeColor;

  return (
    <g className="cursor-pointer group">
      <rect
        x={x}
        y={y}
        width={width}
        height={Math.max(height, 10)}
        fill={fill}
        fillOpacity={0.85}
        rx={2}
        className="group-hover:fill-opacity-100 transition-all duration-200"
      />
      <text
        x={isRightSide ? x - 8 : x + width + 8}
        y={y + height / 2}
        textAnchor={isRightSide ? "end" : "start"}
        dominantBaseline="central"
        fontSize="10"
        fontWeight="bold"
        fill="currentColor"
        className="fill-foreground/90 transition-all pointer-events-none"
      >
        {displayName}
      </text>
    </g>
  );
};

const CustomLink = (props: any) => {
  const { sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, payload } = props;
  if (!payload || linkWidth < 0.5) return null;

  const strokeColor = payload.type === "event" ? COLORS.event : COLORS.page;

  return (
    <path
      d={`
        M${sourceX},${sourceY}
        C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
      `}
      fill="none"
      stroke={strokeColor}
      strokeWidth={Math.max(linkWidth, 2)}
      strokeOpacity={0.35}
      className="hover:stroke-opacity-70 transition-all duration-300 cursor-pointer"
    />
  );
};

export function FlowDiagram({ data, websiteId }: { data: FlowData; websiteId: string }) {
  const [selectedNode, setSelectedNode] = useState<{ name: string; type: string } | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  if (!data || data.nodes.length === 0) {
    return (
      <Card className="rounded-lg border bg-card">
        <CardContent className="flex h-[400px] items-center justify-center text-muted-foreground p-12">
          <div className="text-center space-y-3">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto opacity-20">
              <Activity className="size-6" />
            </div>
            <p className="text-sm font-semibold">No flow data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const nodes = data.nodes.map((node) => ({ 
    name: node.name,
    type: node.type,
    step: node.step 
  }));
  
  const links = data.links.map((link) => {
    const sourceIndex = data.nodes.findIndex((n) => n.id === link.source);
    const targetIndex = data.nodes.findIndex((n) => n.id === link.target);
    return {
      source: sourceIndex,
      target: targetIndex,
      value: link.value,
      type: link.type,
    };
  });

  const validLinks = links.filter((l) => l.source !== -1 && l.target !== -1 && l.value > 0);

  const handleNodeClick = (node: any) => {
    if (node && node.name !== "Other") {
      setSelectedNode({ name: node.name, type: node.type });
      setIsSheetOpen(true);
    }
  };

  return (
    <>
      <Card className="w-full rounded-lg border shadow-none bg-card overflow-hidden">
        <CardHeader className="pb-2 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-[11px] font-bold opacity-70 uppercase tracking-widest flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
              Path Analysis Flow
            </CardTitle>
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary italic">
                Tip: Click a page or action to view replays
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 py-0">
          <div className="h-[390px] w-full px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={{ nodes, links: validLinks }}
                margin={{ top: 20, bottom: 20, left: 10, right: 180 }}
                node={<CustomNode />}
                link={<CustomLink />}
                nodePadding={40}
                nodeWidth={10}
                onClick={(e: any) => e && e.payload && handleNodeClick(e.payload)}
              >
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      if (d.source && d.target) {
                        return (
                          <div className="rounded-lg border bg-background/95 backdrop-blur-md p-4 shadow-2xl text-xs min-w-[240px] border-primary/20 ring-1 ring-black/5">
                            <div className="flex flex-col gap-3">
                              <div className="space-y-1">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">From</p>
                                <p className="font-bold text-sm tracking-tight text-foreground truncate max-w-[200px]">{d.source.name}</p>
                              </div>
                              <div className="flex items-center gap-2 text-primary/40">
                                 <ArrowRight className="size-3" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">To</p>
                                <p className="font-bold text-sm tracking-tight text-foreground truncate max-w-[200px]">{d.target.name}</p>
                              </div>
                              <div className="mt-2 pt-2 border-t border-border/50 flex justify-between items-end">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">Volume</span>
                                <div className="flex items-baseline gap-1">
                                  <span className="font-mono font-black text-primary text-xl leading-none">{d.value}</span>
                                  <span className="text-[10px] text-muted-foreground font-bold">sessions</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="rounded-xl border bg-background/95 backdrop-blur-md p-3 shadow-2xl text-xs border-primary/10">
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1.5 border-b pb-1">
                            {d.type === "event" ? "Action Event" : "Page Path"}
                          </p>
                          <p className="font-bold text-sm mb-1 truncate max-w-[220px]">{d.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                            <div className="px-1.5 py-0.5 bg-muted rounded">Step {d.step}</div>
                            <div className="flex items-center gap-1">
                               <Users className="size-3" />
                               <span>{payload[0].value} users</span>
                            </div>
                          </div>
                          <div className="mt-2 text-[9px] text-primary font-bold uppercase">Click to view replays</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Sankey>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="flex items-center gap-2">
                <Play className="size-4 text-primary" />
                Session Replays
            </SheetTitle>
            <SheetDescription className="truncate font-medium text-foreground">
              Sessions that visited: {selectedNode?.name}
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            {selectedNode && (
              <SessionList
                websiteId={websiteId}
                path={selectedNode.name}
                onSelectSession={(id) => {
                  setActiveSessionId(id);
                  setIsSheetOpen(false);
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {activeSessionId && (
        <SessionReplayViewer
          websiteId={websiteId}
          sessionId={activeSessionId}
          onClose={() => setActiveSessionId(null)}
        />
      )}
    </>
  );
}

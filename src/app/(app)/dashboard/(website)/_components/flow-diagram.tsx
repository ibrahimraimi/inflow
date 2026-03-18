"use client";

import { Sankey, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, ArrowRight, Users } from "lucide-react";
import type { FlowData } from "@/configs/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  flow: {
    label: "User Flow",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;





const COLORS = {
  page: "#6366f1", // Indigo
  event: "#ec4899", // Pink
  other: "#94a3b8", // Slate
};

const CustomNode = (props: any) => {
  const { x, y, width, height, index, payload, containerWidth } = props;
  
  // If we are in the last 30% of the chart, flip label to the left
  const isRightSide = x > containerWidth * 0.7;
  
  // Do not truncate, let the margins handle the space
  const displayName = payload.name;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.name === "Other" ? COLORS.other : (payload.type === "event" ? COLORS.event : COLORS.page)}
        fillOpacity="0.9"
        rx={3}
      />
      <text
        x={isRightSide ? x - 12 : x + width + 12}
        y={y + height / 2}
        textAnchor={isRightSide ? "end" : "start"}
        dominantBaseline="central"
        fontSize="11"
        fontWeight="600"
        fill="currentColor"
        className="fill-foreground/90 transition-all"
      >
        {displayName}
      </text>
    </g>
  );
};

const CustomLink = (props: any) => {
  const { sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, payload } = props;

  if (linkWidth < 1) return null;

  return (
    <path
      d={`
        M${sourceX},${sourceY}
        C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
      `}
      fill="none"
      stroke={payload.type === "event" ? COLORS.event : COLORS.page}
      strokeWidth={linkWidth}
      strokeOpacity="0.12"
      className="hover:stroke-opacity-40 transition-all duration-300 cursor-pointer"
    />
  );
};

export function FlowDiagram({ data }: { data: FlowData }) {
  if (!data || data.nodes.length === 0) {
    return (
      <Card className="rounded-lg border bg-card">
        <CardContent className="flex h-[400px] items-center justify-center text-muted-foreground p-12">
          <div className="text-center space-y-3">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto opacity-20">
              <Activity className="size-6" />
            </div>
            <p className="text-sm font-semibold">No flow data available</p>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              Try a broader date range or verify if your website is receiving traffic.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Recharts Sankey requires indices for source/target
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

  if (nodes.length === 0 || validLinks.length === 0) {
    return (
      <Card className="rounded-lg border bg-card">
        <CardContent className="flex h-[400px] items-center justify-center text-muted-foreground p-12 text-center">
          <p className="text-sm font-medium">Insufficient journey data to build a flow diagram. This typically occurs when users only visit one page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full rounded-lg border shadow-none bg-card overflow-hidden">
      <CardHeader className="pb-2 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-[11px] font-bold opacity-70 uppercase tracking-widest flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
            Path Analysis Flow
          </CardTitle>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-sm" style={{ backgroundColor: COLORS.page }} />
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase">Path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-sm" style={{ backgroundColor: COLORS.event }} />
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase">Event</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 py-0">
        <div className="h-[280px] w-full px-2">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={{ nodes, links: validLinks }}
              margin={{ top: 20, bottom: 20, left: 10, right: 350 }}
              node={<CustomNode />}
              link={<CustomLink />}
              nodePadding={60}
              nodeWidth={12}
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
                              <p className="font-bold text-sm tracking-tight text-foreground truncate max-w-[200px]" title={d.source.name}>{d.source.name}</p>
                            </div>
                            <div className="flex items-center gap-2 text-primary/40">
                               <div className="h-px grow bg-current" />
                               <ArrowRight className="size-3" />
                               <div className="h-px grow bg-current" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">To</p>
                              <p className="font-bold text-sm tracking-tight text-foreground truncate max-w-[200px]" title={d.target.name}>{d.target.name}</p>
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
                        <p className="font-bold text-sm mb-1 truncate max-w-[220px]" title={d.name}>{d.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                          <div className="px-1.5 py-0.5 bg-muted rounded">Step {d.step}</div>
                          <div className="flex items-center gap-1">
                             <Users className="size-3" />
                             <span>{payload[0].value} users</span>
                          </div>
                        </div>
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
  );
}

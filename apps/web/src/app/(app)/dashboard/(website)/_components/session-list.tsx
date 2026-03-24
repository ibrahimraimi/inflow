"use client";

import { useState, useEffect } from "react";
import { Play, Calendar, User, Loader2, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface Session {
  sessionId: string;
  clientId: string;
  createdAt: string;
  eventCount: number;
}

interface SessionListProps {
  websiteId: string;
  path: string;
  onSelectSession: (sessionId: string) => void;
}

export function SessionList({
  websiteId,
  path,
  onSelectSession,
}: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      try {
        const res = await fetch(`/api/website/${websiteId}/replays?path=${encodeURIComponent(path)}`);
        const data = await res.json();
        if (data.success) {
          setSessions(data.sessions);
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [websiteId, path]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading sessions for {path}...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-2">
        <div className="size-10 rounded-full bg-muted flex items-center justify-center opacity-40">
            <User className="size-5" />
        </div>
        <p className="text-sm font-semibold">No replays found</p>
        <p className="text-xs text-muted-foreground">We couldn't find any recorded sessions for this specific path in the selected period.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.sessionId}
            className="group flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/30 transition-all cursor-pointer"
            onClick={() => onSelectSession(session.sessionId)}
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Play className="size-4 ml-0.5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold tracking-tight">
                        Session {session.sessionId.slice(0, 8)}
                    </p>
                    <div className="h-1 w-1 rounded-full bg-zinc-400" />
                    <span className="text-[10px] text-muted-foreground font-medium">
                        {session.eventCount} interactions
                    </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    ID: {session.clientId.slice(0, 6)}
                  </span>
                </div>
              </div>
            </div>
            
            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                Replay
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

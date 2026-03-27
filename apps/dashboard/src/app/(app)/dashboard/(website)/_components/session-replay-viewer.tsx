"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, X, Loader2, MousePointer2 } from "lucide-react";
import { Button } from "@inflow/ui";
import { Slider } from "@inflow/ui";
import { Badge } from "@inflow/ui";

interface ReplayEvent {
  type: "click" | "scroll" | "nav" | "input";
  timestamp: number;
  url?: string;
  x?: number;
  y?: number;
  target?: string;
  path?: string;
  value?: string;
}

interface SessionReplayViewerProps {
  websiteId: string;
  sessionId: string;
  onClose: () => void;
}

export function SessionReplayViewer({
  websiteId,
  sessionId,
  onClose,
}: SessionReplayViewerProps) {
  const [events, setEvents] = useState<ReplayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`/api/website/${websiteId}/replays/${sessionId}`);
        const data = await res.json();
        if (data.success && data.events.length > 0) {
          const sortedEvents = data.events.sort((a: any, b: any) => a.timestamp - b.timestamp);
          setEvents(sortedEvents);
          setDuration(sortedEvents[sortedEvents.length - 1].timestamp - sortedEvents[0].timestamp);
          setCurrentUrl(sortedEvents[0].url || "");
        }
      } catch (error) {
        console.error("Failed to fetch replay events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [websiteId, sessionId]);

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - currentTime;
      timerRef.current = setInterval(() => {
        const nextTime = Date.now() - startTime;
        if (nextTime >= duration) {
          setIsPlaying(false);
          setCurrentTime(duration);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setCurrentTime(nextTime);
        }
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration]);

  // Sync state with current time
  useEffect(() => {
    if (events.length === 0) return;
    
    const baseTimestamp = events[0].timestamp;
    const targetTimestamp = baseTimestamp + currentTime;
    
    // Find the latest events up to targetTimestamp
    let latestClick: ReplayEvent | null = null;
    let latestScroll: ReplayEvent | null = null;
    let latestNav: ReplayEvent | null = null;
    
    for (let i = 0; i < events.length; i++) {
        const e = events[i];
        if (e.timestamp > targetTimestamp) break;
        
        if (e.type === "click") latestClick = e;
        if (e.type === "scroll") latestScroll = e;
        if (e.type === "nav") latestNav = e;
    }
    
    if (latestClick && latestClick.x !== undefined && latestClick.y !== undefined) {
        setCursorPos({ x: latestClick.x, y: latestClick.y });
    }
    if (latestScroll && latestScroll.y !== undefined) {
        setScrollPos(latestScroll.y);
    }
    if (latestNav && latestNav.url) {
        setCurrentUrl(latestNav.url);
    }
  }, [currentTime, events]);

  const handleTogglePlay = () => setIsPlaying(!isPlaying);
  
  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-4">
          <Badge variant="outline">Session: {sessionId.slice(0, 8)}</Badge>
          <div className="text-sm font-medium border-l pl-4 truncate max-w-md">
            URL: {currentUrl}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Viewport/Playback Area */}
      <div className="flex-1 overflow-hidden relative bg-muted/30">
        <div 
            className="absolute inset-0 bg-background border shadow-2xl mx-auto my-8 max-w-5xl rounded-lg overflow-hidden transition-all duration-300"
            style={{ 
                transform: `translateY(-${scrollPos}px)`,
                height: '2000px' // Mock tall page
            }}
        >
            {/* Mock Page Content */}
            <div className="p-12 space-y-8">
                <h1 className="text-4xl font-bold">Replaying: {currentUrl}</h1>
                <div className="h-64 bg-muted rounded-xl border-2 border-dashed flex items-center justify-center text-muted-foreground">
                    [ Site Content Placeholder ]
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-40 bg-card rounded-lg border shadow-sm p-4">
                            Item {i}
                        </div>
                    ))}
                </div>
            </div>

            {/* Cursor Overlay */}
            <div 
                className="absolute pointer-events-none transition-all duration-150 z-50"
                style={{ 
                    left: cursorPos.x, 
                    top: cursorPos.y,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <div className="relative">
                    <MousePointer2 className="h-6 w-6 text-primary fill-primary drop-shadow-md" />
                    {/* Click indicator pulse */}
                    <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping" />
                </div>
            </div>
        </div>
        
        {/* Navigation Indicator Overlay */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-card/90 backdrop-blur rounded-full border shadow-lg text-xs font-semibold z-50">
            Navigation Active: {currentUrl}
        </div>
      </div>

      {/* Controls */}
      <div className="h-24 border-t bg-card px-8 flex items-center gap-8">
        <Button variant="outline" size="icon" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button 
            variant="default" 
            size="icon" 
            className="h-12 w-12 rounded-full"
            onClick={handleTogglePlay}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
        </Button>

        <div className="flex-1 flex flex-col gap-2">
            <Slider
                value={[currentTime]}
                max={duration}
                step={100}
                onValueChange={([val]) => setCurrentTime(val)}
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground tabular-nums">
                <span>{(currentTime / 1000).toFixed(1)}s</span>
                <span>{(duration / 1000).toFixed(1)}s</span>
            </div>
        </div>
      </div>
    </div>
  );
}

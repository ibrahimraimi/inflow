export interface InflowConfig {
  apiKey: string;
  endpoint?: string;
  debug?: boolean;
  autoTrack?: boolean;
}

export interface TrackOptions {
  props?: Record<string, any>;
}

export interface InflowEvent {
  type: "entry" | "exit" | "ping" | "event";
  eventName?: string;
  clientId: string;
  url: string;
  domain: string;
  referrer?: string;
  properties?: Record<string, any>;
  timestamp: string;
  pageViewId?: number;
}

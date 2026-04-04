export interface InflowConfig {
  websiteId?: string;
  domain?: string;
  apiUrl?: string;
  debug?: boolean;
  autoTrack?: boolean;
}

export type EventType = "entry" | "exit" | "ping" | "event" | "rage_click";

export interface InflowEvent {
  type: EventType;
  websiteId: string;
  domain?: string;
  clientId: string;
  sessionId?: string;
  url: string;
  referrer?: string;
  entryTime?: string;
  exitTime?: string;
  totalActiveTime?: number;
  pageViewId?: number;
  eventName?: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  refParams?: string;
  exitUrl?: string;
}

export interface ReplayEvent {
  type: "click" | "scroll" | "nav";
  timestamp: number;
  url: string;
  x?: number;
  y?: number;
  target?: string;
  path?: string;
}

export interface ReplayPayload {
  websiteId: string;
  clientId: string;
  sessionId: string;
  events: ReplayEvent[];
}

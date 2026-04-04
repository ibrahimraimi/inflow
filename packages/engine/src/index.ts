import { InflowConfig, InflowEvent, ReplayEvent, ReplayPayload } from "./types";
import { generateUUID, getElementPath } from "./utils";

class InflowEngine {
  private websiteId: string = "";
  private domain: string = "";
  private apiUrl: string = process.env.NEXT_PUBLIC_API_URL || "";
  private debug: boolean = false;
  private clientId: string = "";
  private sessionId: string = "";
  private pageViewId: number | null = null;
  private initialized: boolean = false;
  private startTime: number = Date.now();
  private replayEvents: ReplayEvent[] = [];
  private batchSize: number = 20;
  private batchInterval: number = 5000;
  private sessionDuration: number = 12 * 60 * 60 * 1000; // 12 hours

  constructor() {
    if (typeof window !== "undefined") {
      this.initSession();
    }
  }

  public init(config: InflowConfig): void {
    if (this.initialized) return;

    this.websiteId = config.websiteId || "";
    this.domain = config.domain || (typeof window !== "undefined" ? window.location.hostname : "");
    this.apiUrl = config.apiUrl || this.apiUrl;
    this.debug = !!config.debug;
    this.initialized = true;

    this.log("Initialized with websiteId:", this.websiteId);

    if (config.autoTrack !== false && typeof window !== "undefined") {
      this.trackPageView();
      this.setupListeners();
      this.setupHeartbeat();
      this.setupSessionReplay();
      this.setupSpaTracking();
      this.setupBeforeUnload();
    }
  }

  private initSession(): void {
    const currentTime = Date.now();
    try {
      this.clientId = localStorage.getItem("inflow_client_id") || "";
      const sessionTimeStr = localStorage.getItem("inflow_session_time");
      const sessionTime = sessionTimeStr ? parseInt(sessionTimeStr, 10) : 0;
      this.sessionId = sessionStorage.getItem("inflow_session_id") || "";

      if (!this.clientId || currentTime - sessionTime > this.sessionDuration) {
        this.clientId = generateUUID();
        localStorage.setItem("inflow_client_id", this.clientId);
        localStorage.setItem("inflow_session_time", currentTime.toString());
      }

      if (!this.sessionId) {
        this.sessionId = generateUUID();
        sessionStorage.setItem("inflow_session_id", this.sessionId);
      }
    } catch (e) {
      this.clientId = this.clientId || "anonymous";
      this.sessionId = this.sessionId || generateUUID();
    }
  }

  public track(eventName: string, properties: Record<string, unknown> = {}): void {
    const event: InflowEvent = {
      type: "event",
      websiteId: this.websiteId,
      domain: this.domain,
      clientId: this.clientId,
      eventName,
      properties,
      url: typeof window !== "undefined" ? window.location.href : "",
      timestamp: Date.now(),
    };

    this.send("/api/track", event);
  }

  public identify(userId: string, traits: Record<string, unknown> = {}): void {
    this.track("identify", { userId, ...traits });
  }

  private trackPageView(): void {
    if (typeof window === "undefined") return;

    const urlParams = new URL(window.location.href).searchParams;
    const event: InflowEvent = {
      type: "entry",
      websiteId: this.websiteId,
      domain: this.domain,
      clientId: this.clientId,
      url: window.location.href,
      referrer: document.referrer || "Direct",
      entryTime: new Date().toISOString(),
      utmSource: urlParams.get("utm_source") || "",
      utmMedium: urlParams.get("utm_medium") || "",
      utmCampaign: urlParams.get("utm_campaign") || "",
      utmTerm: urlParams.get("utm_term") || "",
      utmContent: urlParams.get("utm_content") || "",
      refParams: window.location.search || "",
    };

    this.send("/api/track", event).then((res) => {
      if (res?.data && res.data[0]) {
        this.pageViewId = res.data[0].id;
      }
    });
  }

  private async send(path: string, payload: unknown): Promise<any> {
    try {
      this.log(`Sending to ${path}:`, payload);
      const response = await fetch(`${this.apiUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (e) {
      this.error(`Failed to send to ${path}`, e);
    }
  }

  private setupListeners(): void {
    if (typeof window === "undefined") return;

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      this.recordReplayEvent({
        type: "click",
        x: e.clientX,
        y: e.clientY,
        target: target.tagName.toLowerCase(),
        path: getElementPath(target),
      });
      this.checkRageClick(e);
    });

    // Scroll tracking
    let lastScrollTime = 0;
    window.addEventListener("scroll", () => {
      const now = Date.now();
      if (now - lastScrollTime > 200) {
        this.recordReplayEvent({
          type: "scroll",
          y: window.scrollY,
        });
        lastScrollTime = now;
      }
    });
  }

  private setupHeartbeat(): void {
    setInterval(() => {
      if (!this.pageViewId || typeof window === "undefined") return;
      const totalActiveTime = Math.floor((Date.now() - this.startTime) / 1000);
      const pingData: InflowEvent = {
        type: "ping",
        websiteId: this.websiteId,
        clientId: this.clientId,
        domain: this.domain,
        totalActiveTime,
        pageViewId: this.pageViewId,
        url: window.location.href,
      };
      this.send("/api/track", pingData);
    }, 10000);
  }

  private setupSessionReplay(): void {
    setInterval(() => this.flushReplayEvents(), this.batchInterval);
  }

  private recordReplayEvent(event: Omit<ReplayEvent, "timestamp" | "url">): void {
    if (typeof window === "undefined") return;
    this.replayEvents.push({
      ...event,
      timestamp: Date.now(),
      url: window.location.pathname,
    } as ReplayEvent);

    if (this.replayEvents.length >= this.batchSize) {
      this.flushReplayEvents();
    }
  }

  private flushReplayEvents(): void {
    if (this.replayEvents.length === 0) return;

    const payload: ReplayPayload = {
      websiteId: this.websiteId,
      clientId: this.clientId,
      sessionId: this.sessionId,
      events: this.replayEvents,
    };

    this.send("/api/track/replay", payload);
    this.replayEvents = [];
  }

  private clickHistory: { time: number; x: number; y: number; target: HTMLElement }[] = [];
  private reportedRageClicks = new Map<string, number>();

  private checkRageClick(e: MouseEvent): void {
    const now = Date.now();
    const x = e.clientX;
    const y = e.clientY;
    const target = e.target as HTMLElement;

    this.clickHistory = this.clickHistory.filter((c) => now - c.time < 2000);
    this.clickHistory.push({ time: now, x, y, target });

    if (this.clickHistory.length >= 3) {
      const recentClicks = this.clickHistory.slice(-3);
      const isRageClick = recentClicks.every((c) => {
        const dx = c.x - x;
        const dy = c.y - y;
        return dx * dx + dy * dy <= 900; // 30px radius
      });

      if (isRageClick) {
        const path = getElementPath(target);
        const lastReported = this.reportedRageClicks.get(path) || 0;

        if (now - lastReported > 3000) {
          this.reportedRageClicks.set(path, now);
          this.track("rage_click", {
            element: path,
            text: (target.innerText || "").substring(0, 50).trim() || target.nodeName.toLowerCase(),
            url: window.location.pathname + window.location.search,
            clickCount: this.clickHistory.length,
          });
          this.clickHistory = [];
        }
      }
    }
  }

  private setupSpaTracking(): void {
    if (typeof window === "undefined") return;
    let lastUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== lastUrl) {
        this.recordReplayEvent({
          type: "nav",
        });
        this.trackPageView(); // Re-track page view on SPA nav
        lastUrl = window.location.href;
      }
    }, 1000);
  }

  private setupBeforeUnload(): void {
    if (typeof window === "undefined") return;
    window.addEventListener("beforeunload", () => {
      this.flushReplayEvents();
      const exitTime = new Date().toISOString();
      const totalActiveTime = Math.floor((Date.now() - this.startTime) / 1000);

      const exitData: InflowEvent = {
        type: "exit",
        websiteId: this.websiteId,
        domain: this.domain,
        exitTime,
        totalActiveTime,
        clientId: this.clientId,
        pageViewId: this.pageViewId || undefined,
        exitUrl: window.location.href,
        url: window.location.href,
      };

      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${this.apiUrl}/api/track`, JSON.stringify(exitData));
      } else {
        this.send("/api/track", exitData);
      }
    });
  }

  private log(...args: unknown[]): void {
    if (this.debug) console.log("[Inflow Engine]", ...args);
  }

  private error(...args: unknown[]): void {
    console.error("[Inflow Engine Error]", ...args);
  }
}

export const inflow = new InflowEngine();
export { InflowEngine };
export default inflow;

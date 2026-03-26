import { InflowConfig, InflowEvent, TrackOptions } from "./types";

class Inflow {
  private apiKey: string = "";
  private websiteId: string = "";
  private endpoint: string = "https://inflowanalytics.com/api/track"; // Default endpoint
  private debug: boolean = false;
  private clientId: string = "";
  private initialized: boolean = false;
  private queue: any[] = [];
  private batchTimeout: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.clientId = this.getOrCreateClientId();
    }
  }

  public init(config: InflowConfig): void {
    if (this.initialized) return;

    if (!config.apiKey || (!config.apiKey.startsWith("inflow_") && !config.apiKey.startsWith("inf_"))) {
      this.error("Invalid API key format. API key must start with 'inflow_'.");
      return;
    }

    if (!config.websiteId) {
      this.error("Website ID is required.");
      return;
    }

    this.apiKey = config.apiKey;
    this.websiteId = config.websiteId;
    if (config.endpoint) this.endpoint = config.endpoint;
    this.debug = !!config.debug;
    this.initialized = true;

    this.log("Initialized with API key:", this.apiKey);

    if (config.autoTrack !== false) {
      this.trackPageView();
      this.setupSpaTracking();
    }
  }

  public track(eventName: string, options?: TrackOptions): void {
    if (!this.initialized) {
      this.error("Inflow not initialized. Call inflow.init() first.");
      return;
    }

    const event: InflowEvent = {
      type: "event",
      websiteId: this.websiteId,
      eventName,
      clientId: this.clientId,
      url: window.location.href,
      domain: window.location.hostname,
      referrer: document.referrer,
      properties: options?.props,
      timestamp: new Date().toISOString(),
    };

    this.enqueue(event);
  }

  public identify(userId: string, traits?: Record<string, any>): void {
    this.track("identify", { props: { userId, ...traits } });
  }

  private trackPageView(): void {
    const event: InflowEvent = {
      type: "entry",
      websiteId: this.websiteId,
      clientId: this.clientId,
      url: window.location.href,
      domain: window.location.hostname,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    };

    this.enqueue(event);
  }

  private enqueue(event: any): void {
    this.queue.push(event);
    this.log("Event enqueued:", event);

    if (this.batchTimeout) clearTimeout(this.batchTimeout);
    
    // Batch events every 1 second or if queue gets large
    if (this.queue.length >= 10) {
      this.flush();
    } else {
      this.batchTimeout = setTimeout(() => this.flush(), 1000);
    }
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];
    this.batchTimeout = null;

    try {
      this.log("Flushing events:", eventsToSend);
      
      // Send batched payload as an array
      await this.send(eventsToSend);

    } catch (e) {
      this.error("Failed to flush events", e);
      // Re-queue on failure? (Optional offline support)
      this.queue = [...eventsToSend, ...this.queue];
    }
  }

  private async send(payload: any): Promise<void> {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.error(`Tracking request failed with status ${response.status}`, errorData);
      }
    } catch (e) {
      this.error("Network error during tracking", e);
      throw e;
    }
  }

  private setupSpaTracking(): void {
    if (typeof window === "undefined") return;

    const handleRouteChange = () => {
      this.log("Route changed, tracking page view");
      this.trackPageView();
    };

    // PushState / ReplaceState hijacking
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleRouteChange();
    };

    window.addEventListener("popstate", handleRouteChange);
  }

  private getOrCreateClientId(): string {
    const key = "inflow_client_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = this.generateId();
      localStorage.setItem(key, id);
    }
    return id;
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private log(...args: any[]): void {
    if (this.debug) {
      console.log("[Inflow]", ...args);
    }
  }

  private error(...args: any[]): void {
    console.error("[Inflow Error]", ...args);
  }
}

const inflow = new Inflow();

// Support for script tag
if (typeof window !== "undefined") {
  (window as any).inflow = inflow;
}

export default inflow;
export { Inflow };

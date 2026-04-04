import { inflow as engine } from "@inflow/engine";
import { InflowConfig, TrackOptions } from "./types";

class Inflow {
  private initialized: boolean = false;

  public init(config: InflowConfig): void {
    if (this.initialized) return;

    if (!config.apiKey && !config.websiteId) {
      console.error("[Inflow] API key or Website ID is required.");
      return;
    }

    engine.init({
      websiteId: config.websiteId || config.apiKey, // Map apiKey to websiteId if needed
      apiUrl: config.endpoint,
      debug: config.debug,
      autoTrack: config.autoTrack,
    });

    this.initialized = true;
  }

  public track(eventName: string, options?: TrackOptions): void {
    engine.track(eventName, options?.props);
  }

  public identify(userId: string, traits?: Record<string, unknown>): void {
    engine.identify(userId, traits || {});
  }
}

const inflow = new Inflow();

if (typeof window !== "undefined") {
  (window as unknown as { inflow: typeof inflow }).inflow = inflow;
}

export default inflow;
export { Inflow };

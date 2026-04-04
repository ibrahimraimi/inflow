import { inflow } from "./index";

(function () {
  if (typeof document === "undefined") return;

  const script = document.currentScript as HTMLScriptElement;
  if (!script) return;

  const websiteId = script.getAttribute("data-website-id");
  const domain = script.getAttribute("data-domain") || undefined;
  const apiUrl = script.getAttribute("data-api-url") || new URL(script.src).origin;
  const debug = script.getAttribute("data-debug") === "true";
  const autoTrack = script.getAttribute("data-auto-track") !== "false";

  if (!websiteId) {
    console.error("[Inflow] Missing data-website-id in script tag.");
    return;
  }

  inflow.init({
    websiteId,
    domain,
    apiUrl,
    debug,
    autoTrack,
  });

  // Expose to window for custom tracking
  (window as unknown as { inflow: typeof inflow }).inflow = inflow;
})();

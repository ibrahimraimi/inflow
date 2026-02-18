// biome-ignore lint/complexity/useArrowFunction: false positive
(function () {
  function generateUUID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  const script = document.currentScript;
  const websiteId = script.getAttribute("data-website-id");
  const domain = script.getAttribute("data-domain");
  
  // Dynamically resolve API URL based on script src
  const scriptSrc = script.getAttribute("src");
  const apiUrl = scriptSrc ? new URL(scriptSrc).origin : "https://inflow.ibrahimraimi.com";

  // Session Duration
  const sessionDuration = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  const currentTime = Date.now();
  
  let clientId = null;
  let sessionTime = null;

  try {
    clientId = localStorage.getItem("inflow_client_id");
    sessionTime = localStorage.getItem("inflow_session_time");

    if (!clientId || currentTime - sessionTime > sessionDuration) {
      if (clientId) {
        localStorage.removeItem("inflow_client_id"); // Fixed typo
        localStorage.removeItem("inflow_session_time");
      }

      clientId = generateUUID();
      localStorage.setItem("inflow_client_id", clientId);
      localStorage.setItem("inflow_session_time", currentTime);
    }
  } catch (e) {
    // Fallback for private browsing / blocked localStorage
    clientId = clientId || "anonymous";
  }

  const entryTime = new Date().toISOString();
  const referrer = document.referrer || "Direct";

  // Get UTM Source from URL
  const urlParams = new URL(window.location.href).searchParams;
  const utmSource = urlParams.get("utm_source") || "";
  const utmMedium = urlParams.get("utm_medium") || "";
  const utmCampaign = urlParams.get("utm_campaign") || "";
  const utmTerm = urlParams.get("utm_term") || "";
  const utmContent = urlParams.get("utm_content") || "";
  const refParams = window.location.search || "";

  const data = {
    type: "entry",
    websiteId,
    domain,
    entryTime: entryTime,
    referrer: referrer,
    url: window.location.href,
    clientId: clientId,
    utmSource,
    utmMedium,
    utmTerm,
    utmContent,
    utmCampaign,
    refParams,
  };

  fetch(`${apiUrl}/api/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).catch(() => {});

  // Active Time Tracking
  const startTime = Date.now();

  const handleExit = () => {
    const exitTime = new Date().toISOString();
    const totalActiveTime = Math.floor((Date.now() - startTime) / 1000);

    const exitData = JSON.stringify({
      type: "exit",
      websiteId,
      domain,
      exitTime: exitTime,
      totalActiveTime: totalActiveTime,
      clientId: clientId,
      exitUrl: window.location.href,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${apiUrl}/api/track`, exitData);
    } else {
      fetch(`${apiUrl}/api/track`, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
        },
        body: exitData,
      }).catch(() => {});
    }
  };

  window.addEventListener("beforeunload", handleExit);
})();

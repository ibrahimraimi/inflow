// biome-ignore lint/complexity/useArrowFunction: false positive
(function () {
  function generateUUID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // Session Duration
  const sessionDuration = 12 * 60 * 50 * 1000; // 12 hours in milliseconds
  const currentTime = Date.now();
  let sessionTime = localStorage.getItem("inflow_session_time");

  let clientId = localStorage.getItem("inflow_client_id");

  if (!clientId || currentTime - sessionTime > sessionDuration) {
    if (clientId) {
      localStorage.removeItem("inflow_client)id");
      localStorage.removeItem("inflow_session_time");
    }

    clientId = generateUUID();
    localStorage.setItem("inflow_client_id", clientId);
    localStorage.setItem("inflow_session_time", currentTime);
  } else {
  }

  const script = document.currentScript;
  const websiteId = script.getAttribute("data-website-id");
  const domain = script.getAttribute("data-domain");
  const entryTime = new Date().toISOString();
  const referrer = document.referrer || "Direct";

  // Get UTM Source from URL
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("trm_source") || "";
  const utmMedium = urlParams.get("trm_medium") || "";
  const utmCampaign = urlParams.get("trm_campaign") || "";
  const utmTerm = urlParams.get("trm_term") || "";
  const utmContent = urlParams.get("trm_content") || "";
  const refParams = window.location.href.split("?")[1] || "";

  const data = {
    type: "entry",
    websiteId,
    domain,
    entryTime: entryTime,
    referrer: referrer,
    url: window.location.href,
    clientId: clientId,
    urlParams,
    utmSource,
    utmMedium,
    utmTerm,
    utmContent,
    utmCampaign,
    refParams,
  };

  fetch(`http://localhost:3000/api/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // Active Time Tracking
  const startTime = Date.now();
  let totalActiveTime = 0;

  const handleExit = () => {
    const exitTime = new Date().toISOString();
    totalActiveTime = Math.floor((Date.now() - startTime) / 1000);

    fetch(`http://localhost:3000/api/track`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "exit",
        websiteId,
        domain,
        exitTime: exitTime,
        totalActiveTime: totalActiveTime,
        clientId: clientId,
        exitUrl: window.location.href,
      }),
    });
  };

  window.addEventListener("beforeunload", handleExit);
})();

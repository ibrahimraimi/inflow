// biome-ignore lint/complexity/useArrowFunction: false positive
(function () {
  function generateUUID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  let clientId = localStorage.getItem("inflow_client_id");
  if (!clientId) {
    clientId = generateUUID();
    localStorage.setItem("inflow_client_id", clientId);
  }

  //? Alternative UUID generator
  //   function generateUUID() {
  //   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  //     const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
  //     return v.toString(16);
  //   });
  // }

  const script = document.currentScript;
  const websiteId = script.getAttribute("data-website-id");
  const domain = script.getAttribute("data-domain");
  const entryTime = Date.now();
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

  /**
   * Active Time Tracking
   */
  let activeStartTime = Date.now();
  let totalActiveTime = 0;

  const handleExit = () => {
    const exitTime = Date.now();
    totalActiveTime += Date.now() - activeStartTime;

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
      }),
    });

    localStorage.clear();
  };

  window.addEventListener("beforeunload", handleExit);
  // window.addEventListener("pagehide", handleExit);
})();

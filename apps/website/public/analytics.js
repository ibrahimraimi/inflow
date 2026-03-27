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
  let pageViewId = null;
  let sessionId = null;

  try {
    clientId = localStorage.getItem("inflow_client_id");
    sessionTime = localStorage.getItem("inflow_session_time");
    sessionId = sessionStorage.getItem("inflow_session_id");

    if (!clientId || currentTime - sessionTime > sessionDuration) {
      if (clientId) {
        localStorage.removeItem("inflow_client_id");
        localStorage.removeItem("inflow_session_time");
      }

      clientId = generateUUID();
      localStorage.setItem("inflow_client_id", clientId);
      localStorage.setItem("inflow_session_time", currentTime);
    }

    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem("inflow_session_id", sessionId);
    }
  } catch (e) {
    clientId = clientId || "anonymous";
    sessionId = sessionId || generateUUID();
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
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.data && res.data[0]) {
        pageViewId = res.data[0].id;
      }
    })
    .catch(() => {});

  // Active Time Tracking
  const startTime = Date.now();

  // Heartbeat ping every 10 seconds
  setInterval(() => {
    if (!pageViewId) return;
    const totalActiveTime = Math.floor((Date.now() - startTime) / 1000);
    const pingData = JSON.stringify({
      type: "ping",
      websiteId,
      domain,
      clientId,
      totalActiveTime,
      pageViewId,
    });
    fetch(`${apiUrl}/api/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: pingData,
    }).catch(() => {});
  }, 10000);

  // --- Session Replay Recording ---
  let replayEvents = [];
  const BATCH_SIZE = 20;
  const BATCH_INTERVAL = 5000; // 5 seconds

  function flushReplayEvents() {
    if (replayEvents.length === 0) return;

    const payload = {
      websiteId,
      clientId,
      sessionId,
      events: replayEvents,
    };

    fetch(`${apiUrl}/api/track/replay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch(() => {});

    replayEvents = [];
  }

  // Batch sending
  setInterval(flushReplayEvents, BATCH_INTERVAL);

  const recordEvent = (event) => {
    replayEvents.push({
      ...event,
      timestamp: Date.now(),
      url: window.location.pathname,
    });

    if (replayEvents.length >= BATCH_SIZE) {
      flushReplayEvents();
    }
  };

  // 1. Clicks
  document.addEventListener("click", (e) => {
    recordEvent({
      type: "click",
      x: e.clientX,
      y: e.clientY,
      target: e.target.tagName.toLowerCase(),
      path: getElementPath(e.target),
    });
  });

  // 2. Scroll (Throttled)
  let lastScrollTime = 0;
  window.addEventListener("scroll", () => {
    const now = Date.now();
    if (now - lastScrollTime > 200) {
      recordEvent({
        type: "scroll",
        y: window.scrollY,
      });
      lastScrollTime = now;
    }
  });

  // 3. Navigation
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      recordEvent({
        type: "nav",
        url: window.location.pathname,
      });
      lastUrl = window.location.href;
    }
  }, 1000);

  // --- End Session Replay ---

  // Custom Event Tracking API
  window.inflow = {
    track: function (eventName, properties = {}) {
      const eventData = JSON.stringify({
        type: "event",
        websiteId,
        domain,
        clientId,
        eventName,
        properties,
      });

      fetch(`${apiUrl}/api/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: eventData,
      }).catch(() => {});
    },
  };

  // Rage Click Tracking
  let clickHistory = [];
  const RAGE_CLICK_THRESHOLD = 3;
  const RAGE_CLICK_TIMEFRAME = 2000; // ms
  const RAGE_CLICK_RADIUS = 30; // px
  const reportedRageClicks = new Map();

  function getElementPath(el) {
    if (!el || el.nodeType !== 1) return "";
    let path = [];
    while (el && el.nodeType === 1) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += "#" + el.id;
        path.unshift(selector);
        break;
      } else {
        let sibling = el, nth = 1;
        while ((sibling = sibling.previousElementSibling)) {
          if (sibling.nodeName.toLowerCase() === selector) nth++;
        }
        if (nth !== 1) selector += ":nth-of-type(" + nth + ")";
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(" > ");
  }

  // Rest of the click handler for rage clicks
  document.addEventListener("click", (e) => {
    const now = Date.now();
    const x = e.clientX;
    const y = e.clientY;
    
    clickHistory = clickHistory.filter(c => now - c.time < RAGE_CLICK_TIMEFRAME);

    const target = e.target;
    clickHistory.push({ time: now, x, y, target });

    if (clickHistory.length >= RAGE_CLICK_THRESHOLD) {
      const recentClicks = clickHistory.slice(-RAGE_CLICK_THRESHOLD);
      const isRageClick = recentClicks.every(c => {
        const dx = c.x - x;
        const dy = c.y - y;
        return (dx * dx + dy * dy) <= (RAGE_CLICK_RADIUS * RAGE_CLICK_RADIUS);
      });

      if (isRageClick) {
        const elementPath = getElementPath(target);
        const lastReported = reportedRageClicks.get(elementPath) || 0;
        
        if (now - lastReported > 3000) {
          reportedRageClicks.set(elementPath, now);
          
          window.inflow.track("rage_click", {
            element: elementPath,
            text: (target.innerText || "").substring(0, 50).trim() || target.nodeName.toLowerCase(),
            url: window.location.pathname + window.location.search,
            clickCount: clickHistory.length
          });
          
          clickHistory = [];
        }
      }
    }
  });

  const handleExit = () => {
    flushReplayEvents();
    const exitTime = new Date().toISOString();
    const totalActiveTime = Math.floor((Date.now() - startTime) / 1000);

    const exitData = JSON.stringify({
      type: "exit",
      websiteId,
      domain,
      exitTime: exitTime,
      totalActiveTime: totalActiveTime,
      clientId: clientId,
      pageViewId: pageViewId,
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

(function() {
	//#region src/utils.ts
	function generateUUID() {
		if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
		return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
	}
	function getElementPath(el) {
		if (!el || el.nodeType !== 1) return "";
		const path = [];
		while (el && el.nodeType === 1) {
			let selector = el.nodeName.toLowerCase();
			if (el.id) {
				selector += `#${el.id}`;
				path.unshift(selector);
				break;
			}
			let sibling = el;
			let nth = 1;
			while (sibling.previousElementSibling) {
				sibling = sibling.previousElementSibling;
				if (sibling.nodeName.toLowerCase() === selector) nth++;
			}
			if (nth !== 1) selector += `:nth-of-type(${nth})`;
			path.unshift(selector);
			el = el.parentElement;
		}
		return path.join(" > ");
	}
	//#endregion
	//#region src/index.ts
	var InflowEngine = class {
		constructor() {
			this.websiteId = "";
			this.domain = "";
			this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
			this.debug = false;
			this.clientId = "";
			this.sessionId = "";
			this.pageViewId = null;
			this.initialized = false;
			this.startTime = Date.now();
			this.replayEvents = [];
			this.batchSize = 20;
			this.batchInterval = 5e3;
			this.sessionDuration = 720 * 60 * 1e3;
			this.clickHistory = [];
			this.reportedRageClicks = /* @__PURE__ */ new Map();
			if (typeof window !== "undefined") this.initSession();
		}
		init(config) {
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
		initSession() {
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
		track(eventName, properties = {}) {
			const event = {
				type: "event",
				websiteId: this.websiteId,
				domain: this.domain,
				clientId: this.clientId,
				eventName,
				properties,
				url: typeof window !== "undefined" ? window.location.href : "",
				timestamp: Date.now()
			};
			this.send("/api/track", event);
		}
		identify(userId, traits = {}) {
			this.track("identify", {
				userId,
				...traits
			});
		}
		trackPageView() {
			if (typeof window === "undefined") return;
			const urlParams = new URL(window.location.href).searchParams;
			const event = {
				type: "entry",
				websiteId: this.websiteId,
				domain: this.domain,
				clientId: this.clientId,
				url: window.location.href,
				referrer: document.referrer || "Direct",
				entryTime: (/* @__PURE__ */ new Date()).toISOString(),
				utmSource: urlParams.get("utm_source") || "",
				utmMedium: urlParams.get("utm_medium") || "",
				utmCampaign: urlParams.get("utm_campaign") || "",
				utmTerm: urlParams.get("utm_term") || "",
				utmContent: urlParams.get("utm_content") || "",
				refParams: window.location.search || ""
			};
			this.send("/api/track", event).then((res) => {
				if (res?.data && res.data[0]) this.pageViewId = res.data[0].id;
			});
		}
		async send(path, payload) {
			try {
				this.log(`Sending to ${path}:`, payload);
				return await (await fetch(`${this.apiUrl}${path}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload)
				})).json();
			} catch (e) {
				this.error(`Failed to send to ${path}`, e);
			}
		}
		setupListeners() {
			if (typeof window === "undefined") return;
			document.addEventListener("click", (e) => {
				const target = e.target;
				this.recordReplayEvent({
					type: "click",
					x: e.clientX,
					y: e.clientY,
					target: target.tagName.toLowerCase(),
					path: getElementPath(target)
				});
				this.checkRageClick(e);
			});
			let lastScrollTime = 0;
			window.addEventListener("scroll", () => {
				const now = Date.now();
				if (now - lastScrollTime > 200) {
					this.recordReplayEvent({
						type: "scroll",
						y: window.scrollY
					});
					lastScrollTime = now;
				}
			});
		}
		setupHeartbeat() {
			setInterval(() => {
				if (!this.pageViewId || typeof window === "undefined") return;
				const totalActiveTime = Math.floor((Date.now() - this.startTime) / 1e3);
				const pingData = {
					type: "ping",
					websiteId: this.websiteId,
					clientId: this.clientId,
					domain: this.domain,
					totalActiveTime,
					pageViewId: this.pageViewId,
					url: window.location.href
				};
				this.send("/api/track", pingData);
			}, 1e4);
		}
		setupSessionReplay() {
			setInterval(() => this.flushReplayEvents(), this.batchInterval);
		}
		recordReplayEvent(event) {
			if (typeof window === "undefined") return;
			this.replayEvents.push({
				...event,
				timestamp: Date.now(),
				url: window.location.pathname
			});
			if (this.replayEvents.length >= this.batchSize) this.flushReplayEvents();
		}
		flushReplayEvents() {
			if (this.replayEvents.length === 0) return;
			const payload = {
				websiteId: this.websiteId,
				clientId: this.clientId,
				sessionId: this.sessionId,
				events: this.replayEvents
			};
			this.send("/api/track/replay", payload);
			this.replayEvents = [];
		}
		checkRageClick(e) {
			const now = Date.now();
			const x = e.clientX;
			const y = e.clientY;
			const target = e.target;
			this.clickHistory = this.clickHistory.filter((c) => now - c.time < 2e3);
			this.clickHistory.push({
				time: now,
				x,
				y,
				target
			});
			if (this.clickHistory.length >= 3) {
				if (this.clickHistory.slice(-3).every((c) => {
					const dx = c.x - x;
					const dy = c.y - y;
					return dx * dx + dy * dy <= 900;
				})) {
					const path = getElementPath(target);
					if (now - (this.reportedRageClicks.get(path) || 0) > 3e3) {
						this.reportedRageClicks.set(path, now);
						this.track("rage_click", {
							element: path,
							text: (target.innerText || "").substring(0, 50).trim() || target.nodeName.toLowerCase(),
							url: window.location.pathname + window.location.search,
							clickCount: this.clickHistory.length
						});
						this.clickHistory = [];
					}
				}
			}
		}
		setupSpaTracking() {
			if (typeof window === "undefined") return;
			let lastUrl = window.location.href;
			setInterval(() => {
				if (window.location.href !== lastUrl) {
					this.recordReplayEvent({ type: "nav" });
					this.trackPageView();
					lastUrl = window.location.href;
				}
			}, 1e3);
		}
		setupBeforeUnload() {
			if (typeof window === "undefined") return;
			window.addEventListener("beforeunload", () => {
				this.flushReplayEvents();
				const exitTime = (/* @__PURE__ */ new Date()).toISOString();
				const totalActiveTime = Math.floor((Date.now() - this.startTime) / 1e3);
				const exitData = {
					type: "exit",
					websiteId: this.websiteId,
					domain: this.domain,
					exitTime,
					totalActiveTime,
					clientId: this.clientId,
					pageViewId: this.pageViewId || void 0,
					exitUrl: window.location.href,
					url: window.location.href
				};
				if (navigator.sendBeacon) navigator.sendBeacon(`${this.apiUrl}/api/track`, JSON.stringify(exitData));
				else this.send("/api/track", exitData);
			});
		}
		log(...args) {
			if (this.debug) console.log("[Inflow Engine]", ...args);
		}
		error(...args) {
			console.error("[Inflow Engine Error]", ...args);
		}
	};
	const instance = new InflowEngine();
	//#endregion
	//#region src/script.ts
	(function() {
		if (typeof document === "undefined") return;
		const script = document.currentScript;
		if (!script) return;
		const websiteId = script.getAttribute("data-website-id");
		const domain = script.getAttribute("data-domain") || void 0;
		const apiUrl = script.getAttribute("data-api-url") || new URL(script.src).origin;
		const debug = script.getAttribute("data-debug") === "true";
		const autoTrack = script.getAttribute("data-auto-track") !== "false";
		if (!websiteId) {
			console.error("[Inflow] Missing data-website-id in script tag.");
			return;
		}
		instance.init({
			websiteId,
			domain,
			apiUrl,
			debug,
			autoTrack
		});
		window.inflow = instance;
	})();
	//#endregion
})();

// for client side capturing only — guard against SSR/edge execution
// posthog-js is dynamically imported after the page is idle to keep it out of the initial bundle
if (typeof window !== "undefined") {
	const loadPostHog = async () => {
		const { default: posthog } = await import("posthog-js");
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
			api_host: "/ingest", // route through Next.js proxy (see next.config.ts rewrites)
			ui_host: "https://us.posthog.com",
			defaults: "2025-05-24",
			capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
			debug: process.env.NODE_ENV === "development",
		});
	};

	if ("requestIdleCallback" in window) {
		// Load once the main thread is free; 3 s hard timeout as a safety net
		requestIdleCallback(loadPostHog, { timeout: 3000 });
	} else {
		// Safari < 16 fallback
		setTimeout(loadPostHog, 3000);
	}
}

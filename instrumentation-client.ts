import posthog from "posthog-js";

// for client side capturing only — guard against SSR/edge execution
if (typeof window !== "undefined") {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
		api_host: "/ingest", // route through Next.js proxy (see next.config.ts rewrites)
		ui_host: "https://us.posthog.com",
		defaults: "2025-05-24",
		capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
		debug: process.env.NODE_ENV === "development",
	});
}

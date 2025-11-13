import { PostHog } from "posthog-node";

// for server side capturing
if (!process.env.POSTHOG_API_KEY) {
	throw new Error("POSTHOG_API_KEY environment variable is required");
}

const posthogClient = new PostHog(process.env.POSTHOG_API_KEY, {
	host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
	flushAt: 1, // optional: send immediately
});

export default posthogClient;

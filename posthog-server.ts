import { PostHog } from "posthog-node";

// for sever side capturing
const posthogClient = new PostHog(process.env.POSTHOG_API_KEY!, {
	host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
	flushAt: 1, // optional: send immediately
});

export default posthogClient;

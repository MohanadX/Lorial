"use server";
import { PostHog } from "posthog-node";

// for server side capturing
if (!process.env.POSTHOG_API_KEY) {
	throw new Error("POSTHOG_API_KEY environment variable is required");
}

const posthogClient = new PostHog(process.env.POSTHOG_API_KEY, {
	host: process.env.POSTHOG_HOST || "https://us.i.posthog.com/i/v0/e/",
	flushAt: 1, // optional: send immediately
});

// lib/posthog-events.ts (server-only)

export async function trackUserCreated(
	id: string,
	name?: string,
	email?: string
) {
	try {
		posthogClient.capture({
			distinctId: id,
			event: "user_created",
			properties: { name, email },
		});
		await posthogClient.flush();
	} catch (err) {
		console.error("PostHog capture failed:", err);
	}
}

//  * Capture an exception with PostHog
//  */
export async function captureException(message: string) {
	try {
		posthogClient.captureException(message);
		await posthogClient.flush();
	} catch (err) {
		console.error("PostHog exception capture failed:", err);
	}
}

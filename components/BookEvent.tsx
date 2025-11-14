"use client";

import { createBooking } from "@/lib/actions/booking.actions";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { useState, useTransition } from "react";

// Memoized toast loader to avoid repeated imports
let toastModule: typeof import("sonner") | null = null;

const getToast = async () => {
	if (!toastModule) {
		toastModule = await import("sonner");
	}
	return toastModule.toast;
};

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
	const [email, setEmail] = useState<string>("");
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const { success, error } = await createBooking({
				eventId,
				slug,
				email: email || (session?.user.email as string),
			});

			const toast = await getToast();

			if (success) {
				setSubmitted(true);
				toast.success("🎉 Your booking is done successfully");
				posthog.capture("event_booked", { eventId, slug, email });
			} else {
				setError(error || "Booking Creation Failed");
				toast.error("Your booking creation has failed");
				posthog.captureException("Booking Creation Failed");
			}
		} finally {
			setSubmitting(false);
		}
	};
	const { data: session } = useSession();

	return (
		<div id="book-event">
			{submitted ? (
				<p className="text-sm">Thank you For signing up!</p>
			) : (
				<form onSubmit={handleSubmit}>
					<div>
						{session?.user ? (
							<p>
								Book This Event with your email on our website, don't this this
								chance
							</p>
						) : (
							<>
								<label htmlFor="email">Email Address</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter Your Email Address"
									id="email"
								/>
							</>
						)}
						<button
							type="submit"
							className={clsx(
								"button-submit",
								submitting ? "bg-primary/90" : ""
							)}
							disabled={submitting}
						>
							{submitting ? "Booking..." : "Submit"}
						</button>
						{error && (
							<p className="text-red-600 text-sm mt-1">{error}</p> // <-- display error
						)}
					</div>
				</form>
			)}
		</div>
	);
};

export default BookEvent;

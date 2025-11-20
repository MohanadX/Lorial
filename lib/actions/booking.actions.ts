"use server";

import { Booking, BookingModel } from "@/database";
import connectToDatabase from "../mongodb";
import nodemailer from "nodemailer";
import z from "zod";

/**
 * Create a booking record for an event.
 *
 * Establishes a database connection and persists a booking with the given event ID, slug, and email.
 *
 * @param eventId - The event's identifier (stringified ObjectId) to associate the booking with
 * @param slug - The event's URL slug or unique human-readable identifier
 * @param email - The booker's email address
 * @returns An object with `success: true` if the booking was created, `success: false` otherwise
 */

const emailSchema = z.object({
	email: z.email(),
});
export async function createBooking({
	eventId,
	slug,
	email,
}: {
	eventId: string;
	slug: string;
	email: string;
}) {
	try {
		await connectToDatabase();

		const validation = emailSchema.safeParse({
			email,
		});

		if (!validation.success) {
			return { success: false, error: "Please enter a valid email address" };
		}
		// Check for duplicate booking
		const existingBooking = await Booking.findOne({ eventId, email });
		if (existingBooking) {
			return { success: false, error: "You have already booked this event" };
		}

		await Booking.create({ eventId, slug, email });

		// Convert Mongoose document to plain object
		// const booking = bookingDoc.toObject();

		// // Convert ObjectId and Date to strings
		// const serializedBooking = {
		// 	...booking,
		// 	_id: booking._id.toString(),
		// 	eventId: booking.eventId.toString(),
		// };

		return { success: true };
	} catch (error) {
		console.error("Creating book failed", error);
		return { success: false };
	}
}

/*
Mongoose documents are not plain objects, even after toJSON() or toObject() sometimes.

_id is a MongoDB ObjectId, which is an object with a buffer inside.

Next.js cannot send that to the browser; it only supports plain JSON-serializable values.
// Serialize for Next.js Client Components
*/

// sendBookingEmail.ts

interface SendBookingEmailParams {
	to: string;
	event: {
		title: string;
		date: string;
		time: string;
		venue: string;
		location: string;
		image?: string;
		slug: string;
	};
}

function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#039;",
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Build a safe event URL on site using the slug.
 * Using encodeURIComponent prevents injection via the slug.
 */
function buildEventUrl(slug: string) {
	const base = process.env.BASE_URL || "https://lorial.vercel.app"; // <- change site uses another base
	const safeSlug = encodeURIComponent(slug || "");
	return `${base}/event/${safeSlug}`;
}

// Configure your SMTP transporter
const transporter = nodemailer.createTransport({
	service: "gmail", // or "hotmail", "yahoo", etc.
	auth: {
		user: process.env.EMAIL_USER, // your email address
		pass: process.env.EMAIL_PASS, // app password (Gmail)
	},
});

export default async function sendBookingEmail({
	to,
	event,
}: SendBookingEmailParams) {
	const subject = `Your booking for ${escapeHtml(event.title)}`;
	const formattedDate = event.date;

	// build safe URL and escape for HTML attribute (href)
	const eventUrl = buildEventUrl(event.slug);
	const escapedUrl = escapeHtml(eventUrl);
	const body = `
		<h1>From Lorial app</h1>
		<h2>You're booked for <strong>${escapeHtml(event.title)}</strong>!</h2>
		${
			event.image
				? `<img src="${escapeHtml(event.image)}" alt="${escapeHtml(
						event.title
				  )}" style="max-width:100%;height:auto;margin-bottom:16px;" />`
				: ""
		}
		<!-- CTA button -->
			<p style="margin:18px 0;">
				<a
					href="${escapedUrl}"
					target="_blank"
					rel="noopener noreferrer"
					style="display:inline-block;padding:10px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;"
				>
					View event details
				</a>
			</p>
    <p>📅 <strong>Date:</strong> ${escapeHtml(formattedDate)}</p>
    <p>🕒 <strong>Time:</strong> ${escapeHtml(event.time)}</p>
    <p>📍 <strong>Venue:</strong> ${escapeHtml(event.venue)} (${escapeHtml(
		event.location
	)})</p>
    <hr/>
    <p>We look forward to seeing you!</p>
	
`;

	try {
		const info = await transporter.sendMail({
			from: process.env.EMAIL_USER, // must match your SMTP user
			to,
			subject,
			html: body,
		});
		console.log("Email sent successfully:", info.messageId);
	} catch (error) {
		console.error("Failed to send booking email", error);
	}
}

/*
noopener → prevents the opened page from controlling your tab.
noreferrer → also hides the HTTP “referrer” header (so the new page doesn’t see your URL or query params).
*/

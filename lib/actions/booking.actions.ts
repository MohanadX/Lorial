"use server";

import { Booking } from "@/database";
import connectToDatabase from "../mongodb";

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
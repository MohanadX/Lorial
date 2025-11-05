"use server";

import { Booking } from "@/database";
import connectToDatabase from "../mongodb";

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

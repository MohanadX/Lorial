import { mongoose } from "../lib/mongodb";
import type { Document, Model, Types } from "mongoose";
import { EventModel } from "./event.model";

const { Schema } = mongoose;

// Strongly-typed Booking document interface
export interface BookingDocument extends Document {
	eventId: Types.ObjectId;
	email: string;
	createdAt: Date;
	updatedAt: Date;
}

const BookingSchema = new Schema<BookingDocument, Model<BookingDocument>>({
	eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
	email: { type: String, required: true, trim: true },
},{ timestamps: true, strict: true });

// Index eventId for faster lookups when querying bookings by event
BookingSchema.index({ eventId: 1 });
// Prevent the same email from booking the same event more than once
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

// Simple RFC-like email validation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pre-save hook: ensure referenced event exists and email is valid.
BookingSchema.pre<BookingDocument>("save", async function () {
	// Validate email format
	if (typeof this.email !== "string" || !EMAIL_RE.test(this.email)) {
		throw new mongoose.Error.ValidationError(
			new Error("Invalid email format")
		);
	}

	// Verify that the referenced event exists
	const exists = await EventModel.exists({ _id: this.eventId });
	if (!exists) {
		throw new mongoose.Error.ValidationError(
			new Error("Referenced event does not exist")
		);
	}
});

export const BookingModel =
	mongoose.models.Booking ||
	mongoose.model<BookingDocument>("Booking", BookingSchema);

export default BookingModel;
import { mongoose } from "../lib/mongodb";
import type { Document, Model } from "mongoose";

const { Schema } = mongoose;

// Strongly-typed Event document interface
export interface EventDocument extends Document {
	title: string;
	slug: string;
	description: string;
	overview: string;
	image: string;
	venue: string;
	location: string;
	date: string; // stored as ISO string
	time: string; // normalized to HH:mm (24h)
	mode: string;
	audience: string;
	agenda: string[];
	organizer: string;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

// Lightweight helper: create a URL-friendly slug from a title.
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

// Normalize time strings into HH:mm (24h) format. Accepts inputs like
// "9:30 AM", "21:00", "9:30", "09:30 PM". Throws on invalid input.
function normalizeTime(input: string): string {
	const trimmed = input.trim();

	// If already HH:MM 24h
	const hhmm24 = /^([01]?\d|2[0-3]):([0-5]\d)$/;
	if (hhmm24.test(trimmed)) return trimmed.padStart(5, "0");

	// Match 12h format with AM/PM
	const hhmm12 = /^(1[0-2]|0?[1-9]):?([0-5]\d)?\s*([APap][Mm])$/;
	const m = trimmed.match(hhmm12);
	if (m) {
		let hour = parseInt(m[1], 10);
		const minute = m[2] ? m[2].padStart(2, "0") : "00";
		const ampm = m[3].toLowerCase();
		if (ampm === "pm" && hour !== 12) hour += 12;
		if (ampm === "am" && hour === 12) hour = 0;
		return `${hour.toString().padStart(2, "0")}:${minute}`;
	}

	throw new Error(`Invalid time format: ${input}`);
}

// Normalize date into full ISO string (UTC). Accepts e.g. "2025-11-02",
// "Nov 2 2025", etc. Throws on invalid dates.
function normalizeDateToISO(input: string): string {
	const parsed = new Date(input);
	if (Number.isNaN(parsed.getTime())) {
		throw new Error(`Invalid date: ${input}`);
	}
	return parsed.toISOString();
}

const EventSchema = new Schema<EventDocument, Model<EventDocument>>(
	{
		title: { type: String, required: true, trim: true },
		slug: { type: String, required: true, unique: true, trim: true },
		description: { type: String, required: true, trim: true },
		overview: { type: String, required: true, trim: true },
		image: { type: String, required: true, trim: true },
		venue: { type: String, required: true, trim: true },
		location: { type: String, required: true, trim: true },
		date: { type: String, required: true, trim: true },
		time: { type: String, required: true, trim: true },
		mode: { type: String, required: true, trim: true },
		audience: { type: String, required: true, trim: true },
		agenda: { type: [String], required: true },
		organizer: { type: String, required: true, trim: true },
		tags: { type: [String], required: true },
	},
	{
		timestamps: true,
		strict: true,
	}
);

// Unique index on slug for fast lookups
EventSchema.index({ slug: 1 }, { unique: true });

// Pre-save hook: generate/refresh slug only when title changes; also normalize
// date and time, validating formats. Using a regular pre-save avoids race
// conditions during create/update operations.
EventSchema.pre<EventDocument>("save", function (next) {
	try {
		// Ensure required string fields are non-empty
		const requiredStringFields: Array<keyof EventDocument> = [
			"title",
			"description",
			"overview",
			"image",
			"venue",
			"location",
			"date",
			"time",
			"mode",
			"audience",
			"organizer",
		];
		for (const field of requiredStringFields) {
			const val = this.get(field as string);
			if (typeof val !== "string" || val.trim() === "") {
				throw new Error(`${String(field)} is required and cannot be empty`);
			}
		}

		// Slug: only regenerate when title changed or on new doc
		if (this.isNew || this.isModified("title")) {
			this.slug = generateSlug(this.title);
		}

		// Normalize date to ISO
		this.date = normalizeDateToISO(this.date);

		// Normalize time to HH:mm
		this.time = normalizeTime(this.time);

		next();
	} catch (err) {
		next(err as Error);
	}
});

// Export a typed model for use across the app
export const EventModel =
	mongoose.models.Event || mongoose.model<EventDocument>("Event", EventSchema);

export default EventModel;

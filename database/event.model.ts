import { mongoose } from "../lib/mongodb";
import type { Document, Model, Query, UpdateQuery } from "mongoose";

/**
 * Event model
 *
 * Responsibilities:
 * - Define the Event schema with strong TypeScript typing.
 * - Ensure `slug` is always present and URL-friendly (generated from `title`).
 * - Normalize `date` and `time` into consistent formats before validation.
 * - Support both document `.save()` flows and query-based updates
 *   (`findOneAndUpdate`, `updateOne`) where Mongoose document middleware is
 *   normally bypassed.
 *
 * Design notes:
 * - We use a `default` for `slug` and a pre-validate hook so validators see
 *   a generated slug on create. For updates that use query helpers, we
 *   propagate the slug into the update payload in `pre('findOneAndUpdate')`
 *   and `pre('updateOne')` hooks.
 */

const { Schema } = mongoose;

export interface EventData {
	_id: string;
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
	bookings: number;
	createdAt: Date;
	updatedAt: Date;
}

// Strongly-typed Event document interface
export interface EventDocument extends EventData, Document {
	_id: string;
}

/*
EventData: A plain TypeScript interface describing the shape of an Event.
This is for data usage, especially when using .lean() queries that return plain objects.
EventDocument: Extends both EventData and Document → represents a Mongoose document.
This is what you get when you call .findOne() or .create().
_id: string: Overriding Mongoose’s default _id (usually ObjectId) to a string for easier TypeScript handling.
*/

// Lightweight helper: create a URL-friendly slug from a title.
// Uses a conservative character whitelist (a-z0-9) and replaces other
// characters with hyphens. Leading/trailing hyphens are removed.
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-") //Replaces non-alphanumeric characters with hyphens.
		.replace(/^-+|-+$/g, ""); // Removes leading/trailing hyphens.
}

// Normalize time strings into HH:mm (24h) format.
// Accepts common inputs like "9:30 AM", "21:00", "9:30", "09:30 PM".
// Stores times as a consistent 24-hour HH:mm string which is easy to
// display and compare. The function throws on clearly invalid inputs so
// callers (pre-validate hook) can return user-friendly errors.
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

// Normalize date into a full ISO string (UTC). We accept flexible inputs
// (e.g., "2025-11-02", "Nov 2 2025") and rely on the JS Date parser.
// The normalized ISO string includes time set to midnight UTC unless the
// input includes a time component. If you need only the date portion
// (YYYY-MM-DD), we can change this behavior.
function normalizeDateToISO(input: string): string {
	const parsed = new Date(input);
	if (Number.isNaN(parsed.getTime())) {
		throw new Error(`Invalid date: ${input}`);
	}
	return parsed.toISOString();
}

// Schema definition with validation rules. We keep fields strict and
// required where appropriate. `timestamps: true` automatically adds
// `createdAt` and `updatedAt` fields.
const EventSchema = new Schema<EventDocument, Model<EventDocument>>(
	{
		title: { type: String, required: true, trim: true },
		// Provide a default slug generated from title so new documents created
		// without `slug` will have one before validation runs. The default
		// runs on document creation and covers standard `.create()`/`.save()`.
		slug: {
			type: String,
			required: true,
			// Unique index on slug for fast lookups
			unique: true,
			trim: true,
			default: function (this: Partial<EventDocument>) {
				// If title exists at creation time, derive slug from it.
				return this.title ? generateSlug(this.title) : undefined;
			},
		},
		description: { type: String, required: true, trim: true },
		overview: { type: String, required: true, trim: true },
		image: { type: String, required: true, trim: true },
		venue: { type: String, required: true, trim: true },
		location: { type: String, required: true, trim: true },
		// `date` stored as an ISO string (UTC). Normalized in pre-validate.
		date: { type: String, required: true, trim: true },
		// `time` normalized to HH:mm (24h) format in pre-validate.
		time: { type: String, required: true, trim: true },
		mode: { type: String, required: true, trim: true },
		audience: { type: String, required: true, trim: true },
		agenda: { type: [String], required: true },
		organizer: { type: String, required: true, trim: true },
		tags: { type: [String], required: true },
		bookings: {
			type: Number,
			required: true,
			default: 0,
			min: 0, // Optional safeguard: prevent negative numbers
		},
	},
	{
		timestamps: true,
		strict: true,
	}
);

// Pre-validate hook: generate/refresh slug before Mongoose runs validators
// (required checks). We also normalize date and time here so validation sees
// the normalized values.
// Pre-validate hook runs before Mongoose's built-in validators. This is the
// right place to derive computed values (like `slug`) and normalize inputs so
// the validators operate on consistent data.
EventSchema.pre<EventDocument>("validate", function (next) {
	/*
	Role of next:
		next() tells Mongoose: “I’m done, go ahead with the next middleware or the validation process.”
		next(err) tells Mongoose: “Stop, there’s an error — treat this as a ValidationError.”
	*/
	try {
		// Ensure required string fields are non-empty. We perform this check
		// here to return a clear error message, however Mongoose's `required`
		// validator will also run — this is defensive.
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
				// Use `invalidate` to attach a field-specific ValidatorError
				// that consumers can inspect (err.errors.<path>). We then
				// return a ValidationError for Mongoose to propagate.
				this.invalidate(
					String(field),
					`${String(field)} is required and cannot be empty`
				);
				// Create a ValidationError that includes the invalidated paths.
				// We must suppress the explicit `any` here because Mongoose's
				// ValidationError constructor expects a shape that is hard to
				// express in TS without large type gymnastics.
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const ve = new mongoose.Error.ValidationError(this as any);
				return next(ve);
			}
		}

		// Slug: only regenerate when title changed or on new doc. The schema
		// default provides a slug on creation, but regenerating here ensures
		// updates via `.save()` reflect title changes.
		if (this.isNew || this.isModified("title")) {
			this.slug = generateSlug(this.title);
		}

		// Normalize date and time so validators and consumers see a consistent
		// representation. Errors thrown here will be wrapped as ValidationError
		// by the invalidate pattern above if desired by callers.
		this.date = normalizeDateToISO(this.date).split("T")[0];
		this.time = normalizeTime(this.time);

		next();
	} catch (err) {
		next(err as Error);
	}
});

// Middleware for query-based updates (findOneAndUpdate, updateOne): when
// title is changed via an update query, ensure the slug is derived and set on
// the update object so validation and uniqueness checks see the new slug.
function setSlugOnUpdate(this: Query<unknown, EventDocument>) {
	const rawUpdate = this.getUpdate();
	const update = (rawUpdate as UpdateQuery<EventDocument>) || {};
	const title =
		(update.title as string | undefined) ??
		(update.$set && (update.$set.title as string | undefined));
	if (title && typeof title === "string") {
		const slug = generateSlug(title);
		if (update.$set) update.$set.slug = slug;
		else update.$set = { slug } as UpdateQuery<EventDocument>["$set"];
		this.setUpdate(update);
	}
}

EventSchema.pre("findOneAndUpdate", setSlugOnUpdate);
EventSchema.pre("updateOne", setSlugOnUpdate);

// Export a typed model for use across the app
export const EventModel =
	mongoose.models.Event || mongoose.model<EventDocument>("Event", EventSchema);

export default EventModel;

import { BookingModel } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

// Get User bookings by his email
export async function GET(req: NextRequest) {
	try {
		const params = req.nextUrl.searchParams;
		const page = Number(params.get("page") ?? 1);
		const limit = 5;
		const skip = limit * (page - 1); // every page show 5 bookings

		const email = params.get("email");

		const emailValidation = z
			.object({
				email: z.email({ error: "Invalid Email" }),
			})
			.safeParse({ email });
		if (!emailValidation.success) {
			return NextResponse.json({ message: "Invalid Email", status: 400 });
		}
		const sortParam = params.get("sort") ?? "latest";

		// determine sort order based on query param
		let sortStage: any = {};

		if (sortParam === "latest") {
			sortStage = { createdAt: -1 };
		} else if (sortParam === "oldest") {
			sortStage = { createdAt: 1 };
		} else if (sortParam === "upcoming") {
			// will sort by event.date after lookup
			sortStage = { "event.date": 1 };
		}

		// find user bookings
		await connectToDatabase();
		const [result, bookingAmount] = await Promise.all([
			BookingModel.aggregate([
				// Filter by logged-in user's email
				{ $match: { email } },

				// sort only by createdAt for latest/oldest **before lookup**
				...(sortParam !== "upcoming" ? [{ $sort: sortStage }] : []),

				{ $skip: skip },
				{ $limit: limit },
				// Join Event data
				{
					$lookup: {
						from: "events",
						let: { eventId: "$eventId" },
						pipeline: [
							{ $match: { $expr: { $eq: ["$_id", "$$eventId"] } } },
							{ $project: { title: 1, slug: 1, date: 1 } },
						],
						as: "event",
					},
				},

				// Convert event array → single object (flatten it)
				{ $unwind: "$event" },

				// now sort upcoming events by event date
				...(sortParam === "upcoming" ? [{ $sort: sortStage }] : []),

				// Select only fields needed for UI
				{
					$project: {
						_id: 1,
						createdAt: 1,
						"event.title": 1,
						"event.slug": 1,
						"event.date": 1,
					},
				},

				// Pagination
			]),
			BookingModel.countDocuments({ email }),
		]);

		const bookings = result; // [{ bookings: [...] }]
		const totalBookings = bookingAmount ?? 0;
		const totalPages = Math.ceil(totalBookings / limit);

		if (bookings.length > 0) {
			return NextResponse.json({ found: true, bookings, totalPages });
		} else {
			return NextResponse.json({
				found: false,
				bookings: [],
				totalPages: 0,
			});
		}
	} catch (error) {
		// Log error for debugging (only in development)
		if (process.env.NODE_ENV === "development") {
			console.error("Error fetching User by id:", error);
		}

		// Handle specific error types
		if (error instanceof Error) {
			// Handle database connection errors
			if (error.message.includes("MONGODB_URI")) {
				return NextResponse.json(
					{ message: "Database configuration error" },
					{ status: 500 }
				);
			}

			// Return generic error with error message
			return NextResponse.json(
				{ message: "Failed to fetch user", error: error.message },
				{ status: 500 }
			);
		}

		// Handle unknown errors
		return NextResponse.json(
			{ message: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}

/*
Optimized order
For latest/oldest: $match → $sort → $skip → $limit → → $lookup → $unwind → $project
For upcoming: $match → $skip → $limit → $lookup → $unwind → $sort → $project
(Separate count query runs in parallel via Promise.all)

Why this matters

- Sorting by createdAt (latest/oldest) can use indexes before lookup
- Sorting by event.date (upcoming) requires lookup first since the field doesn't exist in bookings
- Separate count query avoids re-running expensive operations
- MongoDB can use indexes on email + createdAt for efficient sorting
*/

import { auth } from "@/auth";
import { BookingModel } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// Get User bookings by his email
export async function GET(req: NextRequest) {
	try {
		const params = req.nextUrl.searchParams;
		const page = Number(params.get("page") ?? 1);
		const limit = 5;
		const skip = limit * (page - 1); // every page show 5 bookings

		const email = params.get("email");
		// console.log(email);
		// Validate slug parameter
		if (!email || typeof email !== "string" || email.trim() === "") {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		// find user bookings
		await connectToDatabase();
		const result = await BookingModel.aggregate([
			// Filter by logged-in user's email
			{ $match: { email } },

			// Join Event data
			{
				$lookup: {
					from: "events", // collection name in MongoDB, not model name
					localField: "eventId",
					foreignField: "_id",
					as: "event",
				},
			},

			// Convert event array → single object (flatten it)
			{ $unwind: "$event" },

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

			// Sort newest booking first
			{ $sort: { createdAt: -1 } },

			// Pagination
			{
				$facet: {
					bookings: [{ $skip: skip }, { $limit: limit }],
					totalCount: [{ $count: "count" }],
				},
			},
		]);

		const bookings = result[0].bookings;
		const totalBookings = result[0].totalCount[0]?.count ?? 0;
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

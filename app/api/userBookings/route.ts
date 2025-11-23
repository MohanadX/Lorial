import { BookingModel } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

// Get User bookings by his email
export async function GET(req: NextRequest) {
	try {
        const params = req.nextUrl.searchParams;
        const page = Number(params.get("page") ?? 1);
		const limit = 5;
		const skip = limit * (page - 1); // every page show 5 bookings

		// Authenticate the caller and derive the email from the trusted session
		const session = await auth();
		const sessionEmail = session?.user?.email as string | undefined;
		if (!sessionEmail) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		// If client provided an email param, only allow it for admins.
		const requestedEmail = params.get("email");
		const userRoles = (session?.user as any)?.roles || (session?.user as any)?.role;
		const isAdmin =
			(userRoles && typeof userRoles === "string" && userRoles === "admin") ||
			(Array.isArray(userRoles) && userRoles.includes("admin"));

		if (requestedEmail && requestedEmail !== sessionEmail && !isAdmin) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		const email = requestedEmail ?? sessionEmail;

		// find user bookings
		await connectToDatabase();
		const [result, bookingAmount] = await Promise.all([
			BookingModel.aggregate([
				// Filter by logged-in user's email
				{ $match: { email } },

				// Sort newest booking first
				{ $sort: { createdAt: -1 } },
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
$match → $sort → $skip → $limit → $lookup → $unwind → $project
(Separate count query runs in parallel via Promise.all)

Why this matters

- Sorting/pagination before $lookup reduces the number of documents to join
- Separate count query avoids re-running expensive operations
- MongoDB can use indexes on email + createdAt for efficient sorting
*/

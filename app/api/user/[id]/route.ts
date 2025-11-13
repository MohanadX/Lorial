import UserModel from "@/database/user.model";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
	params: Promise<{
		id: string;
	}>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Validate slug parameter
		if (!id || typeof id !== "string" || id.trim() === "") {
			return NextResponse.json(
				{ message: "Invalid or missing id parameter" },
				{ status: 400 }
			);
		}

		// Sanitize id of Object in Mongoose (remove any potential malicious input)
		const sanitizedId = id.trim();
		if (!mongoose.Types.ObjectId.isValid(sanitizedId)) {
			return NextResponse.json(
				{ message: "Invalid ObjectId" },
				{ status: 400 }
			);
		}

		// find user
		await connectToDatabase();
		const user = await UserModel.findById({ _id: sanitizedId });

		if (!user) {
			return NextResponse.json(
				{ message: `User with id '${sanitizedId}' not found` },
				{ status: 404 }
			);
		}

		// Return successful response with users data
		return NextResponse.json(
			{ message: "User fetched successfully", user },
			{ status: 200 }
		);
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

import { Event } from "@/database";
import imagekit from "@/lib/imagekit";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase();

		const formData = await req.formData();

		let event;

		try {
			event = Object.fromEntries(formData.entries());
		} catch {
			return NextResponse.json(
				{ message: "Invalid Json Data format" },
				{ status: 400 }
			);
		}
		// check image

		const file = formData.get("image") as File;

		if (!file) {
			return NextResponse.json(
				{ message: "Image File Is Required" },
				{ status: 400 }
			);
		}

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload image to ImageKit
		const uploadResult = await imagekit.upload({
			file: buffer, // can be a Buffer, base64 string, or file URL
			fileName: file.name,
			folder: "/events", // optional: create a folder inside ImageKit
		});

		event.image = uploadResult.url;
		const createdEvent = await Event.create(event);

		return NextResponse.json(
			{
				message: "Event created successfully",
				event: createdEvent,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{
				message: "Event Creation Failed",
				error: error instanceof Error ? error.message : "Unknown",
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		await connectToDatabase();

		const events = await Event.find().sort({ createdAt: -1 }); // the newest will be first

		return NextResponse.json(
			{ message: "Events Fetched Successfully", events },
			{ status: 200 }
		);
	} catch (e) {
		return NextResponse.json(
			{ message: "Event Fetching failed", error: e },
			{ status: 500 }
		);
	}
}

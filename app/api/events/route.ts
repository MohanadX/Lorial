import { Event } from "@/database";
import imagekit from "@/lib/imagekit";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

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

		// Validate file type
		const allowedTypes = [
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif",
			"image/avif",
		];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{
					message:
						"Invalid file type. Only JPEG, PNG, WebP, Avif, and GIF are allowed",
				},
				{ status: 400 }
			);
		}

		// Validate file size (e.g., max 5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			return NextResponse.json(
				{ message: "File size exceeds 5MB limit" },
				{ status: 400 }
			);
		}

		// parse tags and agenda

		const tags = JSON.parse(formData.get("tags") as string);
		const agenda = JSON.parse(formData.get("agenda") as string);

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Check image resolution using Sharp
		const metadata = await sharp(buffer).metadata();
		const minWidth = 1200;
		const minHeight = 800;

		if (!metadata.width || !metadata.height) {
			return NextResponse.json(
				{ message: "Unable to read image dimensions" },
				{ status: 400 }
			);
		}

		if (metadata.width < minWidth || metadata.height < minHeight) {
			return NextResponse.json(
				{
					message: `Image resolution too small. Minimum: ${minWidth}x${minHeight}px`,
				},
				{ status: 400 }
			);
		}

		// Upload image to ImageKit
		const uploadResult = await imagekit.upload({
			file: buffer, // can be a Buffer, base64 string, or file URL
			fileName: file.name,
			folder: "/events", // optional: create a folder inside ImageKit
		});

		event.image = uploadResult.url;
		const createdEvent = await Event.create({
			...event,
			tags: tags,
			agenda: agenda,
		});

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

export async function GET(req: NextRequest) {
	try {
		await connectToDatabase();

		const { searchParams } = new URL(req.url);

		const skip = Number(searchParams.get("skip") || 0);
		const limit = Number(searchParams.get("limit") || 6);

		const events = await Event.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit); // the newest will be first

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

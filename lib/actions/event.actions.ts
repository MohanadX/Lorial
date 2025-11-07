"use server";

import { Event } from "@/database";
import connectToDatabase from "../mongodb";
import { EventData } from "@/database/event.model";

export const getSimilarEventBySlug = async (
	slug: string
): Promise<EventData[]> => {
	/*
    type Partial<T> = {
    [P in keyof T]?: T[P];
    It takes all the properties of type T and makes them optional.
};
    */
	try {
		await connectToDatabase();

		const event = await Event.findOne({ slug });

		// get similar events by tags, excluding the current event
		const similarEvents = await Event.find({
			_id: { $ne: event._id },
			tags: { $in: event.tags },
		})
			.limit(5)
			.lean<EventData>();
		// Using .lean() tells Mongoose: “Return plain JavaScript objects instead of Mongoose documents.”
		// get similar Event By tags in condition that the id of that event doesn't equal the id of our event
		// $ne: not equal to , $in: included (equal to)

		if (Array.isArray(similarEvents)) {
			return similarEvents;
		} else {
			return [similarEvents]; // we will return in array for consistency so TS won't rise error
		}
	} catch (error) {
		console.log(error);
		return [];
	}
};

"use client";

import { useEffect, useRef, useState } from "react";
import EventCard from "./EventCard";
import { EventDocument } from "@/database/event.model";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
	throw new Error(`BASE URL is not found and its value is: ${BASE_URL}`);
}

const LoadEvents = ({ initialSkip }: { initialSkip: number }) => {
	const [skip, setSkip] = useState(initialSkip);
	const [events, setEvents] = useState<EventDocument[]>([]);
	const [loading, setLoading] = useState(false);

	// Track mounted state to prevent invalid state updates (ensures you don’t update state after unmount (avoids React memory leaks))
	const isMounted = useRef(true);

	// Store active AbortController
	const abortControllerRef = useRef<AbortController | null>(null);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			// Component is unmounting
			isMounted.current = false;

			// Abort any in-progress request
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	const loadMore = async () => {
		setLoading(true);

		// Create a NEW AbortController for each request
		const controller = new AbortController();
		abortControllerRef.current = controller;

		try {
			const res = await axios.get(`${BASE_URL}/api/events`, {
				params: { skip, limit: 6 },
				signal: controller.signal, // axios supports AbortController
			});

			const newEvents: EventDocument[] = res.data.events;

			if (isMounted.current) {
				setEvents((prev) => [...prev, ...newEvents]);
				setSkip((prev) => prev + newEvents.length);
			}
		} catch (err: any) {
			if (axios.isCancel(err)) {
				console.log("Axios request cancelled");
			} else {
				console.error("Error loading events:", err);
			}
		} finally {
			if (isMounted.current) setLoading(false);
		}
	};

	return (
		<>
			{events && (
				<ul className="events list-none mt-4">
					{events.map((event) => (
						<li key={event._id}>
							<EventCard {...event} />
						</li>
					))}
				</ul>
			)}

			<button
				onClick={loadMore}
				className="load-more flex items-center gap-2 px-4 py-2 border rounded-md  hover:bg-gray-800 disabled:opacity-50"
				disabled={loading}
			>
				{loading && (
					<span className="w-4 h-4 border-2 border-t-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></span>
				)}
				{loading ? "Loading..." : "Show More"}
			</button>
		</>
	);
};

export default LoadEvents;

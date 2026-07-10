import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { EventData } from "@/database/event.model";
import { cacheLife, revalidatePath } from "next/cache";
import axios from "axios";
import { Suspense } from "react";
import { SkeletonCardRow } from "./event/[slug]/page";
import dynamic from "next/dynamic";
import LoadEvents from "@/components/LoadEvents";
const LoginToast = dynamic(() => import("@/components/LoginToast"));

const BASE_URL = process.env.BASE_URL;

if (!BASE_URL) {
	throw new Error("BASE_URL environment variable is not defined");
}

const EventsList = async () => {
	"use cache: remote";
	cacheLife("minutes");

	let events: EventData[] = [];
	try {
		const response = await axios.get<{events: EventData[]}>(`${BASE_URL}/api/events`, {
			timeout: 60000 // 60 seconds
		});
		const { events: res } = response.data;
		if (!res.length) {
			throw new Error(
				`Failed to fetch events: ${response.status} ${response.statusText}`
			);
		}

		events = res;
	} catch (error) {
		console.error("Events request failed", error);
		return;
	}


	return (
		<>
			<div className="events" id="events">
				<ul className="list-none">
					{events?.length > 0 &&
						events.map((event: EventData) => (
							<li key={event._id}>
								<EventCard {...event} />
							</li>
						))}
				</ul>
				<LoadEvents initialSkip={events.length} />
			</div>
		</>
	);
};

const Home = async ({
	searchParams,
}: {
	searchParams: Promise<{ login?: string; logout?: string }>;
}) => {
	const { login, logout } = await searchParams;

	return (
		<>
			<h1 className="text-center">
				The Hub For Every Dev <br /> Event You Can&apos;t Miss
			</h1>
			<p className="text-center mt-5">
				Hackathons, Meetups, and Conferences, All in One Place
			</p>
			<ExploreBtn />

			<div className="mt-20 space-y-7">
				<h2>Featured Events</h2>
				<Suspense fallback={<SkeletonCardRow />}>
					{/* Dynamic part — streamed in separately */}
					<EventsList />
				</Suspense>
			</div>
			{login && <LoginToast login={login} />}
			{logout && <LoginToast logout={logout} />}
		</>
	);
};
export default Home;

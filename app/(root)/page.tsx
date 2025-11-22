import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { EventDocument } from "@/database/event.model";
import { cacheLife } from "next/cache";
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

	const response = await fetch(`${BASE_URL}/api/events`, {
		cache: "force-cache",
		next: {
			revalidate: 60,
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch events: ${response.status} ${response.statusText}`
		);
	}

	const { events }: { events: EventDocument[] } = await response.json();

	return (
		<>
			<ul className="events list-none" id="events">
				{events?.length > 0 &&
					events.map((event: EventDocument) => (
						<li key={event._id}>
							<EventCard {...event} />
						</li>
					))}
			</ul>
			{/* Load More */}
			<LoadEvents initialSkip={events.length} />
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

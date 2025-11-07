import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { EventDocument } from "@/database/event.model";
import { cacheLife } from "next/cache";


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
	throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not defined");
}

const Home = async () => {
	"use cache: remote";
	cacheLife("minutes");
	const response = await fetch(`https://lorial.netlify.app/api/events`);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch events: ${response.status} ${response.statusText}`
		);
	}

	const { events } = await response.json();
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
				<ul className="events list-none">
					{events &&
						events.length > 0 &&
						events.map((event: EventDocument) => (
							<li key={event.title}>
								<EventCard {...event} />
							</li>
						))}
				</ul>
			</div>
		</>
	);
};

export default Home;

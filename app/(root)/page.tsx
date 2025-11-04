import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { EventDocument } from "@/database/event.model";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Home = async () => {
	const response = await fetch(`${BASE_URL}/api/events`);

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
				<ul className="events">
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

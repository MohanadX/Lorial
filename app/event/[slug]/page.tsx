import BookEvent from "@/components/BookEvent";
import { EventDocument } from "@/database/event.model";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailsItem = ({
	icon,
	alt,
	label,
}: {
	icon: string;
	alt: string;
	label: string;
}) => {
	return (
		<div className="flex gap-2">
			<Image src={icon} alt={alt} width={17} height={17} />
			<p>{label}</p>
		</div>
	);
};

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
	return (
		<div className="agenda">
			<h2>Agenda</h2>
			<ul>
				{agendaItems.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</div>
	);
};

const EventTags = ({ tags }: { tags: string[] }) => {
	return (
		<div className="flex gap-1.5 flex-wrap">
			{tags.map((tag) => (
				<li key={tag} className="pill">
					{tag}
				</li>
			))}
		</div>
	);
};

const Event = async ({ params }: { params: Promise<{ slug: string }> }) => {
	const { slug } = await params;

	const request = await fetch(`${BASE_URL}/api/events/${slug}`);

	const {
		event: {
			title,
			description,
			image,
			overview,
			date,
			time,
			location,
			mode,
			agenda,
			audience,
			tags,
			organizer,
		},
	} = await request.json();

	if (!description) {
		notFound();
	}

	const bookings = 10;

	return (
		<section id="event">
			<div className="header">
				<h1>Event Description</h1>
				<p className="mt-2">{description}</p>
			</div>

			<div className="details">
				{/* Left Side - Event Content */}
				<div className="content">
					<Image
						src={image}
						alt="Event Banner"
						width={800}
						height={800}
						className="banner"
					/>

					<section className="flex-col gap-2">
						<h2>Overview</h2>
						<p>{overview}</p>
					</section>

					<section className="flex-col gap-2">
						<h2>Event Details</h2>

						<EventDetailsItem
							icon="/icons/calendar.svg"
							alt="calendar"
							label={date}
						/>
						<EventDetailsItem icon="/icons/clock.svg" alt="time" label={time} />
						<EventDetailsItem
							icon="/icons/pin.svg"
							alt="location"
							label={location}
						/>
						<EventDetailsItem icon="/icons/mode.svg" alt="mode" label={mode} />
						<EventDetailsItem
							icon="/icons/audience.svg"
							alt="audience"
							label={audience}
						/>
					</section>

					<EventAgenda agendaItems={agenda} />

					<section className="flex-col gap-2">
						<h2>About The Organizer</h2>
						<p>{organizer}</p>
					</section>

					<EventTags tags={tags} />
				</div>
				{/* Right Side - Booking Form */}

				<aside className="booking">
					<div className="signup-card">
						<h2>Book Your Spot</h2>
						{bookings > 0 ? (
							<p className="text-sm">
								Join {bookings} Who Have already booked their spot!
							</p>
						) : (
							<p className="text-sm">Be the first one to book your spot!</p>
						)}

						<BookEvent />
					</div>
				</aside>
			</div>
		</section>
	);
};

export default Event;

import Image from "next/image";
import Link from "next/link";

interface Props {
	title: string;
	image: string;
	slug: string;
	location: string;
	date: string;
	time: string;
}

const EventCard = ({ title, image, slug, location, date, time }: Props) => {
	const optimizedImage = `${image}?tr=w-410,h-300,fo-auto,f-auto,q-70`;
	return (
		<Link href={`/event/${slug}`} className="event-card">
			<Image
				src={optimizedImage}
				alt={title}
				width={410}
				height={300}
				className="poster"
			/>

			<div className="flex flex-row gap-2">
				{/* small images doesn't worth Image component (JS overhead) */}
				<img src="/icons/pin.svg" alt="location" width={14} height={14} />
				<p>{location}</p>
			</div>
			<p className="title">{title}</p>

			<div className="datetime">
				<div>
					<img src="/icons/calendar.svg" alt="date" width={14} height={14} />
					<p>{date}</p>
				</div>
				<div>
					<img src="/icons/clock.svg" alt="time" width={14} height={14} />
					<p>{time}</p>
				</div>
			</div>
		</Link>
	);
};

export default EventCard;

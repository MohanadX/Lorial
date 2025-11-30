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
	const separator = image.includes("?") ? "&" : "?";
	const optimizedImage = `${image}${separator}tr=w-410,h-300,fo-auto,f-auto,q-70`;
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
				{/* small images don't justify Image component overhead */}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="18"
					fill="none"
					viewBox="0 0 16 18"
				>
					<path
						fill="#bdbdbd"
						d="M3.95.9h8.1v1.62h-8.1zM2.33 4.14V2.52h1.62v1.62zm0 6.48H.71V4.14h1.62zm1.62 1.62H2.33v-1.62h1.62zm1.62 1.62H3.95v-1.62h1.62zm1.62 1.62H5.57v-1.62h1.62zm1.62 0v1.62H7.19v-1.62zm1.62-1.62v1.62H8.81v-1.62zm1.62-1.62v1.62h-1.62v-1.62zm1.62-1.62v1.62h-1.62v-1.62zm0-6.48h1.62v6.48h-1.62zm0 0V2.52h-1.62v1.62zM9.62 5.76H6.38V9h3.24z"
					/>
				</svg>
				<p>{location}</p>{" "}
			</div>
			<p className="title">{title}</p>

			<div className="datetime">
				<div>
					<img
						src="/icons/calendar.webp"
						alt="date"
						width={14}
						height={14}
						style={{ objectFit: "contain" }}
						loading="lazy"
					/>

					<p>{date}</p>
				</div>
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="none"
						viewBox="0 0 16 16"
					>
						<path
							fill="#bdbdbd"
							d="M13.833.5H2.167v1.667H.5v11.666h1.667V15.5h11.666v-1.667H15.5V2.167h-1.667zm0 1.667v11.666H2.167V2.167zM7.167 3.833h1.666v5h3.334V10.5h-5z"
						/>
					</svg>
					<p>{time}</p>
				</div>
			</div>
		</Link>
	);
};

export default EventCard;

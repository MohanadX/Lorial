import Image from "next/image";
import Link from "next/link";

export type Booking_Event = {
	_id: string;
	createdAt: string;
	event: {
		slug: string;
		title: string;
		date: string;
	};
};

const BookingSlice = ({ createdAt, event }: Booking_Event) => {
	const { slug, title, date } = event;

	return (
		<Link href={`/event/${slug}`} className="book-card block">
			<p className="text-left text-2xl">Event Details:</p>
			<div className="flex justify-between flex-wrap max-sm:text-center gap-x-3">
				<span>Name: {title}</span>
				<span>Event Date: {date}</span>
			</div>
			<span className="text-[#444] absolute top-2.5 right-2.5">
				booked at {createdAt.split("T")[0]}
			</span>
			<Image
				src={
					"https://ik.imagekit.io/n0rxaa0i2/default_avatar/Lorial-default_wq2GXaCMv?updatedAt=1762963891548"
				}
				alt="Logo"
				width={32}
				height={32}
				className="absolute -left-4 -top-4 rounded-full bounce"
			/>
		</Link>
	);
};

export default BookingSlice;

import { auth } from "@/auth";
import BookingSlice, { Booking_Event } from "@/components/BookingSlice";
import Pagination from "@/components/Pagination";

import axios from "axios";

const BASE_URL = process.env.BASE_URL;

interface PageProps {
	searchParams: Promise<{ userId?: string; page?: string }>;
}

const Bookings = async ({ searchParams }: PageProps) => {
	const { userId, page: pageNumber } = await searchParams;
	const page = Number(pageNumber ?? 1);

	const session = await auth();
	// console.log(userId, session?.user.id);

	if (userId !== session?.user.id) {
		throw new Error("Unauthorized Entry to sensitive email data");
	}
	const result = await axios.get(`${BASE_URL}/api/userBookings/`, {
		params: { email: session?.user.email, page },
	});

	const { bookings } = result.data;
	const totalPages = result.data.totalPages;

	console.log(bookings);

	return (
		<div className="max-w‑2xl max-md:max-w-xl h-40 text-center">
			<h1>Your Bookings</h1>
			{bookings.length > 0 && (
				<ul className="list-none mx-auto max-w-xl mt-5">
					{bookings.map((book: Booking_Event) => (
						<li key={book?._id} className="move">
							<BookingSlice {...book} />
						</li>
					))}
				</ul>
			)}
			<Pagination totalPages={totalPages} />
		</div>
	);
};

export default Bookings;

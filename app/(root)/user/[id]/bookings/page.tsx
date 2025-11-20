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

	// Guard: require authenticated session with email
	if (!session?.user?.email) {
		return (
			<div className="max-w-2xl max-md:max-w-xl h-40 text-center">
				<h1 className="text-xl font-semibold">Unauthorized</h1>
				<p className="mt-2 text-gray-500">
					Please sign in to view your bookings.
				</p>
			</div>
		);
	}

	// Guard: userId in the route must match the authenticated user's id
	if (userId !== session.user.id) {
		return (
			<div className="max-w-2xl max-md:max-w-xl h-40 text-center">
				<h1 className="text-xl font-semibold">Forbidden</h1>
				<p className="mt-2 text-gray-500">
					You don't have permission to view these bookings.
				</p>
			</div>
		);
	}

	const result = await axios.get(`${BASE_URL}/api/userBookings/`, {
		params: { email: session.user.email, page },
	});

	const { bookings } = result.data;
	const totalPages = result.data.totalPages;

	return (
		<div className="max-w-2xl max-md:max-w-xl h-40 text-center">
			<h1>Your Bookings</h1>
			{bookings.length > 0 ? (
				<ul className="list-none mx-auto max-w-xl mt-5">
					{bookings.map((book: Booking_Event) => (
						<li key={book?._id} className="move">
							<BookingSlice {...book} />
						</li>
					))}
				</ul>
			) : (
				<div className="mt-6 text-gray-500">You have no bookings yet.</div>
			)}
			{totalPages > 1 && <Pagination totalPages={totalPages} />}
		</div>
	);
};

export default Bookings;

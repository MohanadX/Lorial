import clsx from "clsx";
import { Route } from "next";
import Link from "next/link";

interface FiltersProps {
	searchParams: { page?: string; sort?: string };
}

const BookingFilters = ({ searchParams }: FiltersProps) => {
	const currentSort = searchParams.sort ?? "latest";

	const buildUrl = (sortValue: string) => {
		const params = new URLSearchParams(searchParams as any);

		params.set("sort", sortValue);
		params.set("page", "1"); // reset pagination on sort change

		return `?${params.toString()}`;
	};

	return (
		<fieldset className="mt-5 flex justify-center gap-3 text-center">
			<legend className="font-semibold mb-2">Sort bookings by</legend>

			<label
				className={clsx(
					"radio-filter",
					currentSort === "latest" ? "bg-gray-700!" : ""
				)}
			>
				<input
					type="radio"
					name="sort"
					className="peer hidden"
					checked={currentSort === "latest"}
					readOnly
				/>
				<Link href={buildUrl("latest") as Route}>Latest</Link>
			</label>

			<label
				className={clsx(
					"radio-filter",
					currentSort === "oldest" ? "bg-gray-700!" : ""
				)}
			>
				<input
					type="radio"
					name="sort"
					checked={currentSort === "oldest"}
					readOnly
				/>
				<Link href={buildUrl("oldest") as Route}>Oldest</Link>
			</label>

			<label
				className={clsx(
					"radio-filter",
					currentSort === "upcoming" ? "bg-gray-700!" : ""
				)}
			>
				<input
					type="radio"
					name="sort"
					checked={currentSort === "upcoming"}
					readOnly
				/>
				<Link href={buildUrl("upcoming") as Route}>Upcoming</Link>
			</label>
		</fieldset>
	);
};

export default BookingFilters;

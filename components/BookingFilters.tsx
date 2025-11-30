"use client";

import clsx from "clsx";
import { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

interface FiltersProps {
	searchParams: { page?: string; sort?: string };
}

const BookingFilters = ({ searchParams }: FiltersProps) => {
	const router = useRouter();
	const pathname = usePathname() || "/";

	const currentSort = searchParams.sort ?? "latest";

	const buildUrl = (sortValue: string) => {
		const params = new URLSearchParams(searchParams as Record<string, string>);
		params.set("sort", sortValue);
		params.set("page", "1"); // reset pagination on sort change

		return `${pathname}?${params.toString()}`;
	};

	const onChange = (value: string) => {
		const url = buildUrl(value);
		router.push(url as Route);
	};

	return (
		<fieldset
			className="mt-5 flex justify-center gap-3 text-center"
			role="radiogroup"
			aria-label="Sort bookings by"
		>
			<legend className="sr-only">Sort bookings by</legend>

			<label
				className={clsx(
					"radio-filter",
					currentSort === "latest" ? "bg-gray-700!" : ""
				)}
			>
				<input
					type="radio"
					name="sort"
					className="peer"
					checked={currentSort === "latest"}
					onChange={() => onChange("latest")}
					aria-checked={currentSort === "latest"}
				/>
				<span role="button" tabIndex={0} onClick={() => onChange("latest")}>
					Latest
				</span>
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
					onChange={() => onChange("oldest")}
					aria-checked={currentSort === "oldest"}
				/>
				<span role="button" tabIndex={0} onClick={() => onChange("oldest")}>
					Oldest
				</span>
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
					onChange={() => onChange("upcoming")}
					aria-checked={currentSort === "upcoming"}
				/>
				<span role="button" tabIndex={0} onClick={() => onChange("upcoming")}>
					Upcoming
				</span>
			</label>
		</fieldset>
	);
};

export default BookingFilters;

import { memo } from "react";

interface LoaderProps {
	type?: "navbar" | "page";
}

const Loader: React.FC<LoaderProps> = ({ type = "page" }) => {
	if (type === "navbar") {
		// Subtle inline loader for Navbar
		return (
			<div className="flex items-center gap-2 justify-between p-5 w-full">
				<div className="w-6 h-6 rounded-full animate-pulse bg-primary"></div>
				<div className="w-16 h-4 rounded bg-gray-300 animate-pulse"></div>
			</div>
		);
	}

	// Full page / section loader
	return (
		<div className="space-y-6 p-4">
			{/* Hero section skeleton */}
			<div className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
			{/* Search / form skeleton */}
			<div className="h-12 bg-gray-300 rounded-full animate-pulse w-full max-w-xl mx-auto"></div>
			{/* Cards grid skeleton */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
				{Array.from({ length: 6 }).map((_, idx) => (
					<div
						key={idx}
						className="h-60 bg-gray-200 rounded-lg animate-pulse"
					></div>
				))}
			</div>
		</div>
	);
};

export default memo(Loader);

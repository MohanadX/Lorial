import { Suspense } from "react";

function SkeletonLayout() {
	return (
		<>
			<div className="w-74 my-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
			<div className="w-140 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
			<div className="flex gap-6 p-4 mt-30 flex-wrap">
				{/* Left larger card */}
				<div className="flex-1 h-80 bg-gray-200 rounded-xl animate-pulse"></div>

				{/* Right smaller card */}
				<div className="w-104 h-48 bg-gray-200 rounded-xl animate-pulse"></div>
			</div>
		</>
	);
}

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Suspense fallback={<SkeletonLayout />}>{children}</Suspense>
		</>
	);
}

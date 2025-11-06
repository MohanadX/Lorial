// app/loading.tsx (server component)

import DynamicLoading from "@/components/DynamicLoading";

export default function Loading() {

export default function Loading() {
	return (
		<div className="flex items-center justify-center w-full h-full bg-white dark:bg-gray-900 min-h-[93vh]">
			<div className="text-center">
				{/* Static spinner */}
				<div
					className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
					aria-hidden="true"
				/>
				{/* Client-side animated dots */}
				<DynamicLoading />
			</div>
		</div>
	);
}

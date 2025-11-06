// app/DynamicLoading.tsx (client component)
"use client";
import { useEffect, useState } from "react";

export default function DynamicLoading() {
	const [dots, setDots] = useState(0);
	useEffect(() => {
		const interval = setInterval(() => setDots((prev) => (prev + 1) % 4), 300);
		return () => clearInterval(interval);
	}, []);
	return (
		<p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
			Loading{".".repeat(dots)}
		</p>
	);
}

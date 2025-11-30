"use client";

import dynamic from "next/dynamic";

const UserAvatar = dynamic(() => import("./UserAvatar"), {
	loading: () => <AvatarSkeletonTailwind />,
	ssr: false,
});

export default function UserAvatarClientWrapper() {
	return (
		// <Suspense fallback={<AvatarSkeletonTailwind />}>
		<UserAvatar />
		// </Suspense>
	);
}

export function AvatarSkeletonTailwind({ className = "" }) {
	return (
		<div
			role="img"
			aria-label="Loading avatar"
			className={`w-12 h-12 rounded-full bg-gray-200 animate-pulse ${className}`}
		/>
	);
}

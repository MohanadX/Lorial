"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function AvatarSkeletonTailwind({ className = "" }) {
	return (
		<div
			role="img"
			aria-label="Loading avatar"
			className={`w-12 h-12 rounded-full bg-gray-200 animate-pulse ${className}`}
		/>
	);
}

const UserAvatar = () => {
	const { data: session, status } = useSession();
	if (status === "loading") {
		return (
			<li>
				<AvatarSkeletonTailwind />
			</li>
		);
	}

	return (
		<li>
			{session ? (
				<Link href={`/user/${session.user.id}`}>
					<Image
						src={session.user?.image ?? "/icons/avatar-placeholder.png"}
						alt={session.user?.name ?? "User profile"}
						width={48}
						height={48}
						className="rounded-full"
					/>
				</Link>
			) : (
				<Link href={"/login"}>Login</Link>
			)}
		</li>
	);
};

export default UserAvatar;

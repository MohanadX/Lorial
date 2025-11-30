"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const UserAvatar = () => {
	const { data: session } = useSession();
	return (
		<li>
			{session ? (
				<Link href={`/user/${session.user?.id}`}>
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

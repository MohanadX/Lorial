import { auth } from "@/auth";

import Image from "next/image";
import Link from "next/link";

const Navbar = async () => {
	const session = await auth();

	// console.log(session);
	return (
		<header>
			<nav>
				<Link href={"/"} className="logo">
					<Image src={"/icons/logo.png"} alt="logo" width={24} height={24} />
					<p>Lorial</p>
				</Link>

				<ul className="list-none">
					<li>
						<Link href={"/"}>Home</Link>
					</li>
					<li>
						<Link href={"/"}>Events</Link>
					</li>
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
				</ul>
			</nav>
		</header>
	);
};

export default Navbar;

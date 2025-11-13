import { auth } from "@/auth";
import EditProfileInput from "@/components/EditProfileInput";
import { signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const BASE_URL = process.env.BASE_URL;

export default async function UserPage({
	searchParams,
}: {
	searchParams: Promise<{ id: string }>;
}) {
	const session = await auth();
	return (
		<main className="max-w‑2xl text-center p‑6">
			<h1 className="text‑2xl text-center font‑bold mb‑4">Edit Profile</h1>
			{/* 3 inputs for changing user data */}
			<div className="mx-auto w-100 mt-5">
				<h2 className="mt-3 ">User {session?.user.name}</h2>

				<EditProfileInput dataType="name" />
				<EditProfileInput dataType="image" />

				<p className="my-5">Or Do you want to Sign out</p>

				<form
					action={async () => {
						"use server";
						await signOut({ redirectTo: "/?logout=success" });
					}}
				>
					<button className="change" type="submit">
						Sign Out
					</button>
				</form>
			</div>
		</main>
	);
}

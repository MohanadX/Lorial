import { auth } from "@/auth";
import EditProfileInput from "@/components/EditProfileInput";
import { signOut } from "@/auth";
import Form from "next/form";

export default async function UserPage() {
	const session = await auth();
	return (
		<div className="max-w‑2xl max-md:max-w-xl text-center md:p-6">
			<h1 className="text‑2xl text-center font‑bold mb‑4">Edit Profile</h1>
			{/* 3 inputs for changing user data */}
			<div className="mx-auto w-100 mt-5">
				<h2 className="mt-3 ">User {session?.user.name}</h2>

				<EditProfileInput dataType="name" />
				<EditProfileInput dataType="image" />

				<p className="my-5">Or Do you want to Sign out</p>

				<Form
					action={async () => {
						"use server";
						await signOut({ redirectTo: "/?logout=success" });
					}}
					className="text-center"
				>
					<button className="change mx-auto" type="submit">
						Sign Out
					</button>
				</Form>
			</div>
		</div>
	);
}

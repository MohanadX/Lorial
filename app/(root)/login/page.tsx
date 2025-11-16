"use client";

import { authenticate } from "@/lib/actions/user.actions";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { useActionState, useState } from "react";

export type State = {
	success?: boolean;
	message: string | undefined;
	errors?: {
		nameError?: string;
		emailError?: string;
		passwordError?: string;
	};
};

export default function LoginPage() {
	// inputs for saving from useActionState taking away input after invalidation of inputs
	const [userName, setUserName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const initialState: State = { message: "", errors: {} };

	const [state, formAction, loading] = useActionState(
		authenticate,
		initialState
	);

	if (state.success) {
		redirect("/?login=success");
	}
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className=" p-8 rounded shadow-md w-full max-w-md">
				<h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

				{/* Credentials Form */}
				<form action={formAction} className="space-y-4">
					<div>
						<label htmlFor="name" className="block text-sm font-medium">
							Name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							className="mt-1 block w-full border px-3 py-2 rounded"
							required
							min={5}
							value={userName}
							onChange={(event) => setUserName(event.target.value)}
						/>
					</div>

					{state.errors?.nameError && (
						<p className="text-red-600 mb-4">{state.errors.nameError}</p>
					)}

					<div>
						<label htmlFor="email" className="block text-sm font-medium">
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							className="mt-1 block w-full border px-3 py-2 rounded"
							required
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
					</div>

					{state.errors?.emailError && (
						<p className="text-red-600 mb-4">{state.errors.emailError}</p>
					)}

					<div>
						<label htmlFor="password" className="block text-sm font-medium">
							Password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							className="mt-1 block w-full border px-3 py-2 rounded"
							required
							value={password}
							onChange={(event) => setPassword(event.target.value)}
						/>
					</div>

					{state.errors?.passwordError && (
						<p className="text-red-600 mb-4">{state.errors.passwordError}</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
					>
						{loading ? "Logging in..." : "Login"}
					</button>
					{state.message && (
						<p className="text-red-600 mb-4">{state.message}</p>
					)}
				</form>

				<div className="my-6 text-center">OR</div>

				{/* OAuth Providers */}
				<div className="flex flex-col space-y-2">
					<button
						onClick={() => signIn("google", { redirectTo: "/?login=success" })}
						className="w-full flex justify-center items-center bg-red-400 text-white py-2 rounded hover:bg-red-600"
					>
						<Image
							src={"/icons/Googlelogo.svg.webp"}
							alt="GitHub"
							width={30}
							height={30}
						/>
					</button>
					<button
						onClick={() => signIn("github", { redirectTo: "/?login=success" })}
						className="w-full flex justify-center items-center bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
					>
						<Image
							src={"/icons/github.svg"}
							alt="GitHub"
							width={30}
							height={30}
						/>
					</button>
				</div>
			</div>
		</div>
	);
}

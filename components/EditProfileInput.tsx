"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { EditUserData } from "@/lib/actions/user.actions";
import { useSession } from "next-auth/react";

export type ChangeState = {
	success?: boolean;
	message?: string;
	data?: {
		name: string;
		image: string;
	};
	errors?: {
		value?: string;
		dataType?: string;
	};
};

const EditProfileInput = ({ dataType }: { dataType: "name" | "image" }) => {
	const [editedValue, setEditedValue] = useState("");

	const { data: session, update } = useSession();

	// 🧠 useActionState returns [state, formAction, isPending]
	const [state, formAction, isPending] = useActionState(EditUserData, {
		success: false,
		message: "",
	});
	useEffect(() => {
		if (state.success && state.data) {
			(async () => {
				await update({
					...session,
					user: {
						...session?.user,
						...state.data,
					},
				});
			})();
		}
	}, [state.success, state.data, update]);

	return (
		<form
			action={formAction}
			className="flex gap-2 items-end border-b border-gray-300 pb-3 mb-4"
		>
			<div className="flex-1">
				<label
					htmlFor={dataType}
					className="block text-sm font-medium text-left capitalize mb-1"
				>
					Change {dataType}
				</label>
				<div className="flex gap-3 items-center">
					<input
						type="text"
						id={dataType}
						name="value"
						placeholder={
							dataType === "image" ? "Enter new image URL" : "Enter new name"
						}
						className="block w-full border px-3 py-2 rounded focus:ring focus:ring-blue-400"
						value={editedValue}
						onChange={(e) => setEditedValue(e.target.value)}
						required
					/>

					{/* Hidden field to tell the server which data we’re updating */}
					<input type="hidden" name="dataType" value={dataType} />
					<button
						disabled={isPending}
						className="change px-4 py-2 rounded disabled:opacity-50 min-w-[100px]"
						type="submit"
					>
						{isPending ? "Saving..." : "Change"}
					</button>
				</div>
				{/* Validation or success messages */}
				{state?.message && (
					<p
						className={`mt-2 text-sm ${
							state.success ? "text-green-600" : "text-red-600"
						}`}
					>
						{state.message}
					</p>
				)}
			</div>
		</form>
	);
};

export default EditProfileInput;

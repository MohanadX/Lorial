"use server";
import { State } from "@/app/(root)/login/page";
import { ChangeState } from "@/components/EditProfileInput";
import { auth, signIn } from "@/auth";
import z from "zod";
import connectToDatabase from "../mongodb";
import UserModel from "@/database/user.model";
import axios from "axios";
const credentialsSchema = z.object({
	UserName: z.string({ message: "Name Cannot be empty" }),
	email: z.email({ message: "Please enter a valid email" }),
	password: z
		.string()
		.min(6, { message: "Password have to be 6 characters at least" }),
});

export async function authenticate(
	prevState: State,
	formData: FormData
): Promise<State> {
	const values = Object.fromEntries(formData.entries());

	const parsed = credentialsSchema.safeParse(values);

	if (!parsed.success) {
		const errors = parsed.error.flatten().fieldErrors;
		return {
			message: "Invalid inputs",
			errors: {
				nameError: errors.UserName?.[0],
				emailError: errors.email?.[0],
				passwordError: errors.password?.[0],
			},
		};
	}

	const nameRegex = /^[A-Za-z\s]+$/;
	const validName = nameRegex.test(parsed.data.UserName);

	if (!validName) {
		return {
			message: "Invalid Username",
			errors: {
				nameError: "Username can only contain letters",
			},
		};
	}
	const result = await signIn("credentials", {
		name: parsed.data.UserName,
		email: parsed.data.email,
		password: parsed.data.password,
		redirect: false,
		redirectTo: "/?login=success",
	});

	if (result!.error) {
		return {
			message: result?.error,
			errors: {},
		};
	}

	return {
		message: "Login Success",
		errors: {},
	};
}

// user edit data

const editUserSchema = z.object({
	dataType: z.enum(["name", "image"], { error: "Invalid data type" }),
	value: z
		.string({ error: "Input must be a text" })
		.trim()
		.min(1, { error: "Value is required" }),
});
export async function EditUserData(
	prevState: ChangeState,
	formData: FormData
): Promise<ChangeState> {
	try {
		const rawInput = {
			dataType: formData.get("dataType"),
			value: formData.get("value"),
		};

		// ✅ Validate using Zod
		const parsed = editUserSchema.safeParse(rawInput);
		if (!parsed.success) {
			const errors = parsed.error.flatten().fieldErrors;
			return {
				success: false,
				message: "Invalid Input",
				errors: {
					value: errors.value?.[0],
				},
			};
		}
		// if data Type was name or url
		const { dataType, value } = parsed.data;

		// Step 2: If editing image, check headers using Axios
		if (dataType === "image") {
			// Create a Set from the comma-separated string
			const ALLOWED_IMAGE_HOSTS = new Set(
				(process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS ?? "")
					.split(",") // split by commas
					.map((host) => host.trim().toLowerCase()) // normalize & trim spaces
					.filter(Boolean) // remove empty entries
			);
			let parsedUrl: URL;
			try {
				parsedUrl = new URL(value);
			} catch {
				return {
					success: false,
					message: "Please provide a valid absolute image URL.",
				};
			}
			if (parsedUrl.protocol !== "https:") {
				return {
					success: false,
					message: "Image URLs must use HTTPS.",
				};
			}
			if (
				ALLOWED_IMAGE_HOSTS.size > 0 &&
				!ALLOWED_IMAGE_HOSTS.has(parsedUrl.hostname)
			) {
				return {
					success: false,
					message: "Image host is not permitted.",
				};
			}
		} else {
			// check name that cannot contains any numbers
			// Allow only letters and spaces
			const nameRegex = /^[A-Za-z\s]+$/;
			const result = nameRegex.test(value);
			if (!result) {
				return {
					success: false,
					message: "Name can only contain letters",
				};
			}
		}

		await connectToDatabase();
		const session = await auth();

		const updateField: Record<string, any> = {};
		updateField[dataType] = value;

		const updatedUser = await UserModel.findOneAndUpdate(
			{ email: session!.user.email },
			{ $set: updateField },
			{ new: true, runValidators: true, projection: { password: 0 } } // Don’t return password
		);

		if (!updatedUser) {
			return { message: "User not found", success: false };
		}

		return {
			message: `${dataType} updated successfully.`,
			success: true,
			data: {
				name: dataType === "name" ? value : updatedUser.name,
				image: dataType === "image" ? value : updatedUser.image,
			},
		};
	} catch (error) {
		console.error("Error updating user:", error);
		return { message: "Something went wrong.", success: false };
	}
}

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
				emailError: errors.email?.[0],
				passwordError: errors.password?.[0],
			},
		};
	}
	const result = await signIn("credentials", {
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
			try {
				const response = await axios.head(value, { timeout: 2000 }); // 5s timeout is allowed to take before being automatically aborted.
				// Without a timeout, validation could hang server action, delaying other requests.
				const contentType = response.headers["content-type"];

				if (!contentType || !contentType.startsWith("image/")) {
					return {
						message: "Provided URL does not point to a valid image.",
						success: false,
					};
				}
			} catch (err: any) {
				console.error("Image URL validation failed:", err);
				if (err.code === "ECONNABORTED") {
					return { success: false, message: "Image URL request timed out." };
				}
				return {
					success: false,
					message:
						"Could not validate the image URL. Please check the link and try again.",
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

		if (!session?.user?.email) {
			return {
				success: false,
				message: "You must be signed in to update your profile.",
			};
		}

		const updateField: Record<string, any> = {};
		updateField[dataType] = value;

		const updatedUser = await UserModel.findOneAndUpdate(
			{ email: session!.user.email },
			{ $set: updateField },
			{ new: true, runValidators: true, projection: { password: 0 } } // Don't return password
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

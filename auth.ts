import NextAuth, { DefaultSession } from "next-auth";
import { authConfig } from "./auth.config";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import connectToDatabase from "./lib/mongodb";
import UserModel from "@/database/user.model";
import bcrypt from "bcryptjs";
import axios from "axios";

// types/next-auth.d.ts
import "next-auth";
import imagekit from "./lib/imagekit";
import { captureException, trackUserCreated } from "./posthog-server";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
		} & DefaultSession["user"];
	}

	interface User {
		id: string;
		password?: string;
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	debug: process.env.NODE_ENV === "development",
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
			clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
		}),
		Github({
			clientId: process.env.AUTH_GITHUB_CLIENT_ID!,
			clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET!,
		}),
		Credentials({
			// Must define the shape of credentials expected
			credentials: {
				name: {
					label: "Username",
					type: "text",
				},
				email: {
					label: "Email",
					type: "text",
					placeholder: "email@example.com",
				},
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials): Promise<{
				email: string;
				password?: string;
				image?: string;
				name?: string;
				id: string;
			}> {
				await connectToDatabase();
				const user = await UserModel.findOne({ email: credentials!.email });

				// new user Sign up
				if (!user) {
					return {
						id: "", // temporary unique id, will be replaced in signIn callback
						name: credentials!.name as string,
						email: credentials!.email as string,
						password: credentials!.password as string,
					};
				}

				// user logged with OAuth
				if (!user.password) {
					captureException("Sign in process failed");
					throw new Error(
						"You signed up with Google or Github. Please use that option to login."
					);
				}

				// user logged with credentials previously
				const isValid = await bcrypt.compare(
					credentials!.password as string,
					user.password
				);
				if (!isValid) throw new Error("Incorrect password");

				// user entered correct credentials
				return {
					id: user._id.toString(),
					name: user?.name,
					email: user?.email,
					image: user?.image,
				};
			},
		}),
	],
	callbacks: {
		async signIn({ user, account }) {
			try {
				await connectToDatabase();

				// Cast user to include id/password
				const customUser = user as {
					email?: string;
					name?: string;
					image?: string;
					password?: string;
					id?: string;
				};

				// New user (), check DB
				const dbUser = await UserModel.findOne({ email: customUser.email });
				if (!dbUser) {
					customUser.image = await uploadProfileImage(
						customUser.name!,
						customUser.image!
					);
					// Create new user
					const newUser: Partial<typeof customUser> = {
						email: customUser.email,
						name: customUser.name,
						image: customUser.image,
					};
					if (customUser.password) {
						newUser.password = await bcrypt.hash(customUser.password, 10);
					}

					const createdUser = await UserModel.create(newUser);
					customUser.id = createdUser._id.toString();
					// Handle profile image upload for new users only
					// track users creation with posthog
					const { name, email, id } = customUser;
					try {
						trackUserCreated(id!, name, email);
					} catch (err) {
						console.error("PostHog capture failed:", err);
					}
				} else {
					customUser.id = dbUser._id.toString();
					customUser.image = dbUser.image;
					customUser.name = dbUser.name;
				}

				// Prevent OAuth login for emails that have credentials
				if (account!.provider !== "credentials") {
					if (dbUser && dbUser.password) {
						captureException("Sign in process failed");
						throw new Error(
							"This email is already registered with a password. Please sign in with credentials instead."
						);
					}
				}

				return true;
			} catch (error) {
				console.error("SignIn callback error:", error);
				captureException("Sign in process failed");
				throw new Error("Unable to complete sign-in. Please try again.");
			}
		},
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id;
				token.name = user.name;
				token.image = user.image;
			}

			// When session is updated client-side (triggered by `update()` call)
			if (trigger === "update" && session?.user) {
				token.name = session.user.name;
				token.image = session.user.image;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.name = token.name as string;
				session.user.image = token.image as string;
			}
			return session;
		},
	},
});
/*
user: 
For OAuth, this comes from the provider’s profile() mapping.
For Credentials, this comes from whatever object you return from authorize().

2️⃣ account:
Information about how the user authenticated.
Contains metadata specific to the provider:

profile: 
The raw profile data returned by the OAuth provider before normalization.
It’s different per provider, so you typically don’t rely on it directly.
*/

// image helper function

// utils/uploadProfileImage.ts
export async function uploadProfileImage(name: string, imageUrl?: string) {
	if (!imageUrl) {
		return "https://ik.imagekit.io/n0rxaa0i2/default_avatar/Lorial-default_wq2GXaCMv?updatedAt=1762963891548?tr=f‑auto,q‑80,format‑webp";
	}

	try {
		const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
		const buffer = Buffer.from(response.data);
		const upload = await imagekit.upload({
			file: buffer,
			fileName: `${name || "user"}`,
			folder: "/profiles",
		});
		return `${upload.url}?tr=f‑auto,q‑80,format‑webp`;
	} catch (err) {
		console.warn("Profile image upload failed:", err);
		return "https://ik.imagekit.io/n0rxaa0i2/default_avatar/Lorial-default_wq2GXaCMv?updatedAt=1762963891548?tr=f‑auto,q‑80,format‑webp";
	}
}

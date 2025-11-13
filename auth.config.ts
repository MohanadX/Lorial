export const authConfig = {
	pages: {
		signIn: "/login",
		// error: "/login?error=", // When an error occurs, NextAuth will redirect to /login?error=ErrorMessage.
	},
	providers: [], // will add in auth.ts
};

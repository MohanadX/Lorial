import { NextRequest } from "next/server";
import { auth } from "./auth";

export const config = {
	matcher: ["/event/create/:path*"],
};

export default async function proxy(req: NextRequest) {
	const isLogged = await auth();
	if (req.nextUrl.pathname.startsWith("/create/event") && !isLogged) {
		return Response.redirect("/");
	}
	// Authentication passed — continue request
	return true;
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export const config = {
	matcher: ["/event/create/:path*"],
};

export default async function proxy(req: NextRequest) {
	const isLogged = await auth();
	if (req.nextUrl.pathname.startsWith("/create/event") && !isLogged) {
		return NextResponse.redirect(new URL("/", req.url));
	}
	// Authentication passed — continue request
	return NextResponse.next();
}

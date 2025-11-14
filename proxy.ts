import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export const config = {
	matcher: ["/event/create/:path*", "/user/:path*", "/login"],
};

export default async function proxy(req: NextRequest) {
	const session = await auth();
	const isLogged = session?.user;
	const pathname = req.nextUrl.pathname;
	// 1) Block logged-in users from accessing /login
	if (pathname === "/login" && isLogged) {
		return NextResponse.redirect(new URL("/", req.url));
	}

	//  2) Protect /event/create/*
	if (pathname.startsWith("/event/create") && !isLogged) {
		return NextResponse.redirect(new URL("/", req.url));
	}

	// 3) protect other users pages from guessing their id and prevent non-logged users to reach it
	if (pathname.startsWith("/user/")) {
		const requestUserId = pathname.split("/")[2] ?? null;
		const userId = isLogged?.id;
		if (!isLogged) {
			return NextResponse.redirect(new URL("/login", req.url));
		}

		// Prevent access to other users’ pages
		if (requestUserId !== userId) {
			return NextResponse.redirect(new URL("/unauthorized", req.url));
		}
	}

	// Authentication passed — continue request
	return NextResponse.next();
}

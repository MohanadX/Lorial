import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; //does not require Node modules; it reads the JWT from cookies and works in Edge.

export const config = {
	matcher: ["/event/create/:path*", "/user/:path*", "/login"],
};

export default async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.AUTH_SECRET });
	const isLogged = !!token;
	const pathname = req.nextUrl.pathname;

	// 1) Block logged-in users from accessing /login
	if (pathname === "/login" && isLogged) {
		return NextResponse.redirect(new URL("/", req.url));
	}

	// 2) Protect /event/create/*
	if (pathname.startsWith("/event/create") && !isLogged) {
		return NextResponse.redirect(new URL("/", req.url));
	}

	// 3) Protect /user/:id pages
	if (pathname.startsWith("/user/")) {
		const requestUserId = pathname.split("/")[2] ?? null;
		if (!isLogged) {
			return NextResponse.redirect(new URL("/login", req.url));
		}
		if (requestUserId !== token.id) {
			return NextResponse.redirect(new URL("/unauthorized", req.url));
		}
	}

	return NextResponse.next();
}

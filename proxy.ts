// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export const config = {
	matcher: ["/event/create/:path*", "/login"],
};

const BASE_URL = process.env.BASE_URL;

export default async function proxy(req: NextRequest) {
	const session = await auth();
	const pathname = req.nextUrl.pathname;
	console.log(pathname);
	console.log("BASE URL<", BASE_URL);

	if (session && pathname.startsWith("/login")) {
		console.log("Base URL", req.nextUrl.host);
		return NextResponse.redirect(new URL("/", BASE_URL));
	}

	return NextResponse.next();
}

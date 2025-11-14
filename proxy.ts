// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

import { NextRequest, NextResponse } from "next/server";

// export const config = {
// 	matcher: ["/event/create/:path*", "/user/:path*", "/login"],
// };

// export default function proxy(req: Request) {
// 	const cookies = req.headers.get("cookie") || "";
// 	const tokenCookie =
// 		cookies
// 			.split(";")
// 			.map((c) => c.trim())
// 			.find(
// 				(c) =>
// 					c.startsWith("__Secure-next-auth.session-token=") ||
// 					c.startsWith("next-auth.session-token=")
// 			)
// 			?.split("=")[1] || null;

// 	let token: any = null;
// 	if (tokenCookie && process.env.AUTH_SECRET) {
// 		try {
// 			token = jwt.verify(tokenCookie, process.env.AUTH_SECRET);
// 		} catch (err) {
// 			token = null;
// 		}
// 	}

// 	const url = new URL(req.url);
// 	const pathname = url.pathname;
// 	const isLogged = !!token;

// 	if (pathname === "/login" && isLogged) {
// 		return NextResponse.redirect(new URL("/", req.url));
// 	}
// 	if (pathname.startsWith("/event/create") && !isLogged) {
// 		return NextResponse.redirect(new URL("/", req.url));
// 	}
// 	if (pathname.startsWith("/user/")) {
// 		const userId = pathname.split("/")[2];
// 		if (!isLogged) return NextResponse.redirect(new URL("/login", req.url));
// 		if (userId !== token.id)
// 			return NextResponse.redirect(new URL("/unauthorized", req.url));
// 	}

// 	return NextResponse.next();
// }

export default function proxy(req: NextRequest) {
	return NextResponse.next();
}

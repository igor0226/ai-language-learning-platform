import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

const sessionCookieName = "llp.sid";

function resolveAuthApiUrl(): string {
	const base =
		process.env.AUTH_API_URL ??
		process.env.NEXT_PUBLIC_API_URL ??
		"http://localhost:3001";
	return base.replace(/\/$/, "");
}

function isPublicPath(pathname: string): boolean {
	return pathname === "/login" || pathname.startsWith("/login/");
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
	const sessionCookie = request.cookies.get(sessionCookieName);
	if (!sessionCookie?.value) {
		return false;
	}

	try {
		const response = await fetch(`${resolveAuthApiUrl()}/api/auth/me`, {
			headers: {
				Cookie: `${sessionCookieName}=${sessionCookie.value}`,
			},
			cache: "no-store",
		});
		return response.ok;
	} catch {
		return false;
	}
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const authenticated = await hasValidSession(request);

	if (isPublicPath(pathname)) {
		if (authenticated) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
		return NextResponse.next();
	}

	if (authenticated) {
		return NextResponse.next();
	}

	const loginUrl = new URL("/login", request.url);
	if (pathname !== "/") {
		loginUrl.searchParams.set("next", pathname);
	}
	return NextResponse.redirect(loginUrl);
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

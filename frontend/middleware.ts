import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import {
	resolveAuthApiUrl,
	SESSION_COOKIE_NAME,
} from "@/shared/api/resolve-auth-api-url";
import {
	buildUnauthenticatedRedirect,
	isPublicPath,
	resolveAuthenticatedPublicRedirect,
} from "@/shared/lib/middleware-auth";

async function hasValidSession(request: NextRequest): Promise<boolean> {
	const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
	if (!sessionCookie?.value) {
		return false;
	}

	try {
		const response = await fetch(`${resolveAuthApiUrl()}/api/auth/me`, {
			headers: {
				Cookie: `${SESSION_COOKIE_NAME}=${sessionCookie.value}`,
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
	const origin = request.nextUrl.origin;

	if (isPublicPath(pathname)) {
		if (authenticated) {
			return NextResponse.redirect(resolveAuthenticatedPublicRedirect(origin));
		}
		return NextResponse.next();
	}

	if (authenticated) {
		return NextResponse.next();
	}

	return NextResponse.redirect(buildUnauthenticatedRedirect(pathname, origin));
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

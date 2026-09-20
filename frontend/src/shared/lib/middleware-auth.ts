export function isPublicPath(pathname: string): boolean {
	return pathname === "/login" || pathname.startsWith("/login/");
}

export function buildUnauthenticatedRedirect(
	pathname: string,
	origin: string,
): URL {
	const loginUrl = new URL("/login", origin);
	if (pathname !== "/") {
		loginUrl.searchParams.set("next", pathname);
	}
	return loginUrl;
}

export function resolveAuthenticatedPublicRedirect(origin: string): URL {
	return new URL("/dashboard", origin);
}

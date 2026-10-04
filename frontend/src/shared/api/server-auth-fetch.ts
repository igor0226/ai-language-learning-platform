import "server-only";

import { cookies } from "next/headers";

import { resolveAuthApiUrl, sessionCookieName } from "./resolve-auth-api-url";

export function serverAuthFetch(
	path: string,
	init?: RequestInit,
): Promise<Response> {
	const sessionCookie = cookies().get(sessionCookieName);
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const url = `${resolveAuthApiUrl()}${normalizedPath}`;

	const headers = new Headers(init?.headers);
	if (sessionCookie?.value) {
		headers.set("Cookie", `${sessionCookieName}=${sessionCookie.value}`);
	}

	return fetch(url, {
		...init,
		headers,
		cache: "no-store",
	});
}

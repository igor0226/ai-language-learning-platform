import "server-only";

import { cookies } from "next/headers";

import { resolveAuthApiUrl, SESSION_COOKIE_NAME } from "./resolve-auth-api-url";

export function serverAuthFetch(
	path: string,
	init?: RequestInit,
): Promise<Response> {
	const sessionCookie = cookies().get(SESSION_COOKIE_NAME);
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const url = `${resolveAuthApiUrl()}${normalizedPath}`;

	const headers = new Headers(init?.headers);
	if (sessionCookie?.value) {
		headers.set("Cookie", `${SESSION_COOKIE_NAME}=${sessionCookie.value}`);
	}

	return fetch(url, {
		...init,
		headers,
		cache: "no-store",
	});
}

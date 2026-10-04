import { apiUrl } from "./api";

export type AuthFetchFn = (
	path: string,
	init?: RequestInit,
) => Promise<Response>;

export const authFetch: AuthFetchFn = (path, init) => {
	return fetch(apiUrl(path), {
		...init,
		credentials: "include",
	});
};

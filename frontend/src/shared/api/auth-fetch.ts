import { apiUrl } from "./api";

export function authFetch(path: string, init?: RequestInit): Promise<Response> {
	return fetch(apiUrl(path), {
		...init,
		credentials: "include",
	});
}

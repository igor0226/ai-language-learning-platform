import { type AuthUser, authUserSchema } from "@llp/contracts";

import { type AuthFetchFn, authFetch } from "@/shared/api/auth-fetch";

export class AuthRequiredError extends Error {
	constructor() {
		super("Authentication required");
		this.name = "AuthRequiredError";
	}
}

export async function fetchAuthMe(
	fetchImpl: AuthFetchFn = authFetch,
): Promise<AuthUser> {
	const response = await fetchImpl("/api/auth/me");
	if (response.status === 401) {
		throw new AuthRequiredError();
	}
	if (!response.ok) {
		throw new Error("Failed to load session");
	}
	return authUserSchema.parse(await response.json());
}

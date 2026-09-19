import { type AuthUser, authUserSchema } from "@llp/contracts";

import { authFetch } from "@/shared/api/auth-fetch";

export class AuthRequiredError extends Error {
	constructor() {
		super("Authentication required");
		this.name = "AuthRequiredError";
	}
}

export async function fetchAuthMe(): Promise<AuthUser> {
	const response = await authFetch("/api/auth/me");
	if (response.status === 401) {
		throw new AuthRequiredError();
	}
	if (!response.ok) {
		throw new Error("Failed to load session");
	}
	return authUserSchema.parse(await response.json());
}

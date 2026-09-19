import { authFetch } from "@/shared/api/auth-fetch";

export async function logout(): Promise<void> {
	const response = await authFetch("/api/auth/logout", { method: "POST" });
	if (!response.ok && response.status !== 204) {
		throw new Error("Failed to log out");
	}
}

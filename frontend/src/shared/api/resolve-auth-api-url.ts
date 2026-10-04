/** Nest API base for session checks and server-side auth fetches (matches middleware). */
export function resolveAuthApiUrl(): string {
	const base =
		process.env.AUTH_API_URL ??
		process.env.NEXT_PUBLIC_API_URL ??
		"http://localhost:3001";
	return base.replace(/\/$/, "");
}

export const sessionCookieName = "llp.sid";

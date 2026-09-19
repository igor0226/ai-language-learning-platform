export type AuthConfig = {
	googleClientId: string;
	googleClientSecret: string;
	googleRedirectUri: string;
	sessionSecret: string;
	sessionMaxAgeMs: number;
	secureCookies: boolean;
	successRedirectUrl: string;
	failureRedirectUrl: string;
	sessionCookieName: string;
};

function requireEnv(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(`${name} is required`);
	}
	return value;
}

function resolveSuccessRedirectUrl(): string {
	const explicit = process.env.AUTH_SUCCESS_REDIRECT?.trim();
	if (explicit) {
		return explicit;
	}
	const corsOrigin = process.env.CORS_ORIGIN?.trim() ?? "http://localhost:3000";
	return `${corsOrigin.replace(/\/$/, "")}/dashboard`;
}

function resolveFailureRedirectUrl(): string {
	const explicit = process.env.AUTH_FAILURE_REDIRECT?.trim();
	if (explicit) {
		return explicit;
	}
	const corsOrigin = process.env.CORS_ORIGIN?.trim() ?? "http://localhost:3000";
	return `${corsOrigin.replace(/\/$/, "")}/login?error=oauth`;
}

export function resolveAuthConfig(): AuthConfig {
	const corsOrigin = process.env.CORS_ORIGIN?.trim() ?? "http://localhost:3000";
	return {
		googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
		googleClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
		googleRedirectUri: requireEnv("GOOGLE_REDIRECT_URI"),
		sessionSecret: requireEnv("SESSION_SECRET"),
		sessionMaxAgeMs: Number(process.env.SESSION_MAX_AGE_MS ?? 1_209_600_000),
		secureCookies: corsOrigin.startsWith("https://"),
		successRedirectUrl: resolveSuccessRedirectUrl(),
		failureRedirectUrl: resolveFailureRedirectUrl(),
		sessionCookieName: "llp.sid",
	};
}

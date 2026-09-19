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

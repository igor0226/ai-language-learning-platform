import { timingSafeEqual } from "node:crypto";

export function resolveAgentApiSecret(): string {
	return process.env.SPEAKING_INTERNAL_API_SECRET?.trim() ?? "";
}

export function verifyAgentApiBearer(
	authorization: string | undefined,
): boolean {
	const secret = resolveAgentApiSecret();
	if (!secret) {
		return false;
	}

	const prefix = "Bearer ";
	if (!authorization?.startsWith(prefix)) {
		return false;
	}
	const token = authorization.slice(prefix.length).trim();
	if (!token) {
		return false;
	}

	const expected = Buffer.from(secret, "utf8");
	const actual = Buffer.from(token, "utf8");
	if (expected.length !== actual.length) {
		return false;
	}
	return timingSafeEqual(expected, actual);
}

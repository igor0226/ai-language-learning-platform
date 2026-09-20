import { randomUUID } from "node:crypto";

import { sign } from "cookie-signature";
import type { INestApplication } from "@nestjs/common";

import { createAppDataSource } from "@/database/data-source";
import type { UserRecord } from "@/storage/type";
import { UserRepositoryService } from "@/storage/user-repository.service";

export type E2eAuthSession = {
	user: UserRecord;
	cookie: string;
};

export function signedSessionCookie(sessionId: string): string {
	const secret =
		process.env.SESSION_SECRET ?? "test-session-secret-at-least-32-characters";
	return `llp.sid=s:${sign(sessionId, secret)}`;
}

export async function createE2eAuthSession(
	app: INestApplication,
	options?: {
		googleSub?: string;
		email?: string;
		name?: string;
		pictureUrl?: string | null;
	},
): Promise<E2eAuthSession> {
	const users = app.get(UserRepositoryService);
	const user = await users.upsertGoogleUser({
		googleSub: options?.googleSub ?? randomUUID(),
		email: options?.email ?? `test-${randomUUID()}@example.com`,
		name: options?.name ?? "Test User",
		pictureUrl: options?.pictureUrl ?? null,
	});

	const sessionId = randomUUID();
	const expire = new Date(Date.now() + 3_600_000);
	const sessionPayload = {
		cookie: {
			originalMaxAge: 3_600_000,
			expires: expire.toISOString(),
			secure: false,
			httpOnly: true,
			path: "/",
			sameSite: "lax",
		},
		passport: { user: user.id },
	};

	const dataSource = createAppDataSource();
	await dataSource.initialize();
	await dataSource.query(
		`INSERT INTO "session" ("sid", "sess", "expire") VALUES ($1, $2, $3)`,
		[sessionId, sessionPayload, expire],
	);
	await dataSource.destroy();

	return { user, cookie: signedSessionCookie(sessionId) };
}

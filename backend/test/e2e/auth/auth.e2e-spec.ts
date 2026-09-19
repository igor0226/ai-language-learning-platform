import { randomUUID } from "node:crypto";

import { sign } from "cookie-signature";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { UserRepositoryService } from "@/storage/user-repository.service";
import { createTestApp } from "../../create-test-app";
import { resetPostgresTables } from "../../postgres-test-setup";
import { setupE2eStorage, teardownE2eStorage } from "../../setup-e2e";
import type { INestApplication } from "@nestjs/common";

function signedSessionCookie(sessionId: string): string {
	const secret =
		process.env.SESSION_SECRET ?? "test-session-secret-at-least-32-characters";
	return `llp.sid=s:${sign(sessionId, secret)}`;
}

describe("Auth (e2e)", () => {
	let app: INestApplication;
	let users: UserRepositoryService;

	beforeAll(async () => {
		await setupE2eStorage();
		await resetPostgresTables();
		({ app } = await createTestApp());
		users = app.get(UserRepositoryService);
	});

	afterAll(async () => {
		await app.close();
		await teardownE2eStorage();
	});

	it("GET /api/auth/me returns 401 without a session", async () => {
		const response = await request(app.getHttpServer()).get("/api/auth/me");
		expect(response.status).toBe(401);
	});

	it("GET /api/auth/me returns the authenticated user for a valid session", async () => {
		const user = await users.upsertGoogleUser({
			googleSub: "google-sub-123",
			email: "learner@example.com",
			name: "Learner",
			pictureUrl: "https://example.com/avatar.png",
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

		const { createAppDataSource } = await import(
			"../../../src/database/data-source.js"
		);
		const dataSource = createAppDataSource();
		await dataSource.initialize();
		await dataSource.query(
			`INSERT INTO "session" ("sid", "sess", "expire") VALUES ($1, $2, $3)`,
			[sessionId, sessionPayload, expire],
		);
		await dataSource.destroy();

		const response = await request(app.getHttpServer())
			.get("/api/auth/me")
			.set("Cookie", [signedSessionCookie(sessionId)]);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			id: user.id,
			email: user.email,
			name: user.name,
			pictureUrl: user.pictureUrl,
		});
	});

	it("POST /api/auth/logout clears the session cookie", async () => {
		const user = await users.upsertGoogleUser({
			googleSub: "google-sub-logout",
			email: "logout@example.com",
			name: "Logout User",
			pictureUrl: null,
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

		const { createAppDataSource } = await import(
			"../../../src/database/data-source.js"
		);
		const dataSource = createAppDataSource();
		await dataSource.initialize();
		await dataSource.query(
			`INSERT INTO "session" ("sid", "sess", "expire") VALUES ($1, $2, $3)`,
			[sessionId, sessionPayload, expire],
		);
		await dataSource.destroy();

		const agent = request.agent(app.getHttpServer());
		const logoutResponse = await agent
			.post("/api/auth/logout")
			.set("Cookie", [signedSessionCookie(sessionId)]);

		expect(logoutResponse.status).toBe(204);

		const meResponse = await agent.get("/api/auth/me");
		expect(meResponse.status).toBe(401);
	});
});

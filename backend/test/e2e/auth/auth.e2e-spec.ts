import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTestApp } from "../../create-test-app";
import { createE2eAuthSession } from "../../helpers/e2e-auth-session";
import { resetPostgresTables } from "../../postgres-test-setup";
import { setupE2eStorage, teardownE2eStorage } from "../../setup-e2e";
import type { INestApplication } from "@nestjs/common";

describe("Auth (e2e)", () => {
	let app: INestApplication;

	beforeAll(async () => {
		await setupE2eStorage();
		await resetPostgresTables();
		({ app } = await createTestApp());
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
		const { user, cookie } = await createE2eAuthSession(app, {
			googleSub: "google-sub-123",
			email: "learner@example.com",
			name: "Learner",
			pictureUrl: "https://example.com/avatar.png",
		});

		const response = await request(app.getHttpServer())
			.get("/api/auth/me")
			.set("Cookie", [cookie]);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			id: user.id,
			email: user.email,
			name: user.name,
			pictureUrl: user.pictureUrl,
		});
	});

	it("POST /api/auth/logout clears the session cookie", async () => {
		const { cookie } = await createE2eAuthSession(app, {
			googleSub: "google-sub-logout",
			email: "logout@example.com",
			name: "Logout User",
			pictureUrl: null,
		});

		const agent = request.agent(app.getHttpServer());
		const logoutResponse = await agent
			.post("/api/auth/logout")
			.set("Cookie", [cookie]);

		expect(logoutResponse.status).toBe(204);

		const meResponse = await agent.get("/api/auth/me");
		expect(meResponse.status).toBe(401);
	});
});

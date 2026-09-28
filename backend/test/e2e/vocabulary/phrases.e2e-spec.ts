import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTestApp } from "../../create-test-app";
import { createE2eAuthSession } from "../../helpers/e2e-auth-session";
import { resetPostgresTables } from "../../postgres-test-setup";
import { setupE2eStorage, teardownE2eStorage } from "../../setup-e2e";
import type { INestApplication } from "@nestjs/common";

describe("Vocabulary phrases (e2e)", () => {
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

	it("GET /api/vocabulary/phrases returns 401 without a session", async () => {
		const response = await request(app.getHttpServer()).get(
			"/api/vocabulary/phrases",
		);
		expect(response.status).toBe(401);
	});

	it("supports CRUD for the authenticated user", async () => {
		const { cookie } = await createE2eAuthSession(app, {
			googleSub: "vocab-user",
			email: "vocab-user@example.com",
		});

		const empty = await request(app.getHttpServer())
			.get("/api/vocabulary/phrases")
			.set("Cookie", [cookie]);
		expect(empty.status).toBe(200);
		expect(empty.body).toEqual({ phrases: [] });

		const created = await request(app.getHttpServer())
			.post("/api/vocabulary/phrases")
			.set("Cookie", [cookie])
			.send({
				term: "Break the ice",
				cefr: "B2",
				definition: "Start a conversation in a friendly way.",
				exampleSentence: "He told a joke to break the ice.",
			});
		expect(created.status).toBe(201);
		expect(created.body).toMatchObject({
			term: "Break the ice",
			cefr: "B2",
		});

		const phraseId = created.body.id as string;

		const listed = await request(app.getHttpServer())
			.get("/api/vocabulary/phrases")
			.set("Cookie", [cookie]);
		expect(listed.body.phrases).toHaveLength(1);

		const updated = await request(app.getHttpServer())
			.patch(`/api/vocabulary/phrases/${phraseId}`)
			.set("Cookie", [cookie])
			.send({ definition: "Start a social conversation." });
		expect(updated.status).toBe(200);
		expect(updated.body.definition).toBe("Start a social conversation.");

		const deleted = await request(app.getHttpServer())
			.delete(`/api/vocabulary/phrases/${phraseId}`)
			.set("Cookie", [cookie]);
		expect(deleted.status).toBe(204);

		const afterDelete = await request(app.getHttpServer())
			.get("/api/vocabulary/phrases")
			.set("Cookie", [cookie]);
		expect(afterDelete.body.phrases).toHaveLength(0);
	});
});

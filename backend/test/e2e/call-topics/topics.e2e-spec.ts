import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTestApp } from "../../create-test-app";
import { createE2eAuthSession } from "../../helpers/e2e-auth-session";
import { resetPostgresTables } from "../../postgres-test-setup";
import { setupE2eStorage, teardownE2eStorage } from "../../setup-e2e";
import type { INestApplication } from "@nestjs/common";

describe("Call topics (e2e)", () => {
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

	it("GET /api/speaking/topics returns 401 without a session", async () => {
		const response = await request(app.getHttpServer()).get(
			"/api/speaking/topics",
		);
		expect(response.status).toBe(401);
	});

	it("POST/PATCH/DELETE return 401 without a session", async () => {
		const post = await request(app.getHttpServer())
			.post("/api/speaking/topics")
			.send({
				title: "No session",
				level: "B1-B2",
				description: "Should fail.",
			});
		expect(post.status).toBe(401);

		const patch = await request(app.getHttpServer())
			.patch("/api/speaking/topics/topic-1")
			.send({ title: "No session" });
		expect(patch.status).toBe(401);

		const del = await request(app.getHttpServer()).delete(
			"/api/speaking/topics/topic-1",
		);
		expect(del.status).toBe(401);
	});

	it("lists default presets for a new user with no database rows", async () => {
		const { cookie } = await createE2eAuthSession(app, {
			googleSub: "topics-user-a",
			email: "topics-user-a@example.com",
		});

		const response = await request(app.getHttpServer())
			.get("/api/speaking/topics")
			.set("Cookie", [cookie]);
		expect(response.status).toBe(200);
		expect(response.body.topics).toHaveLength(3);
		expect(response.body.topics.map((t: { id: string }) => t.id)).toEqual([
			"topic-2",
			"topic-1",
			"topic-3",
		]);
	});

	it("supports custom CRUD and isolates catalog edits per user", async () => {
		const { cookie: cookieA } = await createE2eAuthSession(app, {
			googleSub: "topics-user-b",
			email: "topics-user-b@example.com",
		});
		const { cookie: cookieB } = await createE2eAuthSession(app, {
			googleSub: "topics-user-c",
			email: "topics-user-c@example.com",
		});

		const created = await request(app.getHttpServer())
			.post("/api/speaking/topics")
			.set("Cookie", [cookieA])
			.send({
				title: "Startup pitch",
				level: "B2-C1",
				description: "Practice pitching a product idea.",
				suggestedDurationMins: 18,
			});
		expect(created.status).toBe(201);
		expect(created.body).toMatchObject({
			title: "Startup pitch",
			isCustom: true,
			suggestedDurationMins: 18,
		});
		const customId = created.body.id as string;

		const listed = await request(app.getHttpServer())
			.get("/api/speaking/topics")
			.set("Cookie", [cookieA]);
		expect(listed.body.topics[0]?.id).toBe(customId);

		const updatedCustom = await request(app.getHttpServer())
			.patch(`/api/speaking/topics/${customId}`)
			.set("Cookie", [cookieA])
			.send({ title: "Startup pitch v2" });
		expect(updatedCustom.status).toBe(200);
		expect(updatedCustom.body.title).toBe("Startup pitch v2");

		const patchedPreset = await request(app.getHttpServer())
			.patch("/api/speaking/topics/topic-2")
			.set("Cookie", [cookieA])
			.send({ title: "Life chat (edited)" });
		expect(patchedPreset.status).toBe(200);
		expect(patchedPreset.body.title).toBe("Life chat (edited)");
		expect(patchedPreset.body.isCustom).toBe(false);

		const userBList = await request(app.getHttpServer())
			.get("/api/speaking/topics")
			.set("Cookie", [cookieB]);
		const topic2ForB = userBList.body.topics.find(
			(t: { id: string }) => t.id === "topic-2",
		);
		expect(topic2ForB.title).toBe(
			"A simple conversation about life, work, and hobbies",
		);

		const deletedPreset = await request(app.getHttpServer())
			.delete("/api/speaking/topics/topic-3")
			.set("Cookie", [cookieA]);
		expect(deletedPreset.status).toBe(204);

		const afterHide = await request(app.getHttpServer())
			.get("/api/speaking/topics")
			.set("Cookie", [cookieA]);
		expect(
			afterHide.body.topics.some((t: { id: string }) => t.id === "topic-3"),
		).toBe(false);

		const deletedCustom = await request(app.getHttpServer())
			.delete(`/api/speaking/topics/${customId}`)
			.set("Cookie", [cookieA]);
		expect(deletedCustom.status).toBe(204);

		const revertedPreset = await request(app.getHttpServer())
			.patch("/api/speaking/topics/topic-2")
			.set("Cookie", [cookieA])
			.send({
				title: "A simple conversation about life, work, and hobbies",
				description:
					"Have a simple conversation about life, work, and hobbies.",
				level: "B1-B2",
				suggestedDurationMins: 10,
			});
		expect(revertedPreset.status).toBe(200);
		expect(revertedPreset.body.title).toBe(
			"A simple conversation about life, work, and hobbies",
		);
	});

	it("returns 404 when the topic is not in the authenticated user's library", async () => {
		const { cookie: ownerCookie } = await createE2eAuthSession(app, {
			googleSub: "topics-owner",
			email: "topics-owner@example.com",
		});
		const { cookie: otherCookie } = await createE2eAuthSession(app, {
			googleSub: "topics-other",
			email: "topics-other@example.com",
		});

		const created = await request(app.getHttpServer())
			.post("/api/speaking/topics")
			.set("Cookie", [ownerCookie])
			.send({
				title: "Owner only",
				level: "B1-B2",
				description: "Not visible to other users.",
			});
		expect(created.status).toBe(201);
		const ownerCustomId = created.body.id as string;

		const otherPatchCustom = await request(app.getHttpServer())
			.patch(`/api/speaking/topics/${ownerCustomId}`)
			.set("Cookie", [otherCookie])
			.send({ title: "Stolen edit" });
		expect(otherPatchCustom.status).toBe(404);

		const otherDeleteCustom = await request(app.getHttpServer())
			.delete(`/api/speaking/topics/${ownerCustomId}`)
			.set("Cookie", [otherCookie]);
		expect(otherDeleteCustom.status).toBe(404);

		const unknownId = "00000000-0000-4000-8000-000000000000";
		const patchUnknown = await request(app.getHttpServer())
			.patch(`/api/speaking/topics/${unknownId}`)
			.set("Cookie", [ownerCookie])
			.send({ title: "Missing" });
		expect(patchUnknown.status).toBe(404);

		const deleteUnknown = await request(app.getHttpServer())
			.delete(`/api/speaking/topics/${unknownId}`)
			.set("Cookie", [ownerCookie]);
		expect(deleteUnknown.status).toBe(404);

		const hidePreset = await request(app.getHttpServer())
			.delete("/api/speaking/topics/topic-3")
			.set("Cookie", [ownerCookie]);
		expect(hidePreset.status).toBe(204);

		const patchHidden = await request(app.getHttpServer())
			.patch("/api/speaking/topics/topic-3")
			.set("Cookie", [ownerCookie])
			.send({ title: "Still hidden" });
		expect(patchHidden.status).toBe(404);

		const deleteHiddenAgain = await request(app.getHttpServer())
			.delete("/api/speaking/topics/topic-3")
			.set("Cookie", [ownerCookie]);
		expect(deleteHiddenAgain.status).toBe(404);

		const ownerStillHasCustom = await request(app.getHttpServer())
			.get("/api/speaking/topics")
			.set("Cookie", [ownerCookie]);
		expect(
			ownerStillHasCustom.body.topics.some(
				(t: { id: string }) => t.id === ownerCustomId,
			),
		).toBe(true);

		const otherList = await request(app.getHttpServer())
			.get("/api/speaking/topics")
			.set("Cookie", [otherCookie]);
		expect(
			otherList.body.topics.some((t: { id: string }) => t.id === ownerCustomId),
		).toBe(false);
	});
});

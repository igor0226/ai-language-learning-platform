import request from "supertest";
import { describe, expect, it } from "vitest";

import { seedReadyVideo } from "../../fixtures/seed-ready-video";
import { createE2eAuthSession } from "../../helpers/e2e-auth-session";
import { useE2eApp } from "../helpers/e2e-lifecycle";

describe("Videos status (e2e)", () => {
	const { getApp, getBlobStorage } = useE2eApp();

	it("GET /api/videos/:id/status returns 401 without a session", async () => {
		const response = await request(getApp().getHttpServer()).get(
			"/api/videos/unknown-video-id/status",
		);

		expect(response.status).toBe(401);
	});

	it("GET /api/videos/:id/status returns 404 for unknown video", async () => {
		const { cookie } = await createE2eAuthSession(getApp());

		const response = await request(getApp().getHttpServer())
			.get("/api/videos/unknown-video-id/status")
			.set("Cookie", [cookie]);

		expect(response.status).toBe(404);
	});

	it("GET /api/videos/:id/status returns ready video metadata", async () => {
		const { user, cookie } = await createE2eAuthSession(getApp());
		const { videoId } = await seedReadyVideo(getBlobStorage(), {
			userId: user.id,
		});

		const response = await request(getApp().getHttpServer())
			.get(`/api/videos/${videoId}/status`)
			.set("Cookie", [cookie]);

		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			id: videoId,
			status: "ready",
			playable: true,
			chunkCount: 1,
			processingStep: "completed",
		});
		expect(response.body.processingHistory).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ step: "completed", status: "completed" }),
			]),
		);
	});
});

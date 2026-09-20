import request from "supertest";
import { describe, expect, it } from "vitest";

import { seedReadyVideo } from "../../fixtures/seed-ready-video";
import { createE2eAuthSession } from "../../helpers/e2e-auth-session";
import { useE2eApp } from "../helpers/e2e-lifecycle";

describe("DASH segments (e2e)", () => {
	const { getApp, getBlobStorage } = useE2eApp();

	it("GET /api/dash/:id/segment/* returns 401 without a session", async () => {
		const { user } = await createE2eAuthSession(getApp());
		const { videoId, segmentFileName } = await seedReadyVideo(
			getBlobStorage(),
			{
				userId: user.id,
			},
		);

		const response = await request(getApp().getHttpServer()).get(
			`/api/dash/${videoId}/segment/${segmentFileName}`,
		);

		expect(response.status).toBe(401);
	});

	it("GET /api/dash/:id/segment/* serves segment bytes for ready videos", async () => {
		const { user, cookie } = await createE2eAuthSession(getApp());
		const { videoId, segmentFileName } = await seedReadyVideo(
			getBlobStorage(),
			{
				userId: user.id,
			},
		);

		const response = await request(getApp().getHttpServer())
			.get(`/api/dash/${videoId}/segment/${segmentFileName}`)
			.set("Cookie", [cookie]);

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toContain("video/iso.segment");
		expect(response.body.length).toBeGreaterThan(0);
	});
});

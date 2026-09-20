import request from "supertest";
import { describe, expect, it } from "vitest";

import { seedReadyVideo } from "../../fixtures/seed-ready-video";
import { createE2eAuthSession } from "../../helpers/e2e-auth-session";
import { useE2eApp } from "../helpers/e2e-lifecycle";

describe("Videos list ready playback (e2e)", () => {
	const { getApp, getBlobStorage } = useE2eApp();

	it("GET /api/videos includes playable entries with dashManifestUrl", async () => {
		const { user, cookie } = await createE2eAuthSession(getApp());
		const { videoId, title } = await seedReadyVideo(getBlobStorage(), {
			userId: user.id,
		});

		const response = await request(getApp().getHttpServer())
			.get("/api/videos")
			.set("Cookie", [cookie]);

		expect(response.status).toBe(200);
		expect(response.body.videos).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: videoId,
					title,
					status: "ready",
					playable: true,
					processingStep: "completed",
					queuePosition: null,
					dashManifestUrl: `/api/dash/${videoId}/manifest`,
				}),
			]),
		);
	});
});

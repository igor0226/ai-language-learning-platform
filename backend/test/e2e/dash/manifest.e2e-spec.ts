import request from "supertest";
import { describe, expect, it } from "vitest";

import { seedReadyVideo } from "../../fixtures/seed-ready-video";
import { createE2eAuthSession } from "../../helpers/e2e-auth-session";
import { useE2eApp } from "../helpers/e2e-lifecycle";

describe("DASH manifest (e2e)", () => {
	const { getApp, getBlobStorage } = useE2eApp();

	it("GET /api/dash/:id/manifest.mpd returns 404 for pending videos", async () => {
		const { cookie } = await createE2eAuthSession(getApp());

		const uploadResponse = await request(getApp().getHttpServer())
			.post("/api/videos/upload")
			.set("Cookie", [cookie])
			.field("title", "Pending for manifest")
			.field("sourceLanguage", "English")
			.field("explanationLanguage", "English")
			.field("languageLevel", "B1")
			.attach("file", Buffer.from("fake-video-bytes"), {
				filename: "clip.mp4",
				contentType: "video/mp4",
			});

		const pendingId = uploadResponse.body.id as string;

		const response = await request(getApp().getHttpServer()).get(
			`/api/dash/${pendingId}/manifest.mpd`,
		);

		expect(response.status).toBe(404);
	});

	it("GET /api/dash/:id/manifest.mpd serves rewritten manifest for ready videos", async () => {
		const { user } = await createE2eAuthSession(getApp());
		const { videoId } = await seedReadyVideo(getBlobStorage(), {
			userId: user.id,
		});

		const response = await request(getApp().getHttpServer()).get(
			`/api/dash/${videoId}/manifest.mpd`,
		);

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toContain("application/dash+xml");
		expect(response.text).toContain(
			`<BaseURL>/api/dash/${videoId}/segment/</BaseURL>`,
		);
		expect(response.text).toContain("<SegmentTemplate");
	});
});

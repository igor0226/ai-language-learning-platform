import request from "supertest";
import { describe, expect, it } from "vitest";

import { createE2eAuthSession } from "../../helpers/e2e-auth-session";
import { useE2eApp } from "../helpers/e2e-lifecycle";

describe("Videos list (e2e)", () => {
	const { getApp } = useE2eApp();

	it("GET /api/videos returns 401 without a session", async () => {
		const response = await request(getApp().getHttpServer()).get("/api/videos");
		expect(response.status).toBe(401);
	});

	it("GET /api/videos returns an empty list on fresh storage", async () => {
		const { cookie } = await createE2eAuthSession(getApp());

		const response = await request(getApp().getHttpServer())
			.get("/api/videos")
			.set("Cookie", [cookie]);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ videos: [] });
	});
});

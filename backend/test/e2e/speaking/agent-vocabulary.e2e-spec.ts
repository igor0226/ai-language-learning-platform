import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AgentDispatchService } from "@/speaking/agent-dispatch.service";
import { LivekitRoomService } from "@/speaking/livekit-room.service";
import { LivekitWebhookService } from "@/speaking/livekit-webhook.service";
import { createTestApp } from "../../create-test-app";
import { createE2eAuthSession } from "../../helpers/e2e-auth-session";
import { resetPostgresTables } from "../../postgres-test-setup";
import { setupE2eStorage, teardownE2eStorage } from "../../setup-e2e";
import type { INestApplication } from "@nestjs/common";

const AGENT_SECRET = "e2e-speaking-agent-secret";

describe("Agent speaking vocabulary (e2e)", () => {
	let app: INestApplication;

	beforeAll(async () => {
		process.env.SPEAKING_INTERNAL_API_SECRET = AGENT_SECRET;
		await setupE2eStorage();
		await resetPostgresTables();
		({ app } = await createTestApp({
			override: (builder) =>
				builder
					.overrideProvider(LivekitRoomService)
					.useValue({
						createRoom: vi.fn(async () => undefined),
						deleteRoom: vi.fn(async () => undefined),
						removeParticipant: vi.fn(async () => undefined),
						roomExists: vi.fn(async () => true),
					})
					.overrideProvider(AgentDispatchService)
					.useValue({
						createDispatch: vi.fn(async () => ({ id: "disp-1" })),
					})
					.overrideProvider(LivekitWebhookService)
					.useValue({
						handleWebhook: vi.fn(async () => ({ ok: true })),
					}),
		}));
	});

	afterAll(async () => {
		await app.close();
		await teardownE2eStorage();
	});

	it("rejects agent vocabulary routes without bearer auth", async () => {
		const response = await request(app.getHttpServer()).get(
			"/api/agent/speaking/calls/00000000-0000-4000-8000-000000000001/vocabulary",
		);
		expect(response.status).toBe(401);
	});

	it("lists and adds vocabulary for the call owner", async () => {
		const { cookie } = await createE2eAuthSession(app, {
			googleSub: "agent-vocab-user",
			email: "agent-vocab-user@example.com",
		});

		const created = await request(app.getHttpServer())
			.post("/api/speaking/calls")
			.set("Cookie", [cookie])
			.send({ sourceLanguage: "English", languageLevel: "B1" });
		expect(created.status).toBe(201);
		const callId = created.body.callId as string;

		const empty = await request(app.getHttpServer())
			.get(`/api/agent/speaking/calls/${callId}/vocabulary`)
			.set("Authorization", `Bearer ${AGENT_SECRET}`);
		expect(empty.status).toBe(200);
		expect(empty.body).toEqual({ phrases: [] });

		const added = await request(app.getHttpServer())
			.post(`/api/agent/speaking/calls/${callId}/vocabulary`)
			.set("Authorization", `Bearer ${AGENT_SECRET}`)
			.send({
				term: "Run into",
				cefr: "b2",
				definition: "Meet someone unexpectedly.",
			});
		expect(added.status).toBe(201);
		expect(added.body).toMatchObject({
			status: "added",
			phrase: { term: "Run into", cefr: "B2" },
		});

		const duplicate = await request(app.getHttpServer())
			.post(`/api/agent/speaking/calls/${callId}/vocabulary`)
			.set("Authorization", `Bearer ${AGENT_SECRET}`)
			.send({
				term: " run into ",
				cefr: "B2",
				definition: "Duplicate.",
			});
		expect(duplicate.status).toBe(201);
		expect(duplicate.body).toEqual({
			status: "already_in_deck",
			term: "Run into",
		});
	});
});

import { describe, expect, it, vi } from "vitest";
import { HealthService } from "./health.service";

describe("readiness and shutdown", () => {
	it("fails readiness when the database cannot answer", async () => {
		const database = {
			isInitialized: true,
			query: vi.fn().mockRejectedValue(new Error("offline")),
		};
		const health = new HealthService(database as never, {} as never);
		expect(await health.ready()).toBe(false);
	});
	it("waits for the HTTP server to drain and stops reporting ready", async () => {
		let finish!: () => void;
		const server = {
			listening: true,
			close: vi.fn((callback: () => void) => {
				finish = callback;
			}),
		};
		const database = {
			isInitialized: true,
			query: vi.fn().mockResolvedValue([]),
		};
		const adapter = { httpAdapter: { getHttpServer: () => server } };
		const health = new HealthService(database as never, adapter as never);
		expect(await health.ready()).toBe(true);
		let closed = false;
		const shutdown = health.onModuleDestroy().then(() => {
			closed = true;
		});
		expect(await health.ready()).toBe(false);
		expect(closed).toBe(false);
		finish();
		await shutdown;
		expect(closed).toBe(true);
	});
});

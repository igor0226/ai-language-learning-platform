import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StaleCallWorkerService } from "./stale-call-worker.service";

const { start, stop, cronJob } = vi.hoisted(() => ({
	start: vi.fn(),
	stop: vi.fn(),
	cronJob: vi.fn(),
}));

vi.mock("cron", () => ({
	CronJob: class {
		constructor(expression: string, onTick: () => void) {
			cronJob(expression, onTick);
		}

		start() {
			start();
		}

		stop() {
			stop();
		}
	},
}));

describe("StaleCallWorkerService", () => {
	const logger = { info: vi.fn(), error: vi.fn() };
	const cleanup = { sweep: vi.fn(async (): Promise<void> => undefined) };
	const previousEnabled = process.env.SPEAKING_STALE_CALL_CRON_ENABLED;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		if (previousEnabled === undefined) {
			delete process.env.SPEAKING_STALE_CALL_CRON_ENABLED;
			return;
		}
		process.env.SPEAKING_STALE_CALL_CRON_ENABLED = previousEnabled;
	});

	it("does not start when cron env is not true", () => {
		process.env.SPEAKING_STALE_CALL_CRON_ENABLED = "false";
		const worker = new StaleCallWorkerService(
			logger as never,
			cleanup as never,
		);
		Object.assign(worker, {
			locks: {
				runExclusive: async (_key: string, work: () => Promise<void>) => {
					await work();
					return true;
				},
			},
		});
		worker.onModuleInit();
		expect(cronJob).not.toHaveBeenCalled();
		expect(cleanup.sweep).not.toHaveBeenCalled();
	});

	it("starts the scheduler when cron env is true", async () => {
		process.env.SPEAKING_STALE_CALL_CRON_ENABLED = "true";
		const worker = new StaleCallWorkerService(
			logger as never,
			cleanup as never,
		);
		Object.assign(worker, {
			locks: {
				runExclusive: async (_key: string, work: () => Promise<void>) => {
					await work();
					return true;
				},
			},
		});
		worker.onModuleInit();
		expect(cronJob).toHaveBeenCalled();
		expect(start).toHaveBeenCalled();
		await vi.waitFor(() => expect(cleanup.sweep).toHaveBeenCalled());
	});

	it("stops the scheduler on module destroy", () => {
		process.env.SPEAKING_STALE_CALL_CRON_ENABLED = "true";
		const worker = new StaleCallWorkerService(
			logger as never,
			cleanup as never,
		);
		Object.assign(worker, {
			locks: {
				runExclusive: async (_key: string, work: () => Promise<void>) => {
					await work();
					return true;
				},
			},
		});
		worker.onModuleInit();
		worker.onModuleDestroy();
		expect(stop).toHaveBeenCalled();
	});
	it("waits for active cleanup and refuses new ticks during shutdown", async () => {
		process.env.SPEAKING_STALE_CALL_CRON_ENABLED = "true";
		let finish!: () => void;
		cleanup.sweep.mockImplementationOnce(
			() =>
				new Promise<void>((resolve) => {
					finish = resolve;
				}),
		);
		const worker = new StaleCallWorkerService(
			logger as never,
			cleanup as never,
		);
		Object.assign(worker, {
			locks: {
				runExclusive: async (_key: string, work: () => Promise<void>) => {
					await work();
					return true;
				},
			},
		});
		worker.onModuleInit();
		await vi.waitFor(() => expect(cleanup.sweep).toHaveBeenCalledOnce());
		let stopped = false;
		const shutdown = worker.onModuleDestroy().then(() => {
			stopped = true;
		});
		await Promise.resolve();
		expect(stopped).toBe(false);
		const tick = cronJob.mock.calls[0][1];
		tick();
		expect(cleanup.sweep).toHaveBeenCalledOnce();
		finish();
		await shutdown;
		expect(stopped).toBe(true);
	});
});

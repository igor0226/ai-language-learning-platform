import {
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { AdvisoryLockService } from "../database/advisory-lock.service";
import { CronJob } from "cron";
import { InjectPinoLogger, type PinoLogger } from "nestjs-pino";

import { StaleCallCleanupService } from "./stale-call-cleanup.service";
import {
	isStaleCallCronEnabled,
	resolveStaleCallCronExpression,
} from "./utils/stale-call-config";

@Injectable()
export class StaleCallWorkerService implements OnModuleDestroy, OnModuleInit {
	@Inject(AdvisoryLockService)
	private readonly locks!: AdvisoryLockService;
	private active: Promise<void> | undefined;
	private stopping = false;
	private started = false;
	private job: CronJob | undefined;

	constructor(
		@InjectPinoLogger(StaleCallWorkerService.name)
		private readonly logger: PinoLogger,
		private readonly cleanup: StaleCallCleanupService,
	) {}

	onModuleInit(): void {
		this.ensureStarted();
	}

	async onModuleDestroy(): Promise<void> {
		this.stopping = true;
		await this.job?.stop();
		await this.active;
	}

	private runWorkerTick(): Promise<void> {
		if (this.stopping || this.active) return Promise.resolve();
		this.active = this.executeTick().finally(() => {
			this.active = undefined;
		});
		return this.active;
	}

	private async executeTick(): Promise<void> {
		this.logger.info(
			{ tickStartedAt: new Date().toISOString() },
			"tick started",
		);

		try {
			await this.locks.runExclusive("stale-call-cleanup", async () => {
				await this.cleanup.sweep();
			});
			this.logger.info(
				{ completedAt: new Date().toISOString() },
				"tick completed",
			);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unexpected worker error";
			this.logger.error({ err: message }, "tick failed");
		}
	}

	private ensureStarted(): void {
		if (this.started) {
			this.logger.info("startup skipped (already initialized)");
			return;
		}

		if (!isStaleCallCronEnabled()) {
			this.logger.info("stale call cron disabled via env");
			return;
		}

		const cronExpression = resolveStaleCallCronExpression();
		this.logger.info({ cronExpression }, "starting cron scheduler");
		this.job = new CronJob(cronExpression, () => {
			void this.runWorkerTick();
		});

		this.job.start();
		this.started = true;
		this.logger.info("scheduler started");
		this.logger.info("running immediate startup tick");
		void this.runWorkerTick();
	}
}

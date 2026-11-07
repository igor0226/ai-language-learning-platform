import {
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { AdvisoryLockService } from "../database/advisory-lock.service";
import { CronJob } from "cron";
import { InjectPinoLogger, type PinoLogger } from "nestjs-pino";

import { JobsService } from "./jobs.service";

@Injectable()
export class ProcessingWorkerService implements OnModuleDestroy, OnModuleInit {
	@Inject(AdvisoryLockService)
	private readonly locks!: AdvisoryLockService;
	private active: Promise<void> | undefined;
	private stopping = false;
	private started = false;
	private job: CronJob | undefined;

	constructor(
		@InjectPinoLogger(ProcessingWorkerService.name)
		private readonly logger: PinoLogger,
		private readonly jobsService: JobsService,
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
		const tickStartedAt = new Date().toISOString();
		this.logger.info({ tickStartedAt }, "tick started");

		try {
			await this.locks.runExclusive("video-processing", async () => {
				await this.jobsService.processNextPendingVideo();
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

		if (process.env.VIDEO_PROCESSING_CRON_ENABLED !== "true") {
			this.logger.info("processing cron disabled via env");
			return;
		}

		const cronExpression = process.env.VIDEO_PROCESSOR_CRON ?? "*/15 * * * * *";
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

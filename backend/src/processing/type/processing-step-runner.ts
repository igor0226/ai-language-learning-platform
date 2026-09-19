import type { PinoLogger } from "nestjs-pino";

import type { ProcessingHistoryService, ProcessingStep } from "@/storage";

type StepRunnerDeps = {
	processingHistory: ProcessingHistoryService;
	logger: PinoLogger;
};

export type SkipProcessingStepInput<T> = {
	deps: StepRunnerDeps;
	videoId: string;
	step: ProcessingStep;
	logMessage: string;
	result: T;
};

export type ExecuteProcessingStepInput<T> = {
	deps: StepRunnerDeps;
	videoId: string;
	step: ProcessingStep;
	startLogMessage: string;
	run: () => Promise<T>;
};

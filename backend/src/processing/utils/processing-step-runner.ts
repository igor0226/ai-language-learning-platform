import type {
	ExecuteProcessingStepInput,
	SkipProcessingStepInput,
} from "../type/processing-step-runner";
import { StepFailedError } from "./processing-errors";

export async function skipProcessingStep<T>(
	input: SkipProcessingStepInput<T>,
): Promise<T> {
	const { deps, videoId, step, logMessage, result } = input;
	deps.logger.info({ videoId }, logMessage);
	await deps.processingHistory.recordStepComplete({
		videoId,
		step,
		message: "skipped (already present)",
	});
	return result;
}

export async function executeProcessingStep<T>(
	input: ExecuteProcessingStepInput<T>,
): Promise<T> {
	const { deps, videoId, step, startLogMessage, run } = input;
	deps.logger.info({ videoId }, startLogMessage);
	await deps.processingHistory.recordStepStart(videoId, step);

	try {
		const stepResult = await run();
		await deps.processingHistory.recordStepComplete({ videoId, step });
		return stepResult;
	} catch (error) {
		throw new StepFailedError(step, error);
	}
}

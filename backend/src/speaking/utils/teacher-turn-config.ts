import { inference } from "@livekit/agents";

export const DEFAULT_STT_MODEL = "gpt-4o-mini-transcribe";
export const DEFAULT_INTERRUPT_MIN_WORDS = 3;
export const DEFAULT_INTERRUPT_MIN_DURATION_MS = 1500;
export const DEFAULT_VAD_ACTIVATION_THRESHOLD = 0.65;
export const DEFAULT_VAD_MIN_SPEECH_MS = 400;

export function resolveSttModel(): string {
	return process.env.SPEAKING_STT_MODEL?.trim() || DEFAULT_STT_MODEL;
}

export function resolveInterruptMinWords(): number {
	const parsed = Number(
		process.env.SPEAKING_INTERRUPT_MIN_WORDS ?? DEFAULT_INTERRUPT_MIN_WORDS,
	);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return DEFAULT_INTERRUPT_MIN_WORDS;
	}
	return Math.floor(parsed);
}

export function resolveInterruptMinDurationMs(): number {
	const parsed = Number(
		process.env.SPEAKING_INTERRUPT_MIN_DURATION_MS ??
			DEFAULT_INTERRUPT_MIN_DURATION_MS,
	);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return DEFAULT_INTERRUPT_MIN_DURATION_MS;
	}
	return Math.floor(parsed);
}

export function resolveVadActivationThreshold(): number {
	const parsed = Number(
		process.env.SPEAKING_VAD_ACTIVATION_THRESHOLD ??
			DEFAULT_VAD_ACTIVATION_THRESHOLD,
	);
	if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 1) {
		return DEFAULT_VAD_ACTIVATION_THRESHOLD;
	}
	return parsed;
}

export function resolveVadMinSpeechMs(): number {
	const parsed = Number(
		process.env.SPEAKING_VAD_MIN_SPEECH_MS ?? DEFAULT_VAD_MIN_SPEECH_MS,
	);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return DEFAULT_VAD_MIN_SPEECH_MS;
	}
	return Math.floor(parsed);
}

export function buildTeacherVad() {
	return new inference.VAD({
		activationThreshold: resolveVadActivationThreshold(),
		minSpeechDuration: resolveVadMinSpeechMs(),
	});
}

export function buildTeacherInterruptionOptions() {
	return {
		minWords: resolveInterruptMinWords(),
		minDuration: resolveInterruptMinDurationMs(),
		resumeFalseInterruption: true,
	};
}

export function buildTeacherTurnHandling() {
	return {
		interruption: buildTeacherInterruptionOptions(),
	};
}

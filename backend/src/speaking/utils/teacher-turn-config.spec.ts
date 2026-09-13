import { afterEach, describe, expect, it } from "vitest";

import {
	DEFAULT_INTERRUPT_MIN_DURATION_MS,
	DEFAULT_INTERRUPT_MIN_WORDS,
	DEFAULT_STT_MODEL,
	DEFAULT_VAD_ACTIVATION_THRESHOLD,
	DEFAULT_VAD_MIN_SPEECH_MS,
	buildTeacherInterruptionOptions,
	resolveInterruptMinDurationMs,
	resolveInterruptMinWords,
	resolveSttModel,
	resolveVadActivationThreshold,
	resolveVadMinSpeechMs,
} from "./teacher-turn-config";

const speakingEnvKeys = [
	"SPEAKING_STT_MODEL",
	"SPEAKING_INTERRUPT_MIN_WORDS",
	"SPEAKING_INTERRUPT_MIN_DURATION_MS",
	"SPEAKING_VAD_ACTIVATION_THRESHOLD",
	"SPEAKING_VAD_MIN_SPEECH_MS",
] as const;

describe("teacher-turn-config", () => {
	const previousEnv = Object.fromEntries(
		speakingEnvKeys.map((key) => [key, process.env[key]]),
	) as Record<(typeof speakingEnvKeys)[number], string | undefined>;

	afterEach(() => {
		for (const key of speakingEnvKeys) {
			const value = previousEnv[key];
			if (value === undefined) {
				delete process.env[key];
				continue;
			}
			process.env[key] = value;
		}
	});

	it("uses moderate defaults when env is missing", () => {
		for (const key of speakingEnvKeys) {
			delete process.env[key];
		}

		expect(resolveSttModel()).toBe(DEFAULT_STT_MODEL);
		expect(resolveInterruptMinWords()).toBe(DEFAULT_INTERRUPT_MIN_WORDS);
		expect(resolveInterruptMinDurationMs()).toBe(
			DEFAULT_INTERRUPT_MIN_DURATION_MS,
		);
		expect(resolveVadActivationThreshold()).toBe(
			DEFAULT_VAD_ACTIVATION_THRESHOLD,
		);
		expect(resolveVadMinSpeechMs()).toBe(DEFAULT_VAD_MIN_SPEECH_MS);
		expect(buildTeacherInterruptionOptions()).toEqual({
			minWords: 3,
			minDuration: 1500,
			resumeFalseInterruption: true,
		});
	});

	it("reads env overrides", () => {
		process.env.SPEAKING_STT_MODEL = "gpt-4o-transcribe";
		process.env.SPEAKING_INTERRUPT_MIN_WORDS = "5";
		process.env.SPEAKING_INTERRUPT_MIN_DURATION_MS = "2000";
		process.env.SPEAKING_VAD_ACTIVATION_THRESHOLD = "0.7";
		process.env.SPEAKING_VAD_MIN_SPEECH_MS = "500";

		expect(resolveSttModel()).toBe("gpt-4o-transcribe");
		expect(buildTeacherInterruptionOptions()).toEqual({
			minWords: 5,
			minDuration: 2000,
			resumeFalseInterruption: true,
		});
		expect(resolveVadActivationThreshold()).toBe(0.7);
		expect(resolveVadMinSpeechMs()).toBe(500);
	});

	it("falls back when env values are invalid", () => {
		process.env.SPEAKING_INTERRUPT_MIN_WORDS = "-1";
		process.env.SPEAKING_INTERRUPT_MIN_DURATION_MS = "not-a-number";
		process.env.SPEAKING_VAD_ACTIVATION_THRESHOLD = "2";
		process.env.SPEAKING_VAD_MIN_SPEECH_MS = "-5";

		expect(resolveInterruptMinWords()).toBe(DEFAULT_INTERRUPT_MIN_WORDS);
		expect(resolveInterruptMinDurationMs()).toBe(
			DEFAULT_INTERRUPT_MIN_DURATION_MS,
		);
		expect(resolveVadActivationThreshold()).toBe(
			DEFAULT_VAD_ACTIVATION_THRESHOLD,
		);
		expect(resolveVadMinSpeechMs()).toBe(DEFAULT_VAD_MIN_SPEECH_MS);
	});
});

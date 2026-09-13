import {
	type EmotionSource,
	emotionIntensitySchema,
	emotionSourceSchema,
	isTeacherEmotion,
	type TeacherEmotionMessage,
} from "@llp/contracts";

import { isRecord } from "@/shared/lib";

export function parseEmotionMessage(
	payload: Uint8Array,
): TeacherEmotionMessage | null {
	const parsed = decodeJson(payload);
	if (!isRecord(parsed) || !isTeacherEmotion(parsed.emotion)) {
		return null;
	}
	const source = resolveEmotionSource(parsed.source);
	if (!source) {
		return null;
	}
	const intensity = parseIntensity(parsed.intensity);
	if (intensity === undefined) {
		return { emotion: parsed.emotion, source };
	}
	return { emotion: parsed.emotion, source, intensity };
}

function decodeJson(payload: Uint8Array): unknown {
	try {
		return JSON.parse(new TextDecoder().decode(payload));
	} catch {
		return null;
	}
}

function resolveEmotionSource(value: unknown): EmotionSource | null {
	if (value === undefined) {
		return "reply";
	}
	const parsed = emotionSourceSchema.safeParse(value);
	return parsed.success ? parsed.data : null;
}

function parseIntensity(value: unknown): TeacherEmotionMessage["intensity"] {
	const intensity = typeof value === "string" ? Number(value) : value;
	const parsed = emotionIntensitySchema.safeParse(intensity);
	return parsed.success ? parsed.data : undefined;
}

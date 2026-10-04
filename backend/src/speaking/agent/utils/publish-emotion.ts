import {
	TEACHER_EMOTION_TOPIC,
	emotionIntensitySchema,
	isTeacherEmotion,
	type EmotionSource,
	type TeacherEmotionMessage,
} from "@llp/contracts";

export type EmotionPublisher = {
	publishData: (
		data: Uint8Array,
		options: { reliable: boolean; topic: string },
	) => Promise<void> | void;
};

export function parseEmotionIntensity(
	value: unknown,
): TeacherEmotionMessage["intensity"] {
	const parsed = emotionIntensitySchema.safeParse(value);
	return parsed.success ? parsed.data : undefined;
}

export function normalizeEmotionMessage(input: {
	emotion?: unknown;
	intensity?: unknown;
	source: EmotionSource;
}): TeacherEmotionMessage {
	const emotion = isTeacherEmotion(input.emotion) ? input.emotion : "neutral";
	const intensity = parseEmotionIntensity(input.intensity);
	if (intensity === undefined) {
		return { emotion, source: input.source };
	}
	return { emotion, intensity, source: input.source };
}

export async function publishEmotion(input: {
	publisher: EmotionPublisher;
	message: {
		emotion?: unknown;
		intensity?: unknown;
		source: EmotionSource;
	};
}): Promise<TeacherEmotionMessage> {
	const payload = normalizeEmotionMessage(input.message);
	const bytes = new TextEncoder().encode(JSON.stringify(payload));
	await input.publisher.publishData(bytes, {
		reliable: true,
		topic: TEACHER_EMOTION_TOPIC,
	});
	return payload;
}

export function requireEmotionPublisher(
	participant: EmotionPublisher | undefined,
): EmotionPublisher {
	if (!participant) {
		throw new Error("LiveKit local participant is not available");
	}
	return participant;
}

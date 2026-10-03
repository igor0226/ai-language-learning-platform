import { llm, log } from "@livekit/agents";
import { emotionIntensitySchema, teacherEmotionSchema } from "@llp/contracts";
import { z } from "zod";

import {
	type EmotionPublisher,
	publishEmotion,
} from "../utils/publish-emotion";

const emotionToolSchema = z.object({
	emotion: teacherEmotionSchema,
	intensity: emotionIntensitySchema.optional(),
});

export function createSetEmotionTool(publisher: EmotionPublisher) {
	return llm.tool({
		description:
			"Silently update the teacher's on-screen facial emotion during the reply. Never mention this tool, the emotion name, or your face in spoken audio.",
		parameters: emotionToolSchema,
		execute: async ({ emotion, intensity }) => {
			void publishReplyEmotion({ publisher, emotion, intensity });
			return { ok: true };
		},
	});
}

async function publishReplyEmotion(input: {
	publisher: EmotionPublisher;
	emotion: string;
	intensity?: number;
}): Promise<void> {
	try {
		await publishEmotion({
			publisher: input.publisher,
			message: {
				emotion: input.emotion,
				intensity: input.intensity,
				source: "reply",
			},
		});
	} catch (error) {
		reportEmotionFailure({ emotion: input.emotion, error });
	}
}

function reportEmotionFailure(input: {
	emotion: string;
	error?: unknown;
}): void {
	try {
		log().error(input, "emotion publish failed");
	} catch {
		// The agent CLI initializes the logger. A missing logger must not fail the publish.
	}
}

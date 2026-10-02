import { llm } from "@livekit/agents";
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
		execute: async ({ emotion, intensity }, { ctx }) => {
			await ctx.update("ok");
			await publishEmotion({
				publisher,
				message: { emotion, intensity, source: "reply" },
			});
			return undefined;
		},
	});
}

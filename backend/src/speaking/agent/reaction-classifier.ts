import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import {
	EmotionIntensity,
	emotionIntensitySchema,
	teacherEmotionSchema,
} from "@llp/contracts";

const ReactionSchema = z.object({
	emotion: teacherEmotionSchema,
	intensity: emotionIntensitySchema,
});

export type ReactionClassification = z.infer<typeof ReactionSchema>;

const REACTION_MODEL = "gpt-4o-mini";

export class ReactionClassifier {
	private openaiClient: OpenAI | null = null;

	async classify(utterance: string): Promise<ReactionClassification> {
		const text = utterance.trim();
		if (!text) {
			return { emotion: "thoughtful", intensity: EmotionIntensity.Low };
		}
		const apiKey = process.env.OPENAI_API_KEY?.trim();
		if (!apiKey) {
			return { emotion: "thoughtful", intensity: EmotionIntensity.Low };
		}
		const client = this.getOpenAiClient(apiKey);
		const response = await client.responses.parse({
			model: REACTION_MODEL,
			input: [
				{
					role: "system",
					content:
						"Classify the learner's latest spoken utterance into one teacher facial emotion. Pick the emotion a supportive language teacher would show while silently listening.",
				},
				{ role: "user", content: text },
			],
			text: {
				format: zodTextFormat(ReactionSchema, "teacher_reaction"),
			},
		});
		return (
			response.output_parsed ?? {
				emotion: "thoughtful",
				intensity: EmotionIntensity.Low,
			}
		);
	}

	private getOpenAiClient(apiKey: string): OpenAI {
		if (!this.openaiClient) {
			this.openaiClient = new OpenAI({ apiKey });
		}
		return this.openaiClient;
	}
}

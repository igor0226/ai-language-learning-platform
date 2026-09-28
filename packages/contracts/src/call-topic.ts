import { z } from "zod";

export const CALL_TOPIC_LEVELS = [
	"A2-B1",
	"B1-B2",
	"B2-C1",
	"C1-C2",
] as const;

export const callTopicLevelSchema = z.enum(CALL_TOPIC_LEVELS);

export type CallTopicLevel = z.infer<typeof callTopicLevelSchema>;

export const callTopicSchema = z.object({
	id: z.string().min(1),
	title: z.string(),
	level: callTopicLevelSchema,
	description: z.string(),
	suggestedDurationMins: z.number().int().min(5).max(60),
	isCustom: z.boolean(),
	createdAt: z.string(),
});

export type CallTopic = z.infer<typeof callTopicSchema>;

export const callTopicListSchema = z.object({
	topics: z.array(callTopicSchema),
});

export type CallTopicList = z.infer<typeof callTopicListSchema>;

const trimmedTitle = z.string().trim().min(1).max(200);
const trimmedDescription = z.string().trim().min(1).max(4000);
const durationMins = z.number().int().min(5).max(60);

export const createCallTopicBodySchema = z.object({
	title: trimmedTitle,
	level: callTopicLevelSchema,
	description: trimmedDescription,
	suggestedDurationMins: durationMins.optional(),
});

export type CreateCallTopicBody = z.infer<typeof createCallTopicBodySchema>;

export const updateCallTopicBodySchema = z
	.object({
		title: trimmedTitle.optional(),
		level: callTopicLevelSchema.optional(),
		description: trimmedDescription.optional(),
		suggestedDurationMins: durationMins.optional(),
	})
	.refine(
		(body) =>
			body.title !== undefined ||
			body.level !== undefined ||
			body.description !== undefined ||
			body.suggestedDurationMins !== undefined,
		{ message: "At least one field must be provided" },
	);

export type UpdateCallTopicBody = z.infer<typeof updateCallTopicBodySchema>;

import { z } from "zod";

import {
	languageLevelInputSchema,
	languageLevelSchema,
} from "./language-level";

export const TEACHER_VOCABULARY_TOPIC = "teacher-vocabulary";

export const teacherVocabularyMessageSchema = z.object({
	term: z.string(),
	cefr: languageLevelSchema,
	definition: z.string(),
	exampleSentence: z.string().optional(),
});

export type TeacherVocabularyMessage = z.infer<
	typeof teacherVocabularyMessageSchema
>;

export const agentAddVocabularyBodySchema = z.object({
	term: z.string().trim().min(1),
	cefr: languageLevelInputSchema,
	definition: z.string().trim().min(1),
	exampleSentence: z.string().trim().min(1).optional(),
});

export type AgentAddVocabularyBody = z.infer<
	typeof agentAddVocabularyBodySchema
>;

export const agentAddVocabularyResultSchema = z.discriminatedUnion("status", [
	z.object({
		status: z.literal("added"),
		phrase: z.object({
			id: z.string().uuid(),
			term: z.string(),
			cefr: languageLevelSchema,
			definition: z.string(),
			exampleSentence: z.string().optional(),
			savedAt: z.string(),
		}),
	}),
	z.object({
		status: z.literal("already_in_deck"),
		term: z.string(),
	}),
]);

export type AgentAddVocabularyResult = z.infer<
	typeof agentAddVocabularyResultSchema
>;

import { z } from "zod";

import { languageLevelInputSchema, languageLevelSchema } from "./language-level";

export const vocabularyPhraseSchema = z.object({
	id: z.string().uuid(),
	term: z.string(),
	cefr: languageLevelSchema,
	definition: z.string(),
	exampleSentence: z.string().optional(),
	savedAt: z.string(),
});

export type VocabularyPhrase = z.infer<typeof vocabularyPhraseSchema>;

export const vocabularyPhraseListSchema = z.object({
	phrases: z.array(vocabularyPhraseSchema),
});

export type VocabularyPhraseList = z.infer<typeof vocabularyPhraseListSchema>;

const optionalTrimmedString = z.preprocess(
	(value) => (typeof value === "string" ? value.trim() : value),
	z.string().optional(),
);

export const createVocabularyPhraseBodySchema = z.object({
	term: z.string().trim().min(1),
	cefr: languageLevelInputSchema,
	definition: z.string().trim().min(1),
	exampleSentence: optionalTrimmedString,
	savedAt: optionalTrimmedString,
});

export type CreateVocabularyPhraseBody = z.infer<
	typeof createVocabularyPhraseBodySchema
>;

export const updateVocabularyPhraseBodySchema = z
	.object({
		term: z.string().trim().min(1).optional(),
		cefr: languageLevelInputSchema.optional(),
		definition: z.string().trim().min(1).optional(),
		exampleSentence: z.union([z.string().trim().min(1), z.null()]).optional(),
		savedAt: z.string().trim().min(1).optional(),
	})
	.refine(
		(body) =>
			body.term !== undefined ||
			body.cefr !== undefined ||
			body.definition !== undefined ||
			body.exampleSentence !== undefined ||
			body.savedAt !== undefined,
		{ message: "At least one field must be provided" },
	);

export type UpdateVocabularyPhraseBody = z.infer<
	typeof updateVocabularyPhraseBodySchema
>;

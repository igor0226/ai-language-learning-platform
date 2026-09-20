import { languageLevelInputSchema, type LanguageLevel } from "@llp/contracts";
import { z } from "zod";

const requiredString = z.string().trim().min(1);

const optionalExplanationLanguage = z.preprocess(
	(value) => (typeof value === "string" ? value.trim() : undefined),
	z.string().optional(),
);

const optionalTopic = z
	.union([z.string(), z.null()])
	.optional()
	.transform((value, ctx): string | undefined => {
		if (value === undefined || value === null) {
			return undefined;
		}
		const topic = value.trim();
		if (!topic) {
			ctx.addIssue({
				code: "custom",
				message: "topic must be a non-empty string",
			});
			return z.NEVER;
		}
		return topic;
	});

export const createCallBodySchema = z.object({
	sourceLanguage: requiredString,
	languageLevel: languageLevelInputSchema,
	explanationLanguage: optionalExplanationLanguage,
	topic: optionalTopic,
});

export type CreateCallBody = {
	sourceLanguage: string;
	languageLevel: LanguageLevel;
	explanationLanguage?: string;
	topic?: string;
};

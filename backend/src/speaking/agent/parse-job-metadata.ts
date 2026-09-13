import { languageLevelSchema, type LanguageLevel } from "@llp/contracts";
import { z } from "zod";

const JobMetadataSchema = z.object({
	callId: z.string(),
	sourceLanguage: z.string(),
	languageLevel: languageLevelSchema,
	explanationLanguage: z.string().nullable().optional(),
	topic: z.string().optional(),
});

export type TeacherJobMetadata = {
	callId: string;
	sourceLanguage: string;
	languageLevel: LanguageLevel;
	explanationLanguage?: string | null;
	topic?: string;
};

export function parseTeacherJobMetadata(
	raw: string | undefined,
): TeacherJobMetadata {
	if (!raw?.trim()) {
		return fallbackMetadata();
	}
	const parsed = JobMetadataSchema.safeParse(JSON.parse(raw));
	if (!parsed.success) {
		return fallbackMetadata();
	}
	return parsed.data;
}

function fallbackMetadata(): TeacherJobMetadata {
	return {
		callId: "unknown",
		sourceLanguage: "English",
		languageLevel: "B1",
	};
}

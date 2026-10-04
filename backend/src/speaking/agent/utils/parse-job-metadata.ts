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

export class InvalidTeacherJobMetadataError extends Error {
	constructor(reason: string) {
		super(`Invalid teacher job metadata: ${reason}`);
		this.name = "InvalidTeacherJobMetadataError";
	}
}

export function parseTeacherJobMetadata(
	raw: string | undefined,
): TeacherJobMetadata {
	if (!raw?.trim()) {
		throw new InvalidTeacherJobMetadataError("metadata is missing");
	}
	let json: unknown;
	try {
		json = JSON.parse(raw);
	} catch {
		throw new InvalidTeacherJobMetadataError("metadata is not valid JSON");
	}
	const parsed = JobMetadataSchema.safeParse(json);
	if (!parsed.success) {
		throw new InvalidTeacherJobMetadataError("metadata failed validation");
	}
	return parsed.data;
}

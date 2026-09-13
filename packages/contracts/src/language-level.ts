import { z } from "zod";

export const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const languageLevelSchema = z.enum(LANGUAGE_LEVELS);

export type LanguageLevel = z.infer<typeof languageLevelSchema>;

export const languageLevelInputSchema = z
	.string()
	.trim()
	.toUpperCase()
	.pipe(languageLevelSchema);

export function parseLanguageLevel(value: unknown): LanguageLevel | null {
	const parsed = languageLevelInputSchema.safeParse(value);
	return parsed.success ? parsed.data : null;
}

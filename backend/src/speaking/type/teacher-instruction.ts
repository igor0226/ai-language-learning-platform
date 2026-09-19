import type { LanguageLevel } from "@llp/contracts";

export type TeacherInstructionInput = {
	sourceLanguage: string;
	languageLevel: LanguageLevel;
	explanationLanguage?: string | null;
	topic?: string | null;
};

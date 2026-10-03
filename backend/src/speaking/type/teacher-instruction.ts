import type { LanguageLevel, VocabularyPhrase } from "@llp/contracts";

export type TeacherInstructionInput = {
	sourceLanguage: string;
	languageLevel: LanguageLevel;
	explanationLanguage?: string | null;
	topic?: string | null;
	vocabularyPhrases?: VocabularyPhrase[];
};

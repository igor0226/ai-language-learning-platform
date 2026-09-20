import type { LanguageLevel, TeacherCallStatus } from "@/storage/type";

export type TeacherCallHistoryItem = {
	id: string;
	status: TeacherCallStatus;
	sourceLanguage: string;
	languageLevel: LanguageLevel;
	explanationLanguage: string | null;
	createdAt: string;
	endedAt: string | null;
	durationSeconds: number | null;
};

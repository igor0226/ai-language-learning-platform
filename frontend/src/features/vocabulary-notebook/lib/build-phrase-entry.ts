import type { LanguageLevel } from "@llp/contracts";
import type { SavedPhrase } from "@/entities/speaking-session";

export type PhraseInput = Omit<SavedPhrase, "id" | "savedAt"> & {
	id?: string;
	savedAt?: string;
};

export function buildPhraseEntry(phrase: PhraseInput): SavedPhrase {
	const now = new Date();
	const formattedTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
	return {
		id:
			phrase.id ??
			`phrase-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
		term: phrase.term.trim(),
		phonetic: phrase.phonetic?.trim() || "/.../",
		cefr: (phrase.cefr || "B2") as LanguageLevel,
		definition: phrase.definition.trim(),
		exampleSentence: phrase.exampleSentence?.trim() || undefined,
		savedAt: phrase.savedAt ?? formattedTime,
	};
}

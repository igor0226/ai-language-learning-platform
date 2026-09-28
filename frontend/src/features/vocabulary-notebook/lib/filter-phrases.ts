import type { LanguageLevel, VocabularyPhrase } from "@llp/contracts";

export function filterSavedPhrases(
	phrases: VocabularyPhrase[],
	searchQuery: string,
	selectedLevel: string,
): VocabularyPhrase[] {
	const query = searchQuery.trim().toLowerCase();
	return phrases.filter((phrase) => {
		const matchesQuery =
			query.length === 0 ||
			phrase.term.toLowerCase().includes(query) ||
			phrase.definition.toLowerCase().includes(query) ||
			(phrase.exampleSentence?.toLowerCase().includes(query) ?? false);

		const matchesLevel =
			selectedLevel === "all" ||
			phrase.cefr.toUpperCase() === selectedLevel.toUpperCase();

		return matchesQuery && matchesLevel;
	});
}

export const VOCABULARY_CEFR_LEVELS: LanguageLevel[] = [
	"A1",
	"A2",
	"B1",
	"B2",
	"C1",
	"C2",
];

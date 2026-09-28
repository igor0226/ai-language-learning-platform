import type { VocabularyPhraseRecord } from "../type";

export function normalizeVocabularyPhraseRecord(
	record: VocabularyPhraseRecord,
): VocabularyPhraseRecord {
	return {
		...record,
		exampleSentence: record.exampleSentence ?? null,
	};
}

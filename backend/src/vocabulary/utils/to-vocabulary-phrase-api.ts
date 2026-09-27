import type { VocabularyPhrase } from "@llp/contracts";

import type { VocabularyPhraseRecord } from "@/storage/type";

export function toVocabularyPhraseApi(
	record: VocabularyPhraseRecord,
): VocabularyPhrase {
	return {
		id: record.id,
		term: record.term,
		phonetic: record.phonetic,
		cefr: record.cefr,
		definition: record.definition,
		exampleSentence: record.exampleSentence ?? undefined,
		savedAt: record.savedAt,
	};
}

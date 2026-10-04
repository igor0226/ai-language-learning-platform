import type { VocabularyPhrase } from "@llp/contracts";

export function formatVocabularyContext(phrases: VocabularyPhrase[]): string {
	if (phrases.length === 0) {
		return "The learner's vocabulary deck is empty. Any new term you add must not duplicate an existing deck entry.";
	}
	const lines = phrases.map(
		(phrase) => `- ${phrase.term} (${phrase.cefr}): ${phrase.definition}`,
	);
	return [
		"The learner already has these words and phrases in their deck. Do not call add_vocabulary for terms that match these (ignore case):",
		...lines,
	].join("\n");
}

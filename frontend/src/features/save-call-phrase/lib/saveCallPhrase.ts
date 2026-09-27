import type { VocabularyPhrase } from "@llp/contracts";

export type CallPhraseSaveResult =
	| { kind: "empty" }
	| { kind: "duplicate" }
	| { kind: "ready"; term: string };

export function prepareCallPhraseSave(
	term: string,
	existing: VocabularyPhrase[],
): CallPhraseSaveResult {
	const trimmed = term.trim();
	if (!trimmed) {
		return { kind: "empty" };
	}
	const duplicate = existing.some(
		(phrase) => phrase.term.toLowerCase() === trimmed.toLowerCase(),
	);
	if (duplicate) {
		return { kind: "duplicate" };
	}
	return { kind: "ready", term: trimmed };
}

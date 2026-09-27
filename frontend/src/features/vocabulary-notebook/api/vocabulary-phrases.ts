import {
	type CreateVocabularyPhraseBody,
	createVocabularyPhraseBodySchema,
	type UpdateVocabularyPhraseBody,
	updateVocabularyPhraseBodySchema,
	type VocabularyPhrase,
	vocabularyPhraseListSchema,
	vocabularyPhraseSchema,
} from "@llp/contracts";

import { authFetch } from "@/shared/api/auth-fetch";

export async function fetchVocabularyPhrases(): Promise<VocabularyPhrase[]> {
	const response = await authFetch("/api/vocabulary/phrases");
	if (!response.ok) {
		throw new Error(`Failed to load vocabulary (${response.status})`);
	}
	const parsed = vocabularyPhraseListSchema.parse(await response.json());
	return parsed.phrases;
}

export async function createVocabularyPhrase(
	body: CreateVocabularyPhraseBody,
): Promise<VocabularyPhrase> {
	const payload = createVocabularyPhraseBodySchema.parse(body);
	const response = await authFetch("/api/vocabulary/phrases", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(`Failed to save phrase (${response.status})`);
	}
	return vocabularyPhraseSchema.parse(await response.json());
}

export async function updateVocabularyPhrase(
	phraseId: string,
	body: UpdateVocabularyPhraseBody,
): Promise<VocabularyPhrase> {
	const payload = updateVocabularyPhraseBodySchema.parse(body);
	const response = await authFetch(`/api/vocabulary/phrases/${phraseId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(`Failed to update phrase (${response.status})`);
	}
	return vocabularyPhraseSchema.parse(await response.json());
}

export async function deleteVocabularyPhrase(phraseId: string): Promise<void> {
	const response = await authFetch(`/api/vocabulary/phrases/${phraseId}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		throw new Error(`Failed to delete phrase (${response.status})`);
	}
}

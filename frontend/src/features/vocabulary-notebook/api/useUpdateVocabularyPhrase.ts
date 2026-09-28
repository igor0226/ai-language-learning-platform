"use client";

import type { UpdateVocabularyPhraseBody } from "@llp/contracts";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "@/entities/session";
import { updateVocabularyPhrase } from "./vocabulary-phrases";
import { vocabularyPhrasesQueryKey } from "./vocabulary-phrases-query-key";

export function useUpdateVocabularyPhrase() {
	const { data: user } = useAuthSession();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (input: {
			phraseId: string;
			body: UpdateVocabularyPhraseBody;
		}) => updateVocabularyPhrase(input.phraseId, input.body),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: vocabularyPhrasesQueryKey(user?.id),
			});
		},
	});

	return {
		updatePhrase: (phraseId: string, body: UpdateVocabularyPhraseBody) =>
			mutation.mutateAsync({ phraseId, body }),
		isUpdating: mutation.isPending,
	};
}

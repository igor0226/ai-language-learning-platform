"use client";

import type { CreateVocabularyPhraseBody } from "@llp/contracts";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "@/entities/session";
import { createVocabularyPhrase } from "./vocabulary-phrases";
import { vocabularyPhrasesQueryKey } from "./vocabulary-phrases-query-key";

export function useCreateVocabularyPhrase() {
	const { data: user } = useAuthSession();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (body: CreateVocabularyPhraseBody) =>
			createVocabularyPhrase(body),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: vocabularyPhrasesQueryKey(user?.id),
			});
		},
	});

	return {
		createPhrase: mutation.mutateAsync,
		isCreating: mutation.isPending,
	};
}

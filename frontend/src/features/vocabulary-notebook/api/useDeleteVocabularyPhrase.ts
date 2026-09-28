"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "@/entities/session";
import { deleteVocabularyPhrase } from "./vocabulary-phrases";
import { vocabularyPhrasesQueryKey } from "./vocabulary-phrases-query-key";

export function useDeleteVocabularyPhrase() {
	const { data: user } = useAuthSession();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (phraseId: string) => deleteVocabularyPhrase(phraseId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: vocabularyPhrasesQueryKey(user?.id),
			});
		},
	});

	return {
		deletePhrase: mutation.mutateAsync,
		isDeleting: mutation.isPending,
	};
}

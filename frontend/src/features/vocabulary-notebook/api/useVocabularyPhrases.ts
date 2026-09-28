"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthSession } from "@/entities/session";
import { fetchVocabularyPhrases } from "./vocabulary-phrases";
import { vocabularyPhrasesQueryKey } from "./vocabulary-phrases-query-key";

export function useVocabularyPhrases() {
	const { data: user, isLoading: isAuthLoading } = useAuthSession();
	const query = useQuery({
		queryKey: vocabularyPhrasesQueryKey(user?.id),
		queryFn: fetchVocabularyPhrases,
		enabled: Boolean(user?.id),
	});

	return {
		phrases: query.data ?? [],
		isLoading: isAuthLoading || query.isPending,
		errorMessage: query.error instanceof Error ? query.error.message : null,
	};
}

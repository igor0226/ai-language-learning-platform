"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSpeakingTopics } from "./speaking-topics";
import { speakingTopicsQueryKey } from "./speaking-topics-query-key";

export function useSpeakingTopicsQuery() {
	const query = useQuery({
		queryKey: speakingTopicsQueryKey(),
		queryFn: () => fetchSpeakingTopics(),
	});

	return {
		topics: query.data ?? [],
		isLoading: query.isPending,
		errorMessage: query.error instanceof Error ? query.error.message : null,
	};
}

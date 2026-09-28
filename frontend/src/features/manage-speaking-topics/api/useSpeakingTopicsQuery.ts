"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthSession } from "@/entities/session";
import { fetchSpeakingTopics } from "./speaking-topics";
import { speakingTopicsQueryKey } from "./speaking-topics-query-key";

export function useSpeakingTopicsQuery() {
	const { data: user, isLoading: isAuthLoading } = useAuthSession();
	const query = useQuery({
		queryKey: speakingTopicsQueryKey(user?.id),
		queryFn: fetchSpeakingTopics,
		enabled: Boolean(user?.id),
	});

	return {
		topics: query.data ?? [],
		isLoading: isAuthLoading || query.isPending,
		errorMessage: query.error instanceof Error ? query.error.message : null,
	};
}

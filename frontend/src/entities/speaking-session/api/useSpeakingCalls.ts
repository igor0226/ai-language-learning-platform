"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSpeakingCalls } from "./fetchSpeakingCalls";
import { speakingCallsQueryKey } from "./speaking-calls-query-key";

export function useSpeakingCalls() {
	const query = useQuery({
		queryKey: speakingCallsQueryKey(),
		queryFn: () => fetchSpeakingCalls(),
	});

	return {
		calls: query.data ?? [],
		isLoading: query.isPending,
		errorMessage: query.error instanceof Error ? query.error.message : null,
	};
}

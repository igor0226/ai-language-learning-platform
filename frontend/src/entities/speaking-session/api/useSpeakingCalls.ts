"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthSession } from "@/entities/session";
import { fetchSpeakingCalls } from "./fetchSpeakingCalls";

export function useSpeakingCalls() {
	const { data: user, isLoading: isAuthLoading } = useAuthSession();
	const query = useQuery({
		queryKey: ["speaking-calls", user?.id],
		queryFn: fetchSpeakingCalls,
		enabled: Boolean(user?.id),
	});

	return {
		calls: query.data ?? [],
		isLoading: isAuthLoading || query.isPending,
		errorMessage: query.error instanceof Error ? query.error.message : null,
	};
}

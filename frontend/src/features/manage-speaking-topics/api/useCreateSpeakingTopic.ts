"use client";

import type { CreateCallTopicBody } from "@llp/contracts";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "@/entities/session";
import { createSpeakingTopic } from "./speaking-topics";
import { speakingTopicsQueryKey } from "./speaking-topics-query-key";

export function useCreateSpeakingTopic() {
	const { data: user } = useAuthSession();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (body: CreateCallTopicBody) => createSpeakingTopic(body),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: speakingTopicsQueryKey(user?.id),
			});
		},
	});

	return {
		createTopic: mutation.mutateAsync,
		isCreating: mutation.isPending,
	};
}

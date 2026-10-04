"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSpeakingTopic } from "./speaking-topics";
import { speakingTopicsQueryKey } from "./speaking-topics-query-key";

export function useDeleteSpeakingTopic() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (topicId: string) => deleteSpeakingTopic(topicId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: speakingTopicsQueryKey(),
			});
		},
	});

	return {
		deleteTopic: mutation.mutateAsync,
		isDeleting: mutation.isPending,
	};
}

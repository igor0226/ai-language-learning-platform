"use client";

import type { UpdateCallTopicBody } from "@llp/contracts";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateSpeakingTopic } from "./speaking-topics";
import { speakingTopicsQueryKey } from "./speaking-topics-query-key";

export function useUpdateSpeakingTopic() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (input: { topicId: string; body: UpdateCallTopicBody }) =>
			updateSpeakingTopic(input.topicId, input.body),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: speakingTopicsQueryKey(),
			});
		},
	});

	return {
		updateTopic: (topicId: string, body: UpdateCallTopicBody) =>
			mutation.mutateAsync({ topicId, body }),
		isUpdating: mutation.isPending,
	};
}

"use client";

import type { CallTopic } from "@llp/contracts";

import { useCallback, useEffect, useState } from "react";

import { useCreateSpeakingTopic } from "../api/useCreateSpeakingTopic";
import { useDeleteSpeakingTopic } from "../api/useDeleteSpeakingTopic";
import { useSpeakingTopicsQuery } from "../api/useSpeakingTopicsQuery";
import { useUpdateSpeakingTopic } from "../api/useUpdateSpeakingTopic";
import {
	findTopicById,
	formToCreateBody,
	formToUpdateBody,
	type TopicFormState,
} from "../lib/topic-form";

export function useSpeakingTopics() {
	const { topics, isLoading, errorMessage } = useSpeakingTopicsQuery();
	const { createTopic: createTopicMutation } = useCreateSpeakingTopic();
	const { updateTopic: updateTopicMutation } = useUpdateSpeakingTopic();
	const { deleteTopic: deleteTopicMutation } = useDeleteSpeakingTopic();

	const [selectedTopicId, setSelectedTopicId] = useState("");

	useEffect(() => {
		if (topics.length === 0) {
			setSelectedTopicId("");
			return;
		}
		if (!topics.some((topic) => topic.id === selectedTopicId)) {
			setSelectedTopicId(topics[0]?.id ?? "");
		}
	}, [topics, selectedTopicId]);

	const createTopic = useCallback(
		async (form: TopicFormState) => {
			const created = await createTopicMutation(formToCreateBody(form));
			setSelectedTopicId(created.id);
			return created;
		},
		[createTopicMutation],
	);

	const updateTopic = useCallback(
		async (id: string, form: TopicFormState) => {
			await updateTopicMutation(id, formToUpdateBody(form));
		},
		[updateTopicMutation],
	);

	const deleteTopic = useCallback(
		async (id: string) => {
			await deleteTopicMutation(id);
			setSelectedTopicId((current) => {
				if (current !== id) {
					return current;
				}
				const remaining = topics.filter((topic) => topic.id !== id);
				return remaining[0]?.id ?? "";
			});
		},
		[deleteTopicMutation, topics],
	);

	const resolveTopic = useCallback(
		(id: string): CallTopic | undefined => {
			return findTopicById(topics, id);
		},
		[topics],
	);

	const selectedTopic =
		findTopicById(topics, selectedTopicId) ?? topics[0] ?? null;

	return {
		topics,
		selectedTopicId,
		selectedTopic,
		setSelectedTopicId,
		createTopic,
		updateTopic,
		deleteTopic,
		resolveTopic,
		isLoading,
		errorMessage,
	};
}

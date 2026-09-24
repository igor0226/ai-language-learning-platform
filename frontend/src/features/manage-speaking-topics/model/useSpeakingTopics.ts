"use client";

import type { CallTopic } from "@/entities/speaking-session";

import { useCallback, useEffect, useState } from "react";

import {
	createCustomTopic,
	type TopicFormState,
	updateTopicFromForm,
} from "../lib/topic-form";
import {
	findTopicById,
	loadSpeakingTopics,
	persistSpeakingTopics,
} from "../lib/topics-storage";

export function useSpeakingTopics() {
	const [topics, setTopics] = useState<CallTopic[]>(() => loadSpeakingTopics());
	const [selectedTopicId, setSelectedTopicId] = useState<string>(
		() => loadSpeakingTopics()[0]?.id ?? "",
	);

	useEffect(() => {
		persistSpeakingTopics(topics);
	}, [topics]);

	useEffect(() => {
		if (!topics.some((topic) => topic.id === selectedTopicId)) {
			setSelectedTopicId(topics[0]?.id ?? "");
		}
	}, [topics, selectedTopicId]);

	const createTopic = useCallback((form: TopicFormState) => {
		const topic = createCustomTopic(form);
		setTopics((previous) => [topic, ...previous]);
		setSelectedTopicId(topic.id);
		return topic;
	}, []);

	const updateTopic = useCallback((id: string, form: TopicFormState) => {
		setTopics((previous) =>
			previous.map((topic) => {
				if (topic.id !== id) {
					return topic;
				}
				return updateTopicFromForm(topic, form);
			}),
		);
	}, []);

	const deleteTopic = useCallback((id: string) => {
		setTopics((previous) => {
			const updated = previous.filter((topic) => topic.id !== id);
			setSelectedTopicId((current) => {
				if (current !== id) {
					return current;
				}
				return updated[0]?.id ?? "";
			});
			return updated;
		});
	}, []);

	const resolveTopic = useCallback(
		(id: string) => findTopicById(topics, id) ?? topics[0],
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
	};
}

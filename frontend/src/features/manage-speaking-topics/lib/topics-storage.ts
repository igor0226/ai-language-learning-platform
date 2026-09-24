import type { CallTopic } from "@/entities/speaking-session";

import { SPEAKING_TOPICS } from "@/entities/speaking-session";

export const TOPICS_STORAGE_KEY = "language_studio_custom_topics_v1";

export function loadSpeakingTopics(): CallTopic[] {
	if (typeof window === "undefined") {
		return SPEAKING_TOPICS;
	}
	try {
		const stored = localStorage.getItem(TOPICS_STORAGE_KEY);
		if (!stored) {
			return SPEAKING_TOPICS;
		}
		const parsed: unknown = JSON.parse(stored);
		if (Array.isArray(parsed) && parsed.length > 0) {
			return parsed as CallTopic[];
		}
	} catch {
		return SPEAKING_TOPICS;
	}
	return SPEAKING_TOPICS;
}

export function persistSpeakingTopics(topics: CallTopic[]): void {
	if (typeof window === "undefined") {
		return;
	}
	try {
		localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topics));
	} catch {
		// ignore
	}
}

export function findTopicById(
	topics: CallTopic[],
	id: string,
): CallTopic | undefined {
	return topics.find((topic) => topic.id === id);
}

import type { CallTopic } from "../type";

export function formatSpeakingTopicText(
	topic: Pick<CallTopic, "title" | "description">,
): string {
	return `${topic.title}. ${topic.description}`;
}

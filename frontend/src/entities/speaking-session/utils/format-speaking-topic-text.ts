import type { CallTopic } from "@llp/contracts";

export function formatSpeakingTopicText(
	topic: Pick<CallTopic, "title" | "description">,
): string {
	return `${topic.title}. ${topic.description}`;
}

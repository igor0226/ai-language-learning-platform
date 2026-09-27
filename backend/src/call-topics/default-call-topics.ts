import type { CallTopicLevel } from "@llp/contracts";

/** Fixed seed time for catalog topics (stable across users). */
export const DEFAULT_CATALOG_TOPIC_CREATED_AT = "2026-01-01T00:00:00.000Z";

export type DefaultCallTopicCatalogEntry = {
	id: string;
	title: string;
	level: CallTopicLevel;
	description: string;
	suggestedDurationMins: number;
	createdAt: string;
};

/** Shared preset library — same ids/order as frontend SPEAKING_TOPICS fixtures. */
export const DEFAULT_CALL_TOPIC_CATALOG: DefaultCallTopicCatalogEntry[] = [
	{
		id: "topic-2",
		title: "A simple conversation about life, work, and hobbies",
		level: "B1-B2",
		description: "Have a simple conversation about life, work, and hobbies.",
		suggestedDurationMins: 10,
		createdAt: DEFAULT_CATALOG_TOPIC_CREATED_AT,
	},
	{
		id: "topic-1",
		title: "Job Interview: Technical & Product Communication",
		level: "B2-C1",
		description:
			"Practice answering complex behavioral and technical architecture questions in a professional setting.",
		suggestedDurationMins: 15,
		createdAt: DEFAULT_CATALOG_TOPIC_CREATED_AT,
	},
	{
		id: "topic-3",
		title: "Academic Debate: Technological Automation & Ethics",
		level: "C1-C2",
		description:
			"Formulate coherent argumentative theses and defend viewpoints with sophisticated transitions.",
		suggestedDurationMins: 20,
		createdAt: DEFAULT_CATALOG_TOPIC_CREATED_AT,
	},
];

export function findDefaultCatalogTopic(
	topicId: string,
): DefaultCallTopicCatalogEntry | undefined {
	return DEFAULT_CALL_TOPIC_CATALOG.find((entry) => entry.id === topicId);
}

export function isDefaultCatalogTopicId(topicId: string): boolean {
	return findDefaultCatalogTopic(topicId) !== undefined;
}

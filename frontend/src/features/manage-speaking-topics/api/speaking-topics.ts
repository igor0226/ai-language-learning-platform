import {
	type CallTopic,
	type CreateCallTopicBody,
	callTopicListSchema,
	callTopicSchema,
	createCallTopicBodySchema,
	type UpdateCallTopicBody,
	updateCallTopicBodySchema,
} from "@llp/contracts";

import { type AuthFetchFn, authFetch } from "@/shared/api/auth-fetch";

export async function fetchSpeakingTopics(
	fetchImpl: AuthFetchFn = authFetch,
): Promise<CallTopic[]> {
	const response = await fetchImpl("/api/speaking/topics");
	if (!response.ok) {
		throw new Error(`Failed to load topics (${response.status})`);
	}
	const parsed = callTopicListSchema.parse(await response.json());
	return parsed.topics;
}

export async function createSpeakingTopic(
	body: CreateCallTopicBody,
): Promise<CallTopic> {
	const payload = createCallTopicBodySchema.parse(body);
	const response = await authFetch("/api/speaking/topics", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(`Failed to create topic (${response.status})`);
	}
	return callTopicSchema.parse(await response.json());
}

export async function updateSpeakingTopic(
	topicId: string,
	body: UpdateCallTopicBody,
): Promise<CallTopic> {
	const payload = updateCallTopicBodySchema.parse(body);
	const response = await authFetch(`/api/speaking/topics/${topicId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(`Failed to update topic (${response.status})`);
	}
	return callTopicSchema.parse(await response.json());
}

export async function deleteSpeakingTopic(topicId: string): Promise<void> {
	const response = await authFetch(`/api/speaking/topics/${topicId}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		throw new Error(`Failed to delete topic (${response.status})`);
	}
}

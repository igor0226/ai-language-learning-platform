import type { UserCallTopic } from "../../models";
import type { UserCallTopicRecord } from "../type";

export function normalizeUserCallTopicRecord(
	entity: UserCallTopic,
): UserCallTopicRecord {
	return {
		userId: entity.userId,
		topicId: entity.topicId,
		kind: entity.kind,
		title: entity.title,
		level: entity.level,
		description: entity.description,
		suggestedDurationMins: entity.suggestedDurationMins,
		createdAt: entity.createdAt,
		updatedAt: entity.updatedAt,
	};
}

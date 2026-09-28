import {
	CALL_TOPIC_LEVELS,
	type CallTopic,
	type CallTopicLevel,
	type CreateCallTopicBody,
	type UpdateCallTopicBody,
} from "@llp/contracts";

export const TOPIC_LEVEL_OPTIONS: readonly CallTopicLevel[] = CALL_TOPIC_LEVELS;

export function resolveTopicLevelOptions(
	currentLevel: string,
): readonly CallTopicLevel[] {
	const trimmed = currentLevel.trim();
	if (trimmed && !TOPIC_LEVEL_OPTIONS.includes(trimmed as CallTopicLevel)) {
		return [trimmed as CallTopicLevel, ...TOPIC_LEVEL_OPTIONS];
	}
	return TOPIC_LEVEL_OPTIONS;
}

export type TopicFormState = {
	title: string;
	level: string;
	duration: number;
	description: string;
};

export function validateTopicForm(form: TopicFormState): string | null {
	if (!form.title.trim()) {
		return "Please enter a discussion topic title.";
	}
	if (!form.description.trim()) {
		return "Please enter a scenario description for the AI instructor.";
	}
	return null;
}

export function formToCreateBody(form: TopicFormState): CreateCallTopicBody {
	const level = (form.level.trim() || "B1-B2") as CallTopicLevel;
	return {
		title: form.title.trim(),
		level,
		description: form.description.trim(),
		suggestedDurationMins: Number(form.duration) || 15,
	};
}

export function formToUpdateBody(form: TopicFormState): UpdateCallTopicBody {
	const level = form.level.trim()
		? (form.level.trim() as CallTopicLevel)
		: undefined;
	return {
		title: form.title.trim(),
		level,
		description: form.description.trim(),
		suggestedDurationMins: Number(form.duration) || undefined,
	};
}

export function topicToFormState(topic: CallTopic): TopicFormState {
	return {
		title: topic.title,
		level: topic.level,
		duration: topic.suggestedDurationMins,
		description: topic.description,
	};
}

export const emptyTopicForm = (): TopicFormState => ({
	title: "",
	level: "B1-B2",
	duration: 15,
	description: "",
});

export function findTopicById(
	topics: CallTopic[],
	id: string,
): CallTopic | undefined {
	return topics.find((topic) => topic.id === id);
}

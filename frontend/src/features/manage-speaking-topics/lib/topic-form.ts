import type { CallTopic } from "@/entities/speaking-session";

/** CEFR bands shown in the topic form (matches default speaking scenarios). */
export const TOPIC_LEVEL_OPTIONS: string[] = [
	"A2-B1",
	"B1-B2",
	"B2-C1",
	"C1-C2",
];

export function resolveTopicLevelOptions(currentLevel: string): string[] {
	const trimmed = currentLevel.trim();
	if (trimmed && !TOPIC_LEVEL_OPTIONS.includes(trimmed)) {
		return [trimmed, ...TOPIC_LEVEL_OPTIONS];
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

export function createCustomTopic(form: TopicFormState): CallTopic {
	return {
		id: `topic-custom-${Date.now()}`,
		title: form.title.trim(),
		level: form.level.trim() || "B1-B2",
		description: form.description.trim(),
		suggestedDurationMins: Number(form.duration) || 15,
		isCustom: true,
		createdAt: new Date().toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}),
	};
}

export function updateTopicFromForm(
	existing: CallTopic,
	form: TopicFormState,
): CallTopic {
	return {
		...existing,
		title: form.title.trim(),
		level: form.level.trim() || existing.level,
		description: form.description.trim(),
		suggestedDurationMins:
			Number(form.duration) || existing.suggestedDurationMins,
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

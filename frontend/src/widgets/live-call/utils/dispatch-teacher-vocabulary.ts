import {
	TEACHER_VOCABULARY_TOPIC,
	type TeacherVocabularyMessage,
} from "@llp/contracts";

import { parseVocabularyMessage } from "@/entities/speaking-session";

export function dispatchTeacherVocabulary(
	payload: Uint8Array,
	topic: string | undefined,
	onTeacherVocabulary: (message: TeacherVocabularyMessage) => void,
): void {
	if (topic && topic !== TEACHER_VOCABULARY_TOPIC) {
		return;
	}
	const message = parseVocabularyMessage(payload);
	if (message) {
		onTeacherVocabulary(message);
	}
}

import {
	TEACHER_VOCABULARY_TOPIC,
	type TeacherVocabularyMessage,
	teacherVocabularyMessageSchema,
} from "@llp/contracts";

import type { EmotionPublisher } from "./publish-emotion";

export async function publishVocabulary(input: {
	publisher: EmotionPublisher;
	message: TeacherVocabularyMessage;
}): Promise<TeacherVocabularyMessage> {
	const payload = teacherVocabularyMessageSchema.parse(input.message);
	const bytes = new TextEncoder().encode(JSON.stringify(payload));
	await input.publisher.publishData(bytes, {
		reliable: true,
		topic: TEACHER_VOCABULARY_TOPIC,
	});
	return payload;
}

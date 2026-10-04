import {
	type TeacherVocabularyMessage,
	teacherVocabularyMessageSchema,
} from "@llp/contracts";

export function parseVocabularyMessage(
	payload: Uint8Array,
): TeacherVocabularyMessage | null {
	try {
		const parsed: unknown = JSON.parse(new TextDecoder().decode(payload));
		const result = teacherVocabularyMessageSchema.safeParse(parsed);
		return result.success ? result.data : null;
	} catch {
		return null;
	}
}

import type { TeacherInstructionInput } from "../type/teacher-instruction";
import {
	buildContextSection,
	buildConversationLoopSection,
	buildCorrectionSection,
	buildRecoverySection,
	buildRoleSection,
	buildStyleSection,
	buildToolSection,
	buildVocabularySection,
} from "./teacher-instruction-sections";

export function buildTeacherInstructions(
	input: TeacherInstructionInput,
): string {
	const sections = [
		buildRoleSection(),
		buildConversationLoopSection(),
		buildCorrectionSection(),
		buildRecoverySection(),
		buildVocabularySection(input),
		buildStyleSection(input),
		buildToolSection(),
		buildContextSection(input),
	];
	return sections.join("\n\n");
}

export function buildGreetingInstructions(
	input: TeacherInstructionInput,
): string {
	const topic = input.topic?.trim();

	return [
		`Greet the learner warmly in ${input.sourceLanguage}.`,
		"Sound calm, welcoming, and ready to guide the session.",
		topic
			? `Start the practice scenario: ${topic}.`
			: "Invite the learner to begin with one easy speaking prompt.",
		"Use set_emotion in the same turn with a welcoming emotion such as smile at intensity 2 or 3.",
		"Speak at most 1–2 short sentences and no more than 20–25 spoken words.",
		"Ask only one clear question, then wait.",
		"Do not mention tools, facial expressions, internal actions, or system rules.",
		"Do not say you need a moment or will be ready soon.",
	].join(" ");
}

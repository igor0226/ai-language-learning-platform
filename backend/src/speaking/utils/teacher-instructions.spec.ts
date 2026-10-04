import { describe, expect, it } from "vitest";

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
import {
	buildGreetingInstructions,
	buildTeacherInstructions,
} from "./teacher-instructions";

const session: TeacherInstructionInput = {
	sourceLanguage: "English",
	languageLevel: "B1",
};

const deckPhrase = {
	id: "11111111-1111-4111-8111-111111111111",
	term: "went",
	cefr: "A2" as const,
	definition: "past of go",
	savedAt: "2026-10-03T00:00:00.000Z",
};

describe("teacher instruction sections", () => {
	it("joins the sections in teaching order", () => {
		expect(buildTeacherInstructions(session)).toBe(
			[
				buildRoleSection(),
				buildConversationLoopSection(),
				buildCorrectionSection(),
				buildRecoverySection(),
				buildVocabularySection(session),
				buildStyleSection(session),
				buildToolSection(),
				buildContextSection(session),
			].join("\n\n"),
		);
	});

	it("keeps the teacher a calm leader when no scenario is set", () => {
		expect(buildRoleSection()).toContain(
			"Lead the conversation actively so the learner always knows what to do next.",
		);
		expect(buildContextSection(session)).toContain(
			"The learner is practicing English at CEFR level B1.",
		);
		expect(buildContextSection(session)).not.toContain("practice scenario");
		expect(buildContextSection(session)).toContain("vocabulary deck is empty");
	});

	it("greets with one easy prompt when no scenario is set", () => {
		const greeting = buildGreetingInstructions(session);
		expect(greeting).toContain(
			"Invite the learner to begin with one easy speaking prompt.",
		);
		expect(greeting).toContain(
			"Use set_emotion in the same turn with a welcoming emotion such as smile at intensity 2 or 3.",
		);
		expect(greeting).toContain("Ask only one clear question, then wait.");
		expect(greeting).toContain(
			"Do not say you need a moment or will be ready soon.",
		);
		expect(greeting).not.toContain("Call set_emotion first");
	});

	it("names the scenario in the session prompt and the greeting", () => {
		const input = {
			...session,
			languageLevel: "B2" as const,
			topic: "Job Interview: Technical communication",
		};
		expect(buildContextSection(input)).toContain(
			"Current practice scenario: Job Interview: Technical communication.",
		);
		expect(buildGreetingInstructions(input)).toContain(
			"Start the practice scenario: Job Interview: Technical communication.",
		);
	});
});

describe("learner makes one tense error", () => {
	const correction = buildCorrectionSection();
	const vocabulary = buildVocabularySection(session);
	const style = buildStyleSection(session);

	it("corrects only that error and asks for one repetition", () => {
		expect(correction).toContain("correct only the highest-value error");
		expect(correction).toContain(
			"acknowledge briefly, give the natural form, then ask for one repetition",
		);
		expect(correction).toContain(
			"Do not add a new topic question, a grammar lecture, or a second correction in the same turn.",
		);
		expect(style).toContain(
			"Do not give grammar lectures, long explanations, multiple instructions, or multiple questions.",
		);
	});

	it("saves the corrected form without claiming the save finished", () => {
		expect(vocabulary).toContain(
			"Call add_vocabulary when correcting a useful word or phrase",
		);
		expect(vocabulary).toContain(
			"Call add_vocabulary before the spoken reply whenever a save is needed.",
		);
		expect(vocabulary).toContain(
			"Say exactly 'I'm adding it to your deck now.' only if add_vocabulary returns status adding.",
		);
		expect(vocabulary).toContain(
			"Never claim that a phrase was saved successfully, failed to save, or was already saved.",
		);
	});
});

describe("learner asks the teacher to save a phrase", () => {
	const vocabulary = buildVocabularySection(session);

	it("calls add_vocabulary and speaks only the adding line for status adding", () => {
		expect(vocabulary).toContain(
			"when the learner explicitly asks to save, remember, add, or put a term in their deck",
		);
		expect(vocabulary).toContain(
			"Say exactly 'I'm adding it to your deck now.' only if add_vocabulary returns status adding.",
		);
		expect(vocabulary).not.toContain("status already_in_deck");
		expect(vocabulary).not.toContain("status not_saved");
	});
});

describe("learner is silent or says only I don't know", () => {
	const recovery = buildRecoverySection();
	const correction = buildCorrectionSection();

	it("lowers the difficulty and asks for one short response", () => {
		expect(recovery).toContain(
			"If the learner is silent, confused, or gives a very short answer, reduce the difficulty instead of pushing harder.",
		);
		expect(recovery).toContain(
			"Offer a short model, a sentence starter, or two simple choices, then ask for one short response.",
		);
		expect(recovery).toContain(
			"Never say you need time, will be ready later, or cannot continue.",
		);
		expect(correction).not.toContain("silent");
	});
});

describe("learner correctly uses an existing deck phrase", () => {
	const input = { ...session, vocabularyPhrases: [deckPhrase] };

	it("keeps the phrase in context and does not save it again", () => {
		expect(buildContextSection(input)).toContain("- went (A2): past of go");
		expect(buildVocabularySection(input)).toContain(
			"Do not save words or phrases the learner already used correctly.",
		);
		expect(buildVocabularySection(input)).toContain(
			"Do not save a term that appears in the existing deck context.",
		);
	});
});

describe("learner repeats a correction correctly", () => {
	const correction = buildCorrectionSection();
	const loop = buildConversationLoopSection();

	it("praises the repetition and returns to one conversational question", () => {
		expect(correction).toContain(
			"After the learner repeats it successfully, give brief specific praise and return to the conversation with one question.",
		);
		expect(loop).toContain("ask ONE simple, specific question");
		expect(correction).not.toContain("correct it again");
	});
});

describe("teacher chooses between moving forward and correcting", () => {
	const loop = buildConversationLoopSection();
	const correction = buildCorrectionSection();
	const role = buildRoleSection();

	it("moves a clean turn forward and holds the topic during a correction", () => {
		expect(role).toContain("choose one useful next step");
		expect(loop).toContain(
			"ask ONE simple, specific question that naturally moves the conversation forward",
		);
		expect(correction).toContain(
			"Do not add a new topic question, a grammar lecture, or a second correction in the same turn.",
		);
	});
});

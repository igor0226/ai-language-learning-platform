import { describe, expect, it } from "vitest";

import {
	buildGreetingInstructions,
	buildTeacherInstructions,
} from "./teacher-instructions";

describe("teacher instructions", () => {
	it("keeps generic instructions when topic is missing", () => {
		const instructions = buildTeacherInstructions({
			sourceLanguage: "English",
			languageLevel: "B1",
		});
		expect(instructions).toContain("practicing English at CEFR level B1");
		expect(instructions).not.toContain("practice scenario");
		expect(instructions).toContain("add_vocabulary");
		expect(instructions).toContain("vocabulary deck is empty");
		expect(instructions).toContain(
			"If the learner asks to save, add, remember, or put a word or phrase in their deck",
		);
		expect(instructions).toContain("Do not stop after set_emotion");
		expect(instructions).toContain("already_in_deck");
		expect(instructions).toContain("not_saved");
		expect(instructions).toContain(
			"Do not call add_vocabulary for a word or phrase the learner already used correctly.",
		);
		expect(instructions).toContain("Do not say it was added earlier");
		expect(instructions).not.toContain(
			"even if the learner did not make a mistake",
		);
		expect(instructions).toContain(
			"During each spoken reply, call set_emotion in the same turn as your answer",
		);
		expect(instructions).not.toContain("before you speak");
		expect(instructions).toContain("Prefer intensity 2 or 3");
		expect(instructions).toContain("Never stall");
		expect(instructions).toContain("will be ready to continue");
		expect(
			buildGreetingInstructions({
				sourceLanguage: "English",
				languageLevel: "B1",
			}),
		).toContain("invite them to start speaking");
		expect(
			buildGreetingInstructions({
				sourceLanguage: "English",
				languageLevel: "B1",
			}),
		).toContain(
			"Do not mention set_emotion, tools, or facial expressions in your spoken greeting.",
		);
		expect(
			buildGreetingInstructions({
				sourceLanguage: "English",
				languageLevel: "B1",
			}),
		).toContain("Greet them immediately");
		expect(
			buildGreetingInstructions({
				sourceLanguage: "English",
				languageLevel: "B1",
			}),
		).not.toContain("Call set_emotion first");
	});

	it("mixes the topic into system and greeting instructions", () => {
		const input = {
			sourceLanguage: "English",
			languageLevel: "B2" as const,
			topic: "Job Interview: Technical communication",
		};
		expect(buildTeacherInstructions(input)).toContain(
			"The practice scenario is: Job Interview: Technical communication.",
		);
		expect(buildGreetingInstructions(input)).toContain(
			"open the session on this scenario: Job Interview: Technical communication",
		);
	});
});

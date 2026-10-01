import { TEACHER_VOCABULARY_TOPIC } from "@llp/contracts";

import { dispatchTeacherVocabulary } from "./dispatch-teacher-vocabulary";

function encode(value: unknown): Uint8Array {
	return new TextEncoder().encode(JSON.stringify(value));
}

describe("dispatchTeacherVocabulary", () => {
	it("forwards a valid teacher-vocabulary payload", () => {
		const onTeacherVocabulary = vi.fn();

		dispatchTeacherVocabulary(
			encode({
				term: "Run into",
				cefr: "B2",
				definition: "Meet unexpectedly.",
			}),
			TEACHER_VOCABULARY_TOPIC,
			onTeacherVocabulary,
		);

		expect(onTeacherVocabulary).toHaveBeenCalledWith({
			term: "Run into",
			cefr: "B2",
			definition: "Meet unexpectedly.",
		});
	});

	it("ignores other topics", () => {
		const onTeacherVocabulary = vi.fn();

		dispatchTeacherVocabulary(
			encode({
				term: "Run into",
				cefr: "B2",
				definition: "Meet unexpectedly.",
			}),
			"teacher-emotion",
			onTeacherVocabulary,
		);

		expect(onTeacherVocabulary).not.toHaveBeenCalled();
	});
});

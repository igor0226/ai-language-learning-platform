import { TEACHER_VOCABULARY_TOPIC } from "@llp/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EmotionPublisher } from "../utils/publish-emotion";
import { addCallVocabulary } from "../utils/speaking-api-client";
import { createAddVocabularyTool } from "./add-vocabulary";
import { createTeacherNotebook } from "./teacher-notebook";

vi.mock("../utils/speaking-api-client", () => ({
	addCallVocabulary: vi.fn(),
}));

const savedPhrase = {
	id: "11111111-1111-4111-8111-111111111111",
	term: "went",
	cefr: "A2" as const,
	definition: "past of go",
	savedAt: "2026-10-03T00:00:00.000Z",
};

describe("add vocabulary tool", () => {
	const publisher: EmotionPublisher = {
		publishData: vi.fn(async () => undefined),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns before the save finishes and publishes only after success", async () => {
		let resolveSave: (value: {
			status: "added";
			phrase: typeof savedPhrase;
		}) => void = () => undefined;
		vi.mocked(addCallVocabulary).mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveSave = resolve;
				}),
		);
		const notebook = createTeacherNotebook({
			sourceLanguage: "English",
			languageLevel: "B1",
		});
		const tool = createAddVocabularyTool({
			publisher,
			callId: "call-1",
			notebook,
		});

		const first = await tool.execute(saveArgs(), toolContext());
		const duplicate = await tool.execute(saveArgs(), toolContext());

		expect(first).toEqual({ status: "adding", term: "went" });
		expect(duplicate).toEqual({ status: "already_in_deck", term: "went" });
		expect(addCallVocabulary).toHaveBeenCalledTimes(1);
		expect(publisher.publishData).not.toHaveBeenCalled();

		resolveSave({ status: "added", phrase: savedPhrase });
		await vi.waitFor(() => {
			expect(publisher.publishData).toHaveBeenCalledTimes(1);
		});
		const [bytes, options] = vi.mocked(publisher.publishData).mock.calls[0];
		expect(options).toMatchObject({
			reliable: true,
			topic: TEACHER_VOCABULARY_TOPIC,
		});
		expect(JSON.parse(new TextDecoder().decode(bytes))).toMatchObject({
			term: "went",
			definition: "past of go",
		});
		expect(notebook.instructionInput.vocabularyPhrases).toEqual([savedPhrase]);
		expect(notebook.pendingTerms.size).toBe(0);
	});
});

function saveArgs() {
	return {
		term: "went",
		cefr: "A2" as const,
		definition: "past of go",
	};
}

function toolContext() {
	return {
		ctx: {} as never,
		toolCallId: "tool-call",
		abortSignal: new AbortController().signal,
	};
}

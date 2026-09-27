import { describe, expect, it } from "vitest";

import {
	createVocabularyPhraseBodySchema,
	updateVocabularyPhraseBodySchema,
	vocabularyPhraseSchema,
} from "./vocabulary-phrase";

describe("vocabularyPhraseSchema", () => {
	it("accepts a full phrase payload", () => {
		const parsed = vocabularyPhraseSchema.parse({
			id: "550e8400-e29b-41d4-a716-446655440000",
			term: "Paradigm shift",
			phonetic: "/ˈpær.ə.daɪm/",
			cefr: "C1",
			definition: "A fundamental change in approach.",
			exampleSentence: "Cloud computing was a paradigm shift.",
			savedAt: "2026-03-27T10:15:00.000Z",
		});
		expect(parsed.term).toBe("Paradigm shift");
	});
});

describe("createVocabularyPhraseBodySchema", () => {
	it("requires term, cefr, and definition", () => {
		const result = createVocabularyPhraseBodySchema.safeParse({
			term: "word",
			cefr: "b2",
			definition: "meaning",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.cefr).toBe("B2");
		}
	});
});

describe("updateVocabularyPhraseBodySchema", () => {
	it("rejects an empty patch", () => {
		const result = updateVocabularyPhraseBodySchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

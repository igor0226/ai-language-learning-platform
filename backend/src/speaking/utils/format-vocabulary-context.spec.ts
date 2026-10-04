import { describe, expect, it } from "vitest";

import { formatVocabularyContext } from "./format-vocabulary-context";

describe("formatVocabularyContext", () => {
	it("describes an empty deck", () => {
		expect(formatVocabularyContext([])).toContain("deck is empty");
	});

	it("lists existing phrases", () => {
		const text = formatVocabularyContext([
			{
				id: "00000000-0000-4000-8000-000000000001",
				term: "Run into",
				cefr: "B2",
				definition: "Meet unexpectedly.",
				savedAt: "2026-01-01T00:00:00.000Z",
			},
		]);
		expect(text).toContain("Run into (B2)");
	});
});

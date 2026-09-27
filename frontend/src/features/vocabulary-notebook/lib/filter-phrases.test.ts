import type { VocabularyPhrase } from "@llp/contracts";

import { describe, expect, it } from "vitest";

import { filterSavedPhrases } from "./filter-phrases";

const sample: VocabularyPhrase[] = [
	{
		id: "550e8400-e29b-41d4-a716-446655440001",
		term: "Hello",
		cefr: "A1",
		definition: "A greeting.",
		savedAt: "2026-03-27T10:00:00.000Z",
	},
	{
		id: "550e8400-e29b-41d4-a716-446655440002",
		term: "Paradigm shift",
		cefr: "C1",
		definition: "A fundamental change in approach.",
		exampleSentence: "Cloud computing was a paradigm shift.",
		savedAt: "2026-03-27T11:00:00.000Z",
	},
];

describe("filterSavedPhrases", () => {
	it("filters by search query and CEFR level", () => {
		expect(filterSavedPhrases(sample, "paradigm", "all")).toHaveLength(1);
		expect(filterSavedPhrases(sample, "shift", "all")).toHaveLength(1);
		expect(filterSavedPhrases(sample, "", "A1")).toHaveLength(1);
		expect(filterSavedPhrases(sample, "hello", "C1")).toHaveLength(0);
	});
});

import type { SavedPhrase } from "@/entities/speaking-session";

import { describe, expect, it } from "vitest";

import { filterSavedPhrases } from "./filter-phrases";

const sample: SavedPhrase[] = [
	{
		id: "1",
		term: "Hello",
		phonetic: "/həˈloʊ/",
		cefr: "A1",
		definition: "A greeting",
		savedAt: "10:00",
	},
	{
		id: "2",
		term: "Paradigm",
		phonetic: "/ˈpær.ə.daɪm/",
		cefr: "C1",
		definition: "A typical pattern",
		exampleSentence: "A paradigm shift",
		savedAt: "11:00",
	},
];

describe("filterSavedPhrases", () => {
	it("filters by search query and level", () => {
		expect(filterSavedPhrases(sample, "paradigm", "all")).toHaveLength(1);
		expect(filterSavedPhrases(sample, "shift", "all")).toHaveLength(1);
		expect(filterSavedPhrases(sample, "", "A1")).toHaveLength(1);
		expect(filterSavedPhrases(sample, "hello", "C1")).toHaveLength(0);
	});
});

import { describe, expect, it } from "vitest";

import { buildPhraseEntry } from "./build-phrase-entry";

describe("buildPhraseEntry", () => {
	it("trims fields and applies defaults", () => {
		const entry = buildPhraseEntry({
			term: "  word  ",
			phonetic: "",
			cefr: "A2",
			definition: " meaning ",
		});
		expect(entry.term).toBe("word");
		expect(entry.phonetic).toBe("/.../");
		expect(entry.definition).toBe("meaning");
		expect(entry.id).toMatch(/^phrase-/);
	});
});

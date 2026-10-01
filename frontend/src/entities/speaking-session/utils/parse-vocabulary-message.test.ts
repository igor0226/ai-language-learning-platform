import { parseVocabularyMessage } from "./parse-vocabulary-message";

function encode(value: unknown): Uint8Array {
	return new TextEncoder().encode(JSON.stringify(value));
}

describe("parseVocabularyMessage", () => {
	it("parses a valid payload", () => {
		expect(
			parseVocabularyMessage(
				encode({
					term: "Run into",
					cefr: "B2",
					definition: "Meet unexpectedly.",
				}),
			),
		).toEqual({
			term: "Run into",
			cefr: "B2",
			definition: "Meet unexpectedly.",
		});
	});

	it("rejects invalid payloads", () => {
		expect(parseVocabularyMessage(encode({ term: "x" }))).toBeNull();
		expect(parseVocabularyMessage(new TextEncoder().encode("{"))).toBeNull();
	});
});

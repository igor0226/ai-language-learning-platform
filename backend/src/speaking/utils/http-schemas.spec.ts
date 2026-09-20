import { describe, expect, it } from "vitest";

import { createCallBodySchema } from "./http-schemas";

describe("speaking http schemas", () => {
	it("accepts a valid create-call body", () => {
		expect(
			createCallBodySchema.parse({
				sourceLanguage: "English",
				languageLevel: "b1",
				explanationLanguage: " Spanish ",
				topic: " Airport ",
			}),
		).toEqual({
			sourceLanguage: "English",
			languageLevel: "B1",
			explanationLanguage: "Spanish",
			topic: "Airport",
		});
	});

	it("rejects an empty topic string", () => {
		const parsed = createCallBodySchema.safeParse({
			sourceLanguage: "English",
			languageLevel: "B1",
			topic: "   ",
		});
		expect(parsed.success).toBe(false);
	});
});

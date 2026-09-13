import { describe, expect, it } from "vitest";

import { createCallBodySchema, requiredUserIdSchema } from "./http-schemas";

describe("speaking http schemas", () => {
	it("accepts a valid create-call body", () => {
		expect(
			createCallBodySchema.parse({
				userId: " user-1 ",
				sourceLanguage: "English",
				languageLevel: "b1",
				explanationLanguage: " Spanish ",
				topic: " Airport ",
			}),
		).toEqual({
			userId: "user-1",
			sourceLanguage: "English",
			languageLevel: "B1",
			explanationLanguage: "Spanish",
			topic: "Airport",
		});
	});

	it("rejects an empty topic string", () => {
		const parsed = createCallBodySchema.safeParse({
			userId: "user-1",
			sourceLanguage: "English",
			languageLevel: "B1",
			topic: "   ",
		});
		expect(parsed.success).toBe(false);
	});

	it("requires a non-empty userId", () => {
		expect(requiredUserIdSchema.safeParse("").success).toBe(false);
		expect(requiredUserIdSchema.parse("  abc  ")).toBe("abc");
	});
});

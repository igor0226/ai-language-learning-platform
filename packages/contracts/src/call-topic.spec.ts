import { describe, expect, it } from "vitest";

import {
	callTopicSchema,
	createCallTopicBodySchema,
	updateCallTopicBodySchema,
} from "./call-topic";

describe("callTopicSchema", () => {
	it("accepts a full topic payload", () => {
		const parsed = callTopicSchema.parse({
			id: "topic-2",
			title: "Daily life",
			level: "B1-B2",
			description: "Talk about hobbies.",
			suggestedDurationMins: 10,
			isCustom: false,
			createdAt: "2026-01-01T00:00:00.000Z",
		});
		expect(parsed.isCustom).toBe(false);
	});
});

describe("createCallTopicBodySchema", () => {
	it("requires title, level, and description", () => {
		const result = createCallTopicBodySchema.safeParse({
			title: "My topic",
			level: "B2-C1",
			description: "Scenario text.",
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid level bands", () => {
		const result = createCallTopicBodySchema.safeParse({
			title: "T",
			level: "B2",
			description: "D",
		});
		expect(result.success).toBe(false);
	});
});

describe("updateCallTopicBodySchema", () => {
	it("rejects an empty patch", () => {
		const result = updateCallTopicBodySchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

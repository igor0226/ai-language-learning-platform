import { describe, expect, it } from "vitest";

import {
	TEACHER_EMOTIONS,
	formatAllowedEmotions,
	isTeacherEmotion,
	teacherEmotionMessageSchema,
} from "./teacher-emotion";

describe("teacher emotion contracts", () => {
	it("accepts a valid message", () => {
		expect(
			teacherEmotionMessageSchema.parse({
				emotion: "smile",
				intensity: 2,
				source: "reply",
			}),
		).toEqual({ emotion: "smile", intensity: 2, source: "reply" });
	});

	it("rejects unknown emotions", () => {
		expect(isTeacherEmotion("wink")).toBe(false);
		expect(
			teacherEmotionMessageSchema.safeParse({
				emotion: "wink",
				source: "reply",
			}).success,
		).toBe(false);
	});

	it("formats the allowed-emotion list from the schema values", () => {
		expect(formatAllowedEmotions()).toBe(TEACHER_EMOTIONS.join(", "));
	});
});

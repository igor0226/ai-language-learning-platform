import { describe, expect, it } from "vitest";

import {
	formToCreateBody,
	formToUpdateBody,
	validateTopicForm,
} from "./topic-form";

describe("topic form helpers", () => {
	it("validates required fields", () => {
		expect(
			validateTopicForm({
				title: "",
				level: "B1-B2",
				duration: 10,
				description: "desc",
			}),
		).toBeTruthy();
	});

	it("maps form state to API bodies", () => {
		const createBody = formToCreateBody({
			title: "My topic",
			level: "B1-B2",
			duration: 12,
			description: "Practice desc",
		});
		expect(createBody.title).toBe("My topic");
		expect(createBody.level).toBe("B1-B2");
		expect(createBody.suggestedDurationMins).toBe(12);

		const updateBody = formToUpdateBody({
			title: "Updated",
			level: "B2-C1",
			duration: 20,
			description: "New desc",
		});
		expect(updateBody.title).toBe("Updated");
		expect(updateBody.level).toBe("B2-C1");
		expect(updateBody.suggestedDurationMins).toBe(20);
	});
});

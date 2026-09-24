import { describe, expect, it } from "vitest";

import {
	createCustomTopic,
	updateTopicFromForm,
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

	it("creates and updates custom topics", () => {
		const created = createCustomTopic({
			title: "My topic",
			level: "B1-B2",
			duration: 12,
			description: "Practice desc",
		});
		expect(created.isCustom).toBe(true);

		const updated = updateTopicFromForm(created, {
			title: "Updated",
			level: "B2-C1",
			duration: 20,
			description: "New desc",
		});
		expect(updated.title).toBe("Updated");
		expect(updated.level).toBe("B2-C1");
	});
});

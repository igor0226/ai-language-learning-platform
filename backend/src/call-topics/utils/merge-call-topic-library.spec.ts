import { describe, expect, it } from "vitest";

import type { UserCallTopicRecord } from "@/storage/type";

import { DEFAULT_CALL_TOPIC_CATALOG } from "../default-call-topics";
import {
	findTopicInLibrary,
	mergeCallTopicLibrary,
	resolveTopicForUser,
	topicContentEqualsCatalog,
} from "./merge-call-topic-library";

const userId = "550e8400-e29b-41d4-a716-446655440000";

function customRow(partial: Partial<UserCallTopicRecord>): UserCallTopicRecord {
	return {
		userId,
		topicId: "custom-1",
		kind: "custom",
		title: "My topic",
		level: "B2-C1",
		description: "Custom scenario",
		suggestedDurationMins: 12,
		createdAt: "2026-03-01T12:00:00.000Z",
		updatedAt: "2026-03-01T12:00:00.000Z",
		...partial,
	};
}

describe("mergeCallTopicLibrary", () => {
	it("returns catalog presets when the user has no rows", () => {
		const topics = mergeCallTopicLibrary({
			catalog: DEFAULT_CALL_TOPIC_CATALOG,
			rows: [],
		});
		expect(topics).toHaveLength(3);
		expect(topics.map((topic) => topic.id)).toEqual([
			"topic-2",
			"topic-1",
			"topic-3",
		]);
		expect(topics.every((topic) => topic.isCustom === false)).toBe(true);
	});

	it("prepends custom topics newest first", () => {
		const topics = mergeCallTopicLibrary({
			catalog: DEFAULT_CALL_TOPIC_CATALOG,
			rows: [
				customRow({
					topicId: "older",
					createdAt: "2026-02-01T12:00:00.000Z",
				}),
				customRow({
					topicId: "newer",
					createdAt: "2026-03-01T12:00:00.000Z",
				}),
			],
		});
		expect(topics[0]?.id).toBe("newer");
		expect(topics[1]?.id).toBe("older");
		expect(topics).toHaveLength(5);
	});

	it("substitutes overrides in catalog order", () => {
		const topics = mergeCallTopicLibrary({
			catalog: DEFAULT_CALL_TOPIC_CATALOG,
			rows: [
				{
					userId,
					topicId: "topic-1",
					kind: "override",
					title: "Edited interview",
					level: "B2-C1",
					description: "Changed",
					suggestedDurationMins: 20,
					createdAt: "2026-02-01T00:00:00.000Z",
					updatedAt: "2026-02-01T00:00:00.000Z",
				},
			],
		});
		const interview = topics.find((topic) => topic.id === "topic-1");
		expect(interview?.title).toBe("Edited interview");
		expect(interview?.isCustom).toBe(false);
	});

	it("omits hidden catalog topics", () => {
		const topics = mergeCallTopicLibrary({
			catalog: DEFAULT_CALL_TOPIC_CATALOG,
			rows: [
				{
					userId,
					topicId: "topic-3",
					kind: "hidden",
					title: null,
					level: null,
					description: null,
					suggestedDurationMins: null,
					createdAt: "2026-02-01T00:00:00.000Z",
					updatedAt: "2026-02-01T00:00:00.000Z",
				},
			],
		});
		expect(topics.map((topic) => topic.id)).toEqual(["topic-2", "topic-1"]);
	});
});

describe("resolveTopicForUser", () => {
	it("returns a catalog preset when there is no overlay row", () => {
		const topic = resolveTopicForUser({
			catalog: DEFAULT_CALL_TOPIC_CATALOG,
			topicId: "topic-2",
			row: null,
		});
		expect(topic?.title).toContain("life, work, and hobbies");
		expect(topic?.isCustom).toBe(false);
	});

	it("returns undefined for an unknown topic ID", () => {
		const topic = resolveTopicForUser({
			catalog: DEFAULT_CALL_TOPIC_CATALOG,
			topicId: "unknown-topic-id",
			row: null,
		});
		expect(topic).toBeUndefined();
	});

	it("returns undefined for a hidden catalog preset", () => {
		const topic = resolveTopicForUser({
			catalog: DEFAULT_CALL_TOPIC_CATALOG,
			topicId: "topic-3",
			row: {
				userId,
				topicId: "topic-3",
				kind: "hidden",
				title: null,
				level: null,
				description: null,
				suggestedDurationMins: null,
				createdAt: "2026-02-01T00:00:00.000Z",
				updatedAt: "2026-02-01T00:00:00.000Z",
			},
		});
		expect(topic).toBeUndefined();
	});

	it("returns a custom topic from its row", () => {
		const row = customRow({ topicId: "550e8400-e29b-41d4-a716-446655440099" });
		const topic = resolveTopicForUser({
			catalog: DEFAULT_CALL_TOPIC_CATALOG,
			topicId: row.topicId,
			row,
		});
		expect(topic?.isCustom).toBe(true);
		expect(topic?.title).toBe("My topic");
	});

	it("matches mergeCallTopicLibrary for overlay rows", () => {
		const rows = [
			customRow({ topicId: "custom-a" }),
			{
				userId,
				topicId: "topic-1",
				kind: "override" as const,
				title: "Edited interview",
				level: "B2-C1",
				description: "Changed",
				suggestedDurationMins: 20,
				createdAt: "2026-02-01T00:00:00.000Z",
				updatedAt: "2026-02-01T00:00:00.000Z",
			},
		];
		const merged = mergeCallTopicLibrary({
			catalog: DEFAULT_CALL_TOPIC_CATALOG,
			rows,
		});
		for (const topicId of ["custom-a", "topic-1", "topic-2", "missing-id"]) {
			const row = rows.find((entry) => entry.topicId === topicId) ?? null;
			const resolved = resolveTopicForUser({
				catalog: DEFAULT_CALL_TOPIC_CATALOG,
				topicId,
				row,
			});
			expect(resolved).toEqual(findTopicInLibrary(merged, topicId));
		}
	});
});

describe("topicContentEqualsCatalog", () => {
	it("detects matching catalog content", () => {
		const entry = DEFAULT_CALL_TOPIC_CATALOG[0];
		expect(
			topicContentEqualsCatalog(entry, {
				title: entry.title,
				level: entry.level,
				description: entry.description,
				suggestedDurationMins: entry.suggestedDurationMins,
			}),
		).toBe(true);
	});
});

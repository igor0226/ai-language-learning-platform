import type { CallTopic } from "@llp/contracts";

import type { DefaultCallTopicCatalogEntry } from "../default-call-topics";
import type { UserCallTopicRecord } from "@/storage/type";

export type CallTopicContent = {
	title: string;
	level: CallTopic["level"];
	description: string;
	suggestedDurationMins: number;
};

export function topicContentEqualsCatalog(
	catalogEntry: DefaultCallTopicCatalogEntry,
	content: CallTopicContent,
): boolean {
	return (
		catalogEntry.title === content.title &&
		catalogEntry.level === content.level &&
		catalogEntry.description === content.description &&
		catalogEntry.suggestedDurationMins === content.suggestedDurationMins
	);
}

export function catalogEntryToCallTopic(
	entry: DefaultCallTopicCatalogEntry,
): CallTopic {
	return {
		id: entry.id,
		title: entry.title,
		level: entry.level,
		description: entry.description,
		suggestedDurationMins: entry.suggestedDurationMins,
		isCustom: false,
		createdAt: entry.createdAt,
	};
}

export function customRowToCallTopic(row: UserCallTopicRecord): CallTopic {
	return {
		id: row.topicId,
		title: row.title ?? "",
		level: (row.level ?? "B1-B2") as CallTopic["level"],
		description: row.description ?? "",
		suggestedDurationMins: row.suggestedDurationMins ?? 15,
		isCustom: true,
		createdAt: row.createdAt,
	};
}

export function overrideRowToCallTopic(
	row: UserCallTopicRecord,
	catalogCreatedAt: string,
): CallTopic {
	return {
		id: row.topicId,
		title: row.title ?? "",
		level: (row.level ?? "B1-B2") as CallTopic["level"],
		description: row.description ?? "",
		suggestedDurationMins: row.suggestedDurationMins ?? 15,
		isCustom: false,
		createdAt: catalogCreatedAt,
	};
}

export function mergeCallTopicLibrary(input: {
	catalog: DefaultCallTopicCatalogEntry[];
	rows: UserCallTopicRecord[];
}): CallTopic[] {
	const hiddenIds = new Set(
		input.rows.filter((row) => row.kind === "hidden").map((row) => row.topicId),
	);
	const overrideById = new Map(
		input.rows
			.filter((row) => row.kind === "override")
			.map((row) => [row.topicId, row]),
	);
	const customRows = input.rows
		.filter((row) => row.kind === "custom")
		.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

	const customTopics = customRows.map(customRowToCallTopic);

	const catalogTopics = input.catalog
		.filter((entry) => !hiddenIds.has(entry.id))
		.map((entry) => {
			const override = overrideById.get(entry.id);
			if (override) {
				return overrideRowToCallTopic(override, entry.createdAt);
			}
			return catalogEntryToCallTopic(entry);
		});

	return [...customTopics, ...catalogTopics];
}

export function findTopicInLibrary(
	topics: CallTopic[],
	topicId: string,
): CallTopic | undefined {
	return topics.find((topic) => topic.id === topicId);
}

/** Resolve one topic from a catalog preset and/or a single overlay row (PK lookup). */
export function resolveTopicForUser(input: {
	catalog: DefaultCallTopicCatalogEntry[];
	topicId: string;
	row: UserCallTopicRecord | null;
}): CallTopic | undefined {
	const catalogEntry = input.catalog.find(
		(entry) => entry.id === input.topicId,
	);
	if (catalogEntry) {
		if (input.row?.kind === "hidden") {
			return undefined;
		}
		if (input.row?.kind === "override") {
			return overrideRowToCallTopic(input.row, catalogEntry.createdAt);
		}
		return catalogEntryToCallTopic(catalogEntry);
	}

	if (input.row?.kind === "custom") {
		return customRowToCallTopic(input.row);
	}

	return undefined;
}

import { describe, expect, it, vi } from "vitest";

import { VocabularyRepositoryService } from "./vocabulary-repository.service";

describe("VocabularyRepositoryService", () => {
	it("creates a phrase with default savedAt", async () => {
		const saved: unknown[] = [];
		const repository = {
			save: vi.fn(async (record: unknown) => {
				saved.push(record);
				return record;
			}),
			find: vi.fn(),
			findOne: vi.fn(),
			delete: vi.fn(),
		};
		const service = new VocabularyRepositoryService(repository as never);

		const created = await service.createPhrase({
			userId: "550e8400-e29b-41d4-a716-446655440000",
			term: "Paradigm shift",
			cefr: "C1",
			definition: "A fundamental change in approach.",
		});

		expect(created.term).toBe("Paradigm shift");
		expect(created.exampleSentence).toBeNull();
		expect(saved).toHaveLength(1);
	});

	it("returns null when updating a missing phrase", async () => {
		const repository = {
			findOne: vi.fn(async () => null),
			save: vi.fn(),
			find: vi.fn(),
			delete: vi.fn(),
		};
		const service = new VocabularyRepositoryService(repository as never);

		const updated = await service.updatePhrase({
			phraseId: "550e8400-e29b-41d4-a716-446655440001",
			userId: "550e8400-e29b-41d4-a716-446655440000",
			patch: { term: "Updated" },
		});

		expect(updated).toBeNull();
	});
});

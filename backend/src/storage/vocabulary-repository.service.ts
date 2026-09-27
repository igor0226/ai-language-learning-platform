import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserVocabularyPhrase } from "../models";
import type {
	CreateVocabularyPhraseInput,
	UpdateVocabularyPhraseInput,
	VocabularyPhraseRecord,
} from "./type";
import { isInvalidUuidError } from "./utils/postgres-errors";
import { normalizeVocabularyPhraseRecord } from "./utils/vocabulary-phrase-record";

function parseSavedAt(value: string | undefined): string {
	if (value?.trim()) {
		const parsed = Date.parse(value);
		if (!Number.isNaN(parsed)) {
			return new Date(parsed).toISOString();
		}
	}
	return new Date().toISOString();
}

@Injectable()
export class VocabularyRepositoryService {
	constructor(
		@InjectRepository(UserVocabularyPhrase)
		private readonly phraseRepository: Repository<UserVocabularyPhrase>,
	) {}

	async listForUser(userId: string): Promise<VocabularyPhraseRecord[]> {
		const records = await this.phraseRepository.find({
			where: { userId },
			order: { savedAt: "DESC" },
		});
		return records.map(normalizeVocabularyPhraseRecord);
	}

	async getForUser(input: {
		phraseId: string;
		userId: string;
	}): Promise<VocabularyPhraseRecord | null> {
		try {
			const record = await this.phraseRepository.findOne({
				where: { id: input.phraseId, userId: input.userId },
			});
			return record ? normalizeVocabularyPhraseRecord(record) : null;
		} catch (error) {
			if (isInvalidUuidError(error)) {
				return null;
			}
			throw error;
		}
	}

	async createPhrase(
		input: CreateVocabularyPhraseInput,
	): Promise<VocabularyPhraseRecord> {
		const nowIso = new Date().toISOString();
		const savedAt = parseSavedAt(input.savedAt);
		const record: VocabularyPhraseRecord = {
			id: randomUUID(),
			userId: input.userId,
			term: input.term.trim(),
			phonetic: input.phonetic?.trim() || "/.../",
			cefr: input.cefr,
			definition: input.definition.trim(),
			exampleSentence: input.exampleSentence?.trim() || null,
			savedAt,
			updatedAt: nowIso,
		};
		await this.phraseRepository.save(record);
		return record;
	}

	async updatePhrase(input: {
		phraseId: string;
		userId: string;
		patch: UpdateVocabularyPhraseInput;
	}): Promise<VocabularyPhraseRecord | null> {
		const existing = await this.getForUser({
			phraseId: input.phraseId,
			userId: input.userId,
		});
		if (!existing) {
			return null;
		}

		const updated: VocabularyPhraseRecord = {
			...existing,
			term: input.patch.term?.trim() ?? existing.term,
			phonetic: input.patch.phonetic?.trim() ?? existing.phonetic,
			cefr: input.patch.cefr ?? existing.cefr,
			definition: input.patch.definition?.trim() ?? existing.definition,
			exampleSentence:
				input.patch.exampleSentence === undefined
					? existing.exampleSentence
					: input.patch.exampleSentence,
			savedAt: input.patch.savedAt
				? parseSavedAt(input.patch.savedAt)
				: existing.savedAt,
			updatedAt: new Date().toISOString(),
		};
		await this.phraseRepository.save(updated);
		return updated;
	}

	async deletePhrase(input: {
		phraseId: string;
		userId: string;
	}): Promise<boolean> {
		const result = await this.phraseRepository.delete({
			id: input.phraseId,
			userId: input.userId,
		});
		return (result.affected ?? 0) > 0;
	}
}

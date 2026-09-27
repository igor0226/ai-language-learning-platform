import {
	type CreateVocabularyPhraseBody,
	type UpdateVocabularyPhraseBody,
	type VocabularyPhrase,
} from "@llp/contracts";
import { Injectable, NotFoundException } from "@nestjs/common";

import { VocabularyRepositoryService } from "@/storage/vocabulary-repository.service";

import { toVocabularyPhraseApi } from "./utils/to-vocabulary-phrase-api";

@Injectable()
export class VocabularyService {
	constructor(
		private readonly vocabularyRepository: VocabularyRepositoryService,
	) {}

	async listPhrases(input: { userId: string }): Promise<VocabularyPhrase[]> {
		const records = await this.vocabularyRepository.listForUser(input.userId);
		return records.map(toVocabularyPhraseApi);
	}

	async createPhrase(input: {
		userId: string;
		body: CreateVocabularyPhraseBody;
	}): Promise<VocabularyPhrase> {
		const record = await this.vocabularyRepository.createPhrase({
			userId: input.userId,
			term: input.body.term,
			phonetic: input.body.phonetic,
			cefr: input.body.cefr,
			definition: input.body.definition,
			exampleSentence: input.body.exampleSentence,
			savedAt: input.body.savedAt,
		});
		return toVocabularyPhraseApi(record);
	}

	async updatePhrase(input: {
		userId: string;
		phraseId: string;
		body: UpdateVocabularyPhraseBody;
	}): Promise<VocabularyPhrase> {
		const record = await this.vocabularyRepository.updatePhrase({
			phraseId: input.phraseId,
			userId: input.userId,
			patch: input.body,
		});
		if (!record) {
			throw new NotFoundException("Vocabulary phrase not found");
		}
		return toVocabularyPhraseApi(record);
	}

	async deletePhrase(input: {
		userId: string;
		phraseId: string;
	}): Promise<void> {
		const deleted = await this.vocabularyRepository.deletePhrase({
			phraseId: input.phraseId,
			userId: input.userId,
		});
		if (!deleted) {
			throw new NotFoundException("Vocabulary phrase not found");
		}
	}
}

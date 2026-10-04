import {
	type AgentAddVocabularyBody,
	type AgentAddVocabularyResult,
	type VocabularyPhrase,
} from "@llp/contracts";
import { Injectable, NotFoundException } from "@nestjs/common";

import { CallRepositoryService } from "@/storage/call-repository.service";
import { VocabularyService } from "@/vocabulary/vocabulary.service";

import { normalizeVocabularyTerm } from "./utils/normalize-vocabulary-term";

@Injectable()
export class AgentSpeakingVocabularyService {
	constructor(
		private readonly callRepository: CallRepositoryService,
		private readonly vocabularyService: VocabularyService,
	) {}

	async listForCall(input: { callId: string }): Promise<VocabularyPhrase[]> {
		const userId = await this.resolveCallOwner(input.callId);
		return this.vocabularyService.listPhrases({ userId });
	}

	async addForCall(input: {
		callId: string;
		body: AgentAddVocabularyBody;
	}): Promise<AgentAddVocabularyResult> {
		const userId = await this.resolveCallOwner(input.callId);
		const phrases = await this.vocabularyService.listPhrases({ userId });
		const normalized = normalizeVocabularyTerm(input.body.term);
		const duplicate = phrases.find(
			(phrase) => normalizeVocabularyTerm(phrase.term) === normalized,
		);
		if (duplicate) {
			return { status: "already_in_deck", term: duplicate.term };
		}
		const phrase = await this.vocabularyService.createPhrase({
			userId,
			body: input.body,
		});
		return { status: "added", phrase };
	}

	private async resolveCallOwner(callId: string): Promise<string> {
		const call = await this.callRepository.getCall(callId);
		if (!call) {
			throw new NotFoundException("Call not found");
		}
		return call.userId;
	}
}

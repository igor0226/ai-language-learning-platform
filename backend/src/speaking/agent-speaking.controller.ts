import {
	agentAddVocabularyBodySchema,
	type AgentAddVocabularyBody,
	vocabularyPhraseListSchema,
} from "@llp/contracts";
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";

import { ZodValidationPipe } from "@/http/utils/zod-validation-pipe";

import { AgentApiGuard } from "./agent-api.guard";
import { AgentSpeakingVocabularyService } from "./agent-speaking-vocabulary.service";

@Controller("agent/speaking")
@UseGuards(AgentApiGuard)
export class AgentSpeakingController {
	constructor(
		private readonly agentVocabulary: AgentSpeakingVocabularyService,
	) {}

	@Get("calls/:callId/vocabulary")
	async listVocabulary(@Param("callId") callId: string) {
		const phrases = await this.agentVocabulary.listForCall({ callId });
		return vocabularyPhraseListSchema.parse({ phrases });
	}

	@Post("calls/:callId/vocabulary")
	async addVocabulary(
		@Param("callId") callId: string,
		@Body(new ZodValidationPipe(agentAddVocabularyBodySchema))
		body: AgentAddVocabularyBody,
	) {
		return this.agentVocabulary.addForCall({ callId, body });
	}
}

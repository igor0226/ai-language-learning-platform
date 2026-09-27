import {
	createVocabularyPhraseBodySchema,
	type CreateVocabularyPhraseBody,
	updateVocabularyPhraseBodySchema,
	type UpdateVocabularyPhraseBody,
} from "@llp/contracts";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";

import { AuthenticatedGuard } from "@/auth/authenticated.guard";
import type { AuthenticatedRequest } from "@/auth/type/express-request";
import { getAuthenticatedUser } from "@/auth/utils/get-authenticated-user";
import { ZodValidationPipe } from "@/http/utils/zod-validation-pipe";

import { VocabularyService } from "./vocabulary.service";

@Controller("vocabulary")
@UseGuards(AuthenticatedGuard)
export class VocabularyController {
	constructor(private readonly vocabularyService: VocabularyService) {}

	@Get("phrases")
	async listPhrases(@Req() request: AuthenticatedRequest) {
		const user = getAuthenticatedUser(request);
		const phrases = await this.vocabularyService.listPhrases({
			userId: user.id,
		});
		return { phrases };
	}

	@Post("phrases")
	async createPhrase(
		@Body(new ZodValidationPipe(createVocabularyPhraseBodySchema))
		body: CreateVocabularyPhraseBody,
		@Req() request: AuthenticatedRequest,
	) {
		const user = getAuthenticatedUser(request);
		return this.vocabularyService.createPhrase({ userId: user.id, body });
	}

	@Patch("phrases/:id")
	async updatePhrase(
		@Param("id") phraseId: string,
		@Body(new ZodValidationPipe(updateVocabularyPhraseBodySchema))
		body: UpdateVocabularyPhraseBody,
		@Req() request: AuthenticatedRequest,
	) {
		const user = getAuthenticatedUser(request);
		return this.vocabularyService.updatePhrase({
			userId: user.id,
			phraseId,
			body,
		});
	}

	@Delete("phrases/:id")
	@HttpCode(204)
	async deletePhrase(
		@Param("id") phraseId: string,
		@Req() request: AuthenticatedRequest,
	) {
		const user = getAuthenticatedUser(request);
		await this.vocabularyService.deletePhrase({
			userId: user.id,
			phraseId,
		});
	}
}

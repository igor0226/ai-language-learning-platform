import {
	createCallTopicBodySchema,
	type CreateCallTopicBody,
	updateCallTopicBodySchema,
	type UpdateCallTopicBody,
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

import { CallTopicsService } from "./call-topics.service";

@Controller("speaking/topics")
@UseGuards(AuthenticatedGuard)
export class CallTopicsController {
	constructor(private readonly callTopicsService: CallTopicsService) {}

	@Get()
	async listTopics(@Req() request: AuthenticatedRequest) {
		const user = getAuthenticatedUser(request);
		const topics = await this.callTopicsService.listTopics({
			userId: user.id,
		});
		return { topics };
	}

	@Post()
	async createTopic(
		@Body(new ZodValidationPipe(createCallTopicBodySchema))
		body: CreateCallTopicBody,
		@Req() request: AuthenticatedRequest,
	) {
		const user = getAuthenticatedUser(request);
		return this.callTopicsService.createTopic({ userId: user.id, body });
	}

	@Patch(":id")
	async updateTopic(
		@Param("id") topicId: string,
		@Body(new ZodValidationPipe(updateCallTopicBodySchema))
		body: UpdateCallTopicBody,
		@Req() request: AuthenticatedRequest,
	) {
		const user = getAuthenticatedUser(request);
		return this.callTopicsService.updateTopic({
			userId: user.id,
			topicId,
			body,
		});
	}

	@Delete(":id")
	@HttpCode(204)
	async deleteTopic(
		@Param("id") topicId: string,
		@Req() request: AuthenticatedRequest,
	) {
		const user = getAuthenticatedUser(request);
		await this.callTopicsService.deleteTopic({
			userId: user.id,
			topicId,
		});
	}
}

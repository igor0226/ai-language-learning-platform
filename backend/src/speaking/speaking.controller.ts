import {
	Body,
	Controller,
	Get,
	Headers,
	HttpCode,
	Param,
	Post,
	Query,
	Req,
	UnauthorizedException,
	type RawBodyRequest,
} from "@nestjs/common";
import type { Request } from "express";

import { ZodValidationPipe } from "../http/utils/zod-validation-pipe";
import { LivekitWebhookService } from "./livekit-webhook.service";
import { SpeakingService } from "./speaking.service";
import {
	createCallBodySchema,
	requiredUserIdSchema,
	type CreateCallBody,
} from "./utils/http-schemas";

@Controller("speaking")
export class SpeakingController {
	constructor(
		private readonly speakingService: SpeakingService,
		private readonly webhookService: LivekitWebhookService,
	) {}

	@Post("calls")
	async createCall(
		@Body(new ZodValidationPipe(createCallBodySchema)) body: CreateCallBody,
	) {
		return this.speakingService.createCall(body);
	}

	@Get("calls")
	async listCalls(
		@Query("userId", new ZodValidationPipe(requiredUserIdSchema))
		userId: string,
	) {
		return this.speakingService.listCallsForUser(userId);
	}

	@Get("calls/:id")
	async getCall(
		@Param("id") id: string,
		@Query("userId", new ZodValidationPipe(requiredUserIdSchema))
		userId: string,
	) {
		return this.speakingService.getCall({
			callId: id,
			userId,
		});
	}

	@Post("calls/:id/end")
	@HttpCode(200)
	async endCall(
		@Param("id") id: string,
		@Body("userId", new ZodValidationPipe(requiredUserIdSchema)) userId: string,
	) {
		const call = await this.speakingService.endCall({
			callId: id,
			userId,
		});
		return { id: call.id, status: call.status };
	}

	@Post("livekit/webhook")
	@HttpCode(200)
	async handleWebhook(
		@Req() req: RawBodyRequest<Request>,
		@Headers("authorization") authorization: string | undefined,
	) {
		const body = req.rawBody?.toString("utf8");
		if (!body) {
			throw new UnauthorizedException("Invalid LiveKit webhook");
		}
		return this.webhookService.handleWebhook({ body, authorization });
	}
}

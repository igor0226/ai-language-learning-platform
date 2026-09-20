import {
	Body,
	Controller,
	Get,
	Headers,
	HttpCode,
	Param,
	Post,
	Req,
	UnauthorizedException,
	UseGuards,
	type RawBodyRequest,
} from "@nestjs/common";
import type { Request } from "express";

import { AuthenticatedGuard } from "@/auth/authenticated.guard";
import type { AuthenticatedRequest } from "@/auth/type/express-request";
import { getAuthenticatedUser } from "@/auth/utils/get-authenticated-user";
import { ZodValidationPipe } from "../http/utils/zod-validation-pipe";
import { LivekitWebhookService } from "./livekit-webhook.service";
import { SpeakingService } from "./speaking.service";
import {
	createCallBodySchema,
	type CreateCallBody,
} from "./utils/http-schemas";

@Controller("speaking")
export class SpeakingController {
	constructor(
		private readonly speakingService: SpeakingService,
		private readonly webhookService: LivekitWebhookService,
	) {}

	@Post("calls")
	@UseGuards(AuthenticatedGuard)
	async createCall(
		@Body(new ZodValidationPipe(createCallBodySchema)) body: CreateCallBody,
		@Req() request: AuthenticatedRequest,
	) {
		const user = getAuthenticatedUser(request);
		return this.speakingService.createCall({
			...body,
			userId: user.id,
		});
	}

	@Get("calls")
	@UseGuards(AuthenticatedGuard)
	async listCalls(@Req() request: AuthenticatedRequest) {
		const user = getAuthenticatedUser(request);
		return this.speakingService.listCallsForUser(user.id);
	}

	@Get("calls/:id")
	@UseGuards(AuthenticatedGuard)
	async getCall(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
		const user = getAuthenticatedUser(request);
		return this.speakingService.getCall({
			callId: id,
			userId: user.id,
		});
	}

	@Post("calls/:id/end")
	@UseGuards(AuthenticatedGuard)
	@HttpCode(200)
	async endCall(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
		const user = getAuthenticatedUser(request);
		const call = await this.speakingService.endCall({
			callId: id,
			userId: user.id,
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

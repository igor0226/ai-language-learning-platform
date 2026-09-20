import type { Readable } from "node:stream";

import {
	Controller,
	Get,
	Header,
	NotFoundException,
	Param,
	Req,
	Res,
	StreamableFile,
	UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { AuthenticatedGuard } from "@/auth/authenticated.guard";
import type { AuthenticatedRequest } from "@/auth/type/express-request";
import { getAuthenticatedUser } from "@/auth/utils/get-authenticated-user";
import { DashService } from "./dash.service";

@Controller("dash")
@UseGuards(AuthenticatedGuard)
export class DashController {
	constructor(private readonly dashService: DashService) {}

	@Get(":videoId/manifest.mpd")
	@Header("Cache-Control", "no-store")
	async getManifest(
		@Param("videoId") videoId: string,
		@Req() request: AuthenticatedRequest,
		@Res({ passthrough: true }) res: Response,
	): Promise<string> {
		try {
			const user = getAuthenticatedUser(request);
			const manifest = await this.dashService.readDashManifest({
				videoId,
				userId: user.id,
			});
			res.setHeader("Content-Type", manifest.contentType);
			return manifest.content;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			const message =
				error instanceof Error ? error.message : "Failed to load DASH manifest";
			throw new NotFoundException(message);
		}
	}

	@Get(":videoId/segment/*path")
	@Header("Cache-Control", "public, max-age=31536000, immutable")
	async getSegment(
		@Param("videoId") videoId: string,
		@Req() req: Request & AuthenticatedRequest,
		@Res({ passthrough: true }) res: Response,
	): Promise<StreamableFile> {
		try {
			const user = getAuthenticatedUser(req);
			const marker = "/segment/";
			const markerIndex = req.path.indexOf(marker);
			const assetPath =
				markerIndex >= 0 ? req.path.slice(markerIndex + marker.length) : "";
			const parts = assetPath
				.split("/")
				.map((part) => decodeURIComponent(part.trim()))
				.filter(Boolean);
			const asset = await this.dashService.getDashAssetStream({
				videoId,
				userId: user.id,
				assetPathParts: parts,
			});
			res.setHeader("Content-Type", asset.contentType);
			return new StreamableFile(asset.stream as Readable);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			const message =
				error instanceof Error ? error.message : "Failed to load DASH segment";
			throw new NotFoundException(message);
		}
	}
}

import { parseLanguageLevel } from "@llp/contracts";
import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { memoryStorage } from "multer";

import { AuthenticatedGuard } from "@/auth/authenticated.guard";
import type { AuthenticatedRequest } from "@/auth/type/express-request";
import { getAuthenticatedUser } from "@/auth/utils/get-authenticated-user";
import { VideosService } from "./videos.service";

@Controller("videos")
@UseGuards(AuthenticatedGuard)
export class VideosController {
	constructor(private readonly videosService: VideosService) {}

	@Get()
	async listVideos(@Req() request: AuthenticatedRequest) {
		const user = getAuthenticatedUser(request);
		const videos = await this.videosService.listVideosForApi(user.id);
		const payload = videos.map((video) => ({
			...video,
			dashManifestUrl: video.playable ? `/api/dash/${video.id}/manifest` : null,
		}));
		return { videos: payload };
	}

	@Get(":id/status")
	async getStatus(
		@Param("id") id: string,
		@Req() request: AuthenticatedRequest,
	) {
		const user = getAuthenticatedUser(request);
		return this.videosService.getVideoStatusForApi({
			videoId: id,
			userId: user.id,
		});
	}

	@Get(":id/playback-phrases")
	async getPlaybackPhrases(
		@Param("id") id: string,
		@Req() request: AuthenticatedRequest,
	) {
		const user = getAuthenticatedUser(request);
		return this.videosService.getPlaybackPhrasesForApi({
			videoId: id,
			userId: user.id,
		});
	}

	@Post(":id/retry")
	@HttpCode(200)
	async retryVideo(
		@Param("id") id: string,
		@Req() request: AuthenticatedRequest,
	) {
		const user = getAuthenticatedUser(request);
		return this.videosService.retryFailedVideo({
			videoId: id,
			userId: user.id,
		});
	}

	@Post("upload")
	@UseInterceptors(
		FileInterceptor("file", {
			storage: memoryStorage(),
			limits: { fileSize: 1024 * 1024 * 1024 },
		}),
	)
	async upload(
		@UploadedFile() file: Express.Multer.File | undefined,
		@Body("title") title: string | undefined,
		@Body("sourceLanguage") sourceLanguage: string | undefined,
		@Body("explanationLanguage") explanationLanguage: string | undefined,
		@Body("languageLevel") languageLevel: string | undefined,
		@Req() request: AuthenticatedRequest,
		@Res() res: Response,
	) {
		try {
			if (typeof title !== "string" || !title.trim()) {
				return res.status(400).send("Video name is required");
			}

			if (!file) {
				return res.status(400).send("Video file is required");
			}

			if (typeof sourceLanguage !== "string" || !sourceLanguage.trim()) {
				return res.status(400).send("Source language is required");
			}

			if (
				typeof explanationLanguage !== "string" ||
				!explanationLanguage.trim()
			) {
				return res.status(400).send("Explanation language is required");
			}

			const parsedLevel = parseLanguageLevel(languageLevel);
			if (!parsedLevel) {
				return res
					.status(400)
					.send("Language level is required (A1, A2, B1, B2, C1, or C2)");
			}

			const originalName = file.originalname || "upload.mp4";
			if (
				!file.mimetype.startsWith("video/") &&
				!originalName.toLowerCase().endsWith(".mp4")
			) {
				return res.status(400).send("Only video files are allowed");
			}

			const user = getAuthenticatedUser(request);
			const record = await this.videosService.createVideo({
				userId: user.id,
				title,
				originalFileName: originalName,
				mimeType: file.mimetype || "application/octet-stream",
				sizeBytes: file.size,
				fileBuffer: file.buffer,
				sourceLanguage: sourceLanguage.trim(),
				explanationLanguage: explanationLanguage.trim(),
				languageLevel: parsedLevel,
			});

			return res.status(200).json({
				id: record.id,
				title: record.title,
				status: record.status,
				sizeBytes: record.sizeBytes,
				sourceLanguage: record.sourceLanguage,
				explanationLanguage: record.explanationLanguage,
				languageLevel: record.languageLevel,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Upload failed";
			return res.status(500).send(message);
		}
	}
}

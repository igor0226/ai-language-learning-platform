import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";

import {
	BlobStorageService,
	ProcessingHistoryService,
	resolveResumeStep,
	VideoRepositoryService,
	type CreateVideoInput,
	type VideoRecord,
} from "../storage";
import type {
	PlaybackPhrasesFile,
	PlaybackPhrasesForApi,
	VideoListItem,
	VideoRetryForApi,
	VideoStatusForApi,
} from "./type/video-api";

@Injectable()
export class VideosService {
	constructor(
		private readonly videoRepository: VideoRepositoryService,
		private readonly processingHistory: ProcessingHistoryService,
		private readonly blobStorage: BlobStorageService,
	) {}

	async listVideosForApi(userId: string): Promise<VideoListItem[]> {
		const videos = await this.videoRepository.listVideosByUserId(userId);
		const histories = await Promise.all(
			videos.map((video) => this.processingHistory.getHistory(video.id)),
		);

		return videos.map((video, index) => ({
			id: video.id,
			title: video.title,
			status: video.status,
			sizeBytes: video.sizeBytes,
			chunkCount: video.segmentCount,
			playable: video.status === "ready",
			createdAt: video.createdAt,
			updatedAt: video.updatedAt,
			failureReason: video.failureReason,
			processingStep: histories[index].currentStep,
			sourceLanguage: video.sourceLanguage,
			explanationLanguage: video.explanationLanguage,
			languageLevel: video.languageLevel,
		}));
	}

	async getPlaybackPhrasesForApi(input: {
		videoId: string;
		userId: string;
	}): Promise<PlaybackPhrasesForApi> {
		const { videoId } = input;
		await this.getOwnedVideoRecord(input);

		const playbackPhrasesRelativePath =
			this.blobStorage.getPlaybackPhrasesRelativePath(videoId);
		if (!(await this.blobStorage.fileExists(playbackPhrasesRelativePath))) {
			return { videoId, phrases: [] };
		}

		const playbackPhrasesFile = JSON.parse(
			await this.blobStorage.readText(playbackPhrasesRelativePath),
		) as PlaybackPhrasesFile;

		return {
			videoId,
			phrases: playbackPhrasesFile.phrases,
		};
	}

	async getVideoStatusForApi(input: {
		videoId: string;
		userId: string;
	}): Promise<VideoStatusForApi> {
		const { videoId } = input;
		const video = await this.getOwnedVideoRecord(input);
		const history = await this.processingHistory.getHistory(videoId);

		return {
			id: video.id,
			status: video.status,
			failureReason: video.failureReason,
			playable: video.status === "ready",
			chunkCount: video.segmentCount,
			processingStep: history.currentStep,
			processingHistory: history.events,
			sourceLanguage: video.sourceLanguage,
			explanationLanguage: video.explanationLanguage,
			languageLevel: video.languageLevel,
		};
	}

	async getVideoRecordById(videoId: string): Promise<VideoRecord> {
		const video = await this.videoRepository.getVideoById(videoId);
		if (!video) {
			throw new NotFoundException("Video not found");
		}
		return video;
	}

	async getOwnedVideoRecord(input: {
		videoId: string;
		userId: string;
	}): Promise<VideoRecord> {
		const video = await this.getVideoRecordById(input.videoId);
		if (video.userId !== input.userId) {
			throw new NotFoundException("Video not found");
		}
		return video;
	}

	async createVideo(input: CreateVideoInput): Promise<VideoRecord> {
		return this.videoRepository.createVideo(input);
	}

	async retryFailedVideo(input: {
		videoId: string;
		userId: string;
	}): Promise<VideoRetryForApi> {
		const { videoId } = input;
		const video = await this.getOwnedVideoRecord(input);
		if (video.status !== "failed") {
			throw new ConflictException("Only failed videos can be retried");
		}

		const history = await this.processingHistory.getHistory(videoId);
		const resumeFromStep = resolveResumeStep(history);

		await this.blobStorage.clearProcessingArtifactsFromStep(
			videoId,
			resumeFromStep,
		);
		await this.processingHistory.recordRetry(videoId, resumeFromStep);
		await this.videoRepository.updateVideo(videoId, {
			status: "pending",
			failureReason: null,
		});

		return {
			id: videoId,
			status: "pending",
			resumeFromStep,
			failureReason: null,
		};
	}
}

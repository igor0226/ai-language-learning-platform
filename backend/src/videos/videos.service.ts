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
import { getQueuePosition } from "./utils/queue-position";

@Injectable()
export class VideosService {
	constructor(
		private readonly videoRepository: VideoRepositoryService,
		private readonly processingHistory: ProcessingHistoryService,
		private readonly blobStorage: BlobStorageService,
	) {}

	async listVideosForApi(): Promise<VideoListItem[]> {
		const videos = await this.videoRepository.listVideos();
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
			queuePosition: getQueuePosition(video, videos),
			sourceLanguage: video.sourceLanguage,
			explanationLanguage: video.explanationLanguage,
			languageLevel: video.languageLevel,
		}));
	}

	async getPlaybackPhrasesForApi(
		videoId: string,
	): Promise<PlaybackPhrasesForApi> {
		await this.getVideoRecordById(videoId);

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

	async getVideoStatusForApi(videoId: string): Promise<VideoStatusForApi> {
		const video = await this.getVideoRecordById(videoId);
		const allVideos = await this.videoRepository.listVideos();
		const history = await this.processingHistory.getHistory(videoId);

		return {
			id: video.id,
			status: video.status,
			failureReason: video.failureReason,
			playable: video.status === "ready",
			chunkCount: video.segmentCount,
			processingStep: history.currentStep,
			queuePosition: getQueuePosition(video, allVideos),
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

	async createVideo(input: CreateVideoInput): Promise<VideoRecord> {
		return this.videoRepository.createVideo(input);
	}

	async retryFailedVideo(videoId: string): Promise<VideoRetryForApi> {
		const video = await this.getVideoRecordById(videoId);
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

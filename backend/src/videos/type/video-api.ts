import type { PlaybackPhrase } from "@/processing/composing-video/type/compose-plan";
import type {
	ProcessingHistoryEvent,
	ProcessingStep,
	VideoRecord,
} from "@/storage/type";

export type VideoListItem = {
	id: string;
	title: string;
	status: "pending" | "processing" | "ready" | "failed";
	sizeBytes: number;
	chunkCount: number;
	playable: boolean;
	createdAt: string;
	updatedAt: string;
	failureReason: string | null;
	processingStep: ProcessingStep;
	sourceLanguage: string;
	explanationLanguage: string;
	languageLevel: VideoRecord["languageLevel"];
};

export type VideoStatusForApi = {
	id: string;
	status: "pending" | "processing" | "ready" | "failed";
	failureReason: string | null;
	playable: boolean;
	chunkCount: number;
	processingStep: ProcessingStep;
	processingHistory: ProcessingHistoryEvent[];
	sourceLanguage: string;
	explanationLanguage: string;
	languageLevel: VideoRecord["languageLevel"];
};

export type VideoRetryForApi = {
	id: string;
	status: "pending";
	resumeFromStep: ProcessingStep;
	failureReason: null;
};

export type PlaybackPhrasesForApi = {
	videoId: string;
	phrases: PlaybackPhrase[];
};

export type PlaybackPhrasesFile = {
	phrases: PlaybackPhrase[];
};

import type { VideoRecord } from "@/storage/type";

export type ExplanationClipManifestEntry = {
	index: number;
	phrase: string;
	insertAtSeconds: number;
	sentenceStartSeconds: number;
	durationSeconds: number;
	relativePath: string;
};

export type ExplanationClipsManifest = {
	clips: ExplanationClipManifestEntry[];
};

export type GenerateClipsInput = {
	video: VideoRecord;
	phrasesRelativePath: string;
	transcriptRelativePath: string;
};

export type GenerateClipsResult = {
	clipsManifestRelativePath: string;
};

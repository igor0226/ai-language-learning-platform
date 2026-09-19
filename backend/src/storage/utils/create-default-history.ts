import type { VideoProcessingHistory } from "../type";

export function createDefaultHistory(videoId: string): VideoProcessingHistory {
	return {
		videoId,
		currentStep: "queued",
		events: [],
		updatedAt: new Date().toISOString(),
	};
}

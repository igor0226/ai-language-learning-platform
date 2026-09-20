import type { VideoStatusResponse, VideosResponse } from "../type";

import { authFetch } from "@/shared/api/auth-fetch";

export async function fetchVideos(): Promise<VideosResponse> {
	const response = await authFetch("/api/videos");
	if (!response.ok) {
		throw new Error("Failed to load videos");
	}
	return response.json() as Promise<VideosResponse>;
}

export async function fetchVideoStatus(
	videoId: string,
): Promise<VideoStatusResponse> {
	const response = await authFetch(`/api/videos/${videoId}/status`);
	if (!response.ok) {
		throw new Error("Failed to load video status");
	}
	return response.json() as Promise<VideoStatusResponse>;
}

export function isTerminalVideoStatus(status: string | undefined): boolean {
	return status === "ready" || status === "failed";
}

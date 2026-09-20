import path from "node:path";
import type { Readable } from "node:stream";

import { Injectable, NotFoundException } from "@nestjs/common";

import { VideosService } from "../videos/videos.service";
import { BlobStorageService } from "../storage";
import { normalizeObjectKey } from "../storage/utils/normalize-object-key";

export type DashManifest = {
	fileName: string;
	content: string;
	contentType: string;
};

export type DashAssetStream = {
	stream: Readable;
	contentType: string;
};

@Injectable()
export class DashService {
	constructor(
		private readonly videosService: VideosService,
		private readonly blobStorage: BlobStorageService,
	) {}

	private getContentTypeByExtension(filePath: string): string {
		const ext = path.extname(filePath).toLowerCase();
		if (ext === ".mpd") {
			return "application/dash+xml; charset=utf-8";
		}
		if (ext === ".m4s") {
			return "video/iso.segment";
		}
		if (ext === ".mp4") {
			return "video/mp4";
		}
		return "application/octet-stream";
	}

	private rewriteManifestWithSegmentUrls(
		mpdText: string,
		videoId: string,
	): string {
		const baseUrl = `/api/dash/${videoId}/segment/`;
		return mpdText.replace(
			/(<SegmentTemplate\b)/g,
			`<BaseURL>${baseUrl}</BaseURL>$1`,
		);
	}

	private resolveDashAssetKey(input: {
		dashRelativePath: string;
		assetPathParts: string[];
	}): string {
		const normalizedParts = input.assetPathParts
			.map((part) => decodeURIComponent(part))
			.filter(Boolean);
		if (normalizedParts.some((part) => part === ".." || part === ".")) {
			throw new Error("Invalid DASH asset path");
		}

		const rootPrefix = normalizeObjectKey(input.dashRelativePath);
		const joinedKey = normalizeObjectKey(
			path.posix.join(rootPrefix, ...normalizedParts),
		);
		const rootWithSlash = `${rootPrefix}/`;
		if (joinedKey !== rootPrefix && !joinedKey.startsWith(rootWithSlash)) {
			throw new Error("Invalid DASH asset path");
		}
		return joinedKey;
	}

	async readDashManifest(input: {
		videoId: string;
		userId: string;
	}): Promise<DashManifest> {
		const { videoId } = input;
		const video = await this.videosService.getOwnedVideoRecord(input);

		if (video.status !== "ready") {
			throw new NotFoundException("Video is not ready for playback");
		}

		const manifestRelativePath =
			this.blobStorage.getDashManifestRelativePath(video);
		const rawContent = await this.blobStorage.readText(manifestRelativePath);

		return {
			fileName: video.manifestFileName,
			content: this.rewriteManifestWithSegmentUrls(rawContent, videoId),
			contentType: this.getContentTypeByExtension(manifestRelativePath),
		};
	}

	async getDashAssetStream(input: {
		videoId: string;
		userId: string;
		assetPathParts: string[];
	}): Promise<DashAssetStream> {
		if (input.assetPathParts.length === 0) {
			throw new NotFoundException("Missing DASH asset path");
		}

		const video = await this.videosService.getOwnedVideoRecord(input);

		const assetKey = this.resolveDashAssetKey({
			dashRelativePath: video.dashRelativePath,
			assetPathParts: input.assetPathParts,
		});
		if (!(await this.blobStorage.fileExists(assetKey))) {
			throw new NotFoundException("DASH asset not found");
		}

		return {
			stream: await this.blobStorage.getObjectStream(assetKey),
			contentType: this.getContentTypeByExtension(assetKey),
		};
	}
}

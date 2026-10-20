import { CreateBucketCommand, type S3Client } from "@aws-sdk/client-s3";
import { describe, expect, it, vi } from "vitest";

import { BlobStorageService } from "./blob-storage.service";

describe("BlobStorageService startup", () => {
	it.each([
		{ endpoint: undefined, status: 403, creates: false },
		{ endpoint: undefined, status: 404, creates: false },
		{ endpoint: "http://minio:9000", status: 403, creates: false },
		{ endpoint: "http://minio:9000", status: 404, creates: true },
	])("handles $status at $endpoint", async ({ endpoint, status, creates }) => {
		const error = { $metadata: { httpStatusCode: status } };
		const send = vi.fn().mockRejectedValueOnce(error).mockResolvedValue({});
		const service = new BlobStorageService({ send } as unknown as S3Client, {
			bucket: "test-bucket",
			region: "eu-north-1",
			endpoint,
			forcePathStyle: Boolean(endpoint),
		});

		if (creates) {
			await service.ensureLayout();
			expect(send).toHaveBeenCalledTimes(2);
			expect(send.mock.calls[1][0]).toBeInstanceOf(CreateBucketCommand);
		} else {
			await expect(service.ensureLayout()).rejects.toBe(error);
			expect(send).toHaveBeenCalledTimes(1);
		}
	});
});

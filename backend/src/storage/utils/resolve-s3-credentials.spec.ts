import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolveS3Credentials } from "./resolve-s3-credentials";

describe("resolveS3Credentials", () => {
	beforeEach(() => {
		vi.stubEnv("S3_ACCESS_KEY_ID", "");
		vi.stubEnv("S3_SECRET_ACCESS_KEY", "");
		vi.stubEnv("S3_SESSION_TOKEN", "");
	});

	afterEach(() => vi.unstubAllEnvs());

	it("leaves AWS credentials to the SDK default chain", () => {
		expect(resolveS3Credentials(undefined)).toBeUndefined();
	});

	it("preserves MinIO defaults for an explicit local endpoint", () => {
		expect(resolveS3Credentials("http://minio:9000")).toEqual({
			accessKeyId: "minioadmin",
			secretAccessKey: "minioadmin",
		});
	});

	it("accepts an explicit credential pair and optional session token", () => {
		vi.stubEnv("S3_ACCESS_KEY_ID", "test-access");
		vi.stubEnv("S3_SECRET_ACCESS_KEY", "test-secret");
		vi.stubEnv("S3_SESSION_TOKEN", "test-session");
		expect(resolveS3Credentials(undefined)).toEqual({
			accessKeyId: "test-access",
			secretAccessKey: "test-secret",
			sessionToken: "test-session",
		});
	});

	it.each(["S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_SESSION_TOKEN"])(
		"rejects an incomplete credential configuration with only %s",
		(key) => {
			vi.stubEnv(key, "test-value");
			expect(() => resolveS3Credentials(undefined)).toThrow(
				"Set both S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY",
			);
		},
	);
});

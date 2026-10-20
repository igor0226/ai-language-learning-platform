import type { S3Config } from "../type/s3-config";

export function resolveS3Credentials(
	endpoint: string | undefined,
): S3Config["credentials"] {
	const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
	const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
	const sessionToken = process.env.S3_SESSION_TOKEN?.trim() || undefined;

	if (accessKeyId || secretAccessKey || sessionToken) {
		if (!accessKeyId || !secretAccessKey) {
			throw new Error("Set both S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY");
		}
		return { accessKeyId, secretAccessKey, sessionToken };
	}

	return endpoint
		? { accessKeyId: "minioadmin", secretAccessKey: "minioadmin" }
		: undefined;
}

import type { S3Config } from "../type/s3-config";

function parseBoolean(
	value: string | undefined,
	defaultValue: boolean,
): boolean {
	if (value === undefined || value.trim() === "") {
		return defaultValue;
	}
	return value.toLowerCase() === "true";
}

export function resolveS3Config(): S3Config {
	const endpoint = process.env.S3_ENDPOINT?.trim() || undefined;
	return {
		endpoint,
		region: process.env.S3_REGION?.trim() || "us-east-1",
		bucket: process.env.S3_BUCKET?.trim() || "language-learning-platform",
		accessKeyId: process.env.S3_ACCESS_KEY_ID?.trim() || "minioadmin",
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY?.trim() || "minioadmin",
		forcePathStyle: parseBoolean(
			process.env.S3_FORCE_PATH_STYLE,
			Boolean(endpoint),
		),
	};
}

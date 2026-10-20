import type { S3Config } from "../type/s3-config";
import { resolveS3Credentials } from "./resolve-s3-credentials";

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
		credentials: resolveS3Credentials(endpoint),
		forcePathStyle: parseBoolean(
			process.env.S3_FORCE_PATH_STYLE,
			Boolean(endpoint),
		),
	};
}

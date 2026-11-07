import { Signer } from "@aws-sdk/rds-signer";

export function getPostgresPassword(input: {
	host: string;
	port: number;
	username: string;
	ssl: boolean;
}): string | (() => Promise<string>) {
	const mode = process.env.POSTGRES_AUTH_MODE ?? "password";
	if (mode !== "iam" && mode !== "password")
		throw new Error("POSTGRES_AUTH_MODE must be iam or password");
	if (mode !== "iam") {
		return process.env.POSTGRES_PASSWORD ?? "postgres";
	}
	if (!input.ssl) throw new Error("IAM database authentication requires TLS");
	const region = process.env.AWS_REGION?.trim();
	if (!region)
		throw new Error("AWS_REGION is required for IAM database authentication");
	const signer = new Signer({
		hostname: input.host,
		port: input.port,
		username: input.username,
		region,
	});
	// pg invokes this for each new connection, never reusing an expired token.
	return () => signer.getAuthToken();
}

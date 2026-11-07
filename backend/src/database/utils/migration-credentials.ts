import {
	GetSecretValueCommand,
	SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

export async function loadMigrationCredentials(): Promise<void> {
	const arn = process.env.DB_MASTER_SECRET_ARN;
	if (!arn) return;
	const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
	try {
		const result = await client.send(
			new GetSecretValueCommand({
				SecretId: arn,
				VersionStage: "AWSCURRENT",
			}),
		);
		const secret = JSON.parse(result.SecretString ?? "{}");
		if (
			typeof secret.username !== "string" ||
			!secret.username ||
			typeof secret.password !== "string" ||
			!secret.password
		) {
			throw new Error("Invalid migration credentials");
		}
		process.env.POSTGRES_AUTH_MODE = "password";
		process.env.POSTGRES_USER = secret.username;
		process.env.POSTGRES_PASSWORD = secret.password;
	} finally {
		client.destroy();
	}
}

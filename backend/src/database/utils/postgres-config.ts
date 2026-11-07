import type { PostgresConfig } from "../type/postgres-config";
import { getPostgresPassword } from "./postgres-password";
import { getPostgresSsl } from "./postgres-ssl";

export function getPostgresConfig(): PostgresConfig {
	const host = process.env.POSTGRES_HOST ?? "localhost";
	const port = Number(process.env.POSTGRES_PORT ?? 5432);
	const username = process.env.POSTGRES_USER ?? "postgres";
	const ssl = getPostgresSsl();
	return {
		host,
		port,
		username,
		password: getPostgresPassword({ host, port, username, ssl: ssl !== false }),
		database: process.env.POSTGRES_DB ?? "video_streaming",
		ssl,
	};
}

import { readFileSync } from "node:fs";

import type { PostgresConfig } from "../type/postgres-config";

export function getPostgresSsl(): PostgresConfig["ssl"] {
	const enabled = process.env.POSTGRES_SSL?.trim().toLowerCase();
	if (!enabled || enabled === "false") {
		return false;
	}
	if (enabled !== "true") {
		throw new Error("POSTGRES_SSL must be true or false");
	}
	const caPath = process.env.POSTGRES_SSL_CA_PATH?.trim();
	if (!caPath) {
		throw new Error("POSTGRES_SSL_CA_PATH is required when POSTGRES_SSL=true");
	}
	return { ca: readFileSync(caPath, "utf8"), rejectUnauthorized: true };
}

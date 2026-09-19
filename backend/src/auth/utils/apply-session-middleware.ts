import connectPgSimple from "connect-pg-simple";
import type { INestApplication } from "@nestjs/common";
import session from "express-session";

import { getPostgresConfig } from "@/database/utils/postgres-config";
import { resolveAuthConfig } from "./resolve-auth-config";

export function applySessionMiddleware(app: INestApplication): void {
	const config = resolveAuthConfig();
	const pg = getPostgresConfig();
	const PgSession = connectPgSimple(session);

	app.use(
		session({
			store: new PgSession({
				conObject: {
					host: pg.host,
					port: pg.port,
					user: pg.username,
					password: pg.password,
					database: pg.database,
				},
				tableName: "session",
				createTableIfMissing: false,
			}),
			name: config.sessionCookieName,
			secret: config.sessionSecret,
			resave: false,
			saveUninitialized: false,
			cookie: {
				httpOnly: true,
				sameSite: "lax",
				secure: config.secureCookies,
				maxAge: config.sessionMaxAgeMs,
			},
		}),
	);
}

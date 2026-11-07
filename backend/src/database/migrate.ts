import { loadMigrationCredentials } from "./utils/migration-credentials";
import { provisionRuntimeUser } from "./utils/provision-runtime-user";

async function migrate(): Promise<void> {
	let stage = "fetch administrator credentials";
	try {
		await loadMigrationCredentials();
		stage = "configure database connection";
		const { createAppDataSource } = await import("./data-source.js");
		const database = createAppDataSource();
		stage = "connect to database";
		await database.initialize();
		try {
			const connection = database.createQueryRunner();
			try {
				stage = "acquire migration lock";
				await connection.connect();
				await connection.query("SELECT pg_advisory_lock(712903, 2)");
				stage = "apply schema migrations";
				await database.runMigrations();
				stage = "provision runtime database user";
				await provisionRuntimeUser(database);
				stage = "release migration lock";
				await connection.query("SELECT pg_advisory_unlock(712903, 2)");
			} catch (error) {
				reportFailure(stage, error);
			} finally {
				stage = "release database connection";
				await connection.release();
			}
		} finally {
			await database.destroy().catch((error: unknown) => {
				reportFailure("close database pool", error);
			});
		}
	} catch (error) {
		reportFailure(stage, error);
	}
}

function reportFailure(stage: string, error: unknown): void {
	const failure = error as { name?: unknown; code?: unknown } | null;
	const name = safeIdentifier(failure?.name) ?? "Error";
	const code = safeIdentifier(failure?.code);
	// Error messages and driver objects can contain SQL or sensitive values.
	process.stderr.write(
		`Database migration failed at "${stage}": ${name}${code ? ` [${code}]` : ""}\n`,
	);
	process.exitCode = 1;
}

function safeIdentifier(value: unknown): string | undefined {
	return typeof value === "string" && /^[a-zA-Z0-9_]{1,64}$/.test(value)
		? value
		: undefined;
}

void migrate();

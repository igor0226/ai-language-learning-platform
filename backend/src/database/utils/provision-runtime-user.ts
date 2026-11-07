import type { DataSource } from "typeorm";

// Run only by the migration job using the administrator connection.
export async function provisionRuntimeUser(
	database: DataSource,
): Promise<void> {
	if (process.env.PROVISION_RDS_IAM_USER !== "true") return;
	await database.transaction(async (manager) => {
		await manager.query("SELECT pg_advisory_xact_lock(712903, 1)");
		await manager.query(`DO $$ BEGIN
			IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'llp_app') THEN
				CREATE ROLE llp_app LOGIN;
			END IF;
		END $$`);
		await manager.query("GRANT rds_iam TO llp_app");
		await manager.query("ALTER ROLE llp_app PASSWORD NULL");
		await manager.query(
			"GRANT CONNECT ON DATABASE " +
				quoteIdentifier(database.options.database as string) +
				" TO llp_app",
		);
		await manager.query("GRANT USAGE ON SCHEMA public TO llp_app");
		await manager.query(
			"GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO llp_app",
		);
		await manager.query("REVOKE ALL ON TABLE public.migrations FROM llp_app");
		await manager.query(
			"GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO llp_app",
		);
		await manager.query(
			"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO llp_app",
		);
		await manager.query(
			"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO llp_app",
		);
	});
}

function quoteIdentifier(value: string): string {
	return `"${value.replaceAll('"', '""')}"`;
}

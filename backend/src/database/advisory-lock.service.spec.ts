import {
	PostgreSqlContainer,
	type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { provisionRuntimeUser } from "./utils/provision-runtime-user";
import { AdvisoryLockService } from "./advisory-lock.service";

describe("distributed advisory locks", () => {
	let container: StartedPostgreSqlContainer;
	let first: DataSource;
	let second: DataSource;
	beforeAll(async () => {
		container = await new PostgreSqlContainer("postgres:17").start();
		const config = {
			type: "postgres" as const,
			url: container.getConnectionUri(),
		};
		first = await new DataSource(config).initialize();
		second = await new DataSource(config).initialize();
	});
	afterAll(async () => {
		if (first?.isInitialized) await first.destroy();
		if (second?.isInitialized) await second.destroy();
		await container?.stop();
	});
	it("excludes a second replica until the first finishes", async () => {
		const a = new AdvisoryLockService(first);
		const b = new AdvisoryLockService(second);
		await a.runExclusive("job", async () => {
			let ran = false;
			expect(
				await b.runExclusive("job", async () => {
					ran = true;
				}),
			).toBe(false);
			expect(ran).toBe(false);
		});
		expect(await b.runExclusive("job", async () => {})).toBe(true);
	});
	it("releases the lock when a job fails", async () => {
		const a = new AdvisoryLockService(first);
		await expect(
			a.runExclusive("failed", async () => {
				throw new Error("job failed");
			}),
		).rejects.toThrow("job failed");
		expect(
			await new AdvisoryLockService(second).runExclusive(
				"failed",
				async () => {},
			),
		).toBe(true);
	});
	it("releases locks when the owning database session is terminated", async () => {
		const runner = first.createQueryRunner();
		await runner.connect();
		const [owner] = await runner.query(
			"SELECT pg_backend_pid() AS pid, pg_advisory_lock(hashtextextended('crashed', 0))",
		);
		await second.query("SELECT pg_terminate_backend($1)", [owner.pid]);
		await expect
			.poll(async () =>
				new AdvisoryLockService(second).runExclusive("crashed", async () => {}),
			)
			.toBe(true);
		await runner.release();
	});
	it("provisions a data-only IAM user without a PostgreSQL superuser", async () => {
		await first.query("CREATE ROLE rds_iam");
		await first.query(
			"CREATE ROLE migration_owner LOGIN CREATEROLE PASSWORD 'local-test-only'",
		);
		await first.query("GRANT rds_iam TO migration_owner WITH ADMIN OPTION");
		await first.query(
			`ALTER DATABASE "${container.getDatabase()}" OWNER TO migration_owner`,
		);
		const owner = await new DataSource({
			type: "postgres",
			host: container.getHost(),
			port: container.getPort(),
			username: "migration_owner",
			password: "local-test-only",
			database: container.getDatabase(),
		}).initialize();
		try {
			await owner.query("CREATE TABLE migrations (id integer)");
			await owner.query(
				"CREATE TABLE records (id serial PRIMARY KEY, value text)",
			);
			vi.stubEnv("PROVISION_RDS_IAM_USER", "true");
			await provisionRuntimeUser(owner);
			await provisionRuntimeUser(owner);
			const [privileges] = await first.query(`SELECT
 has_table_privilege('llp_app', 'records', 'INSERT') AS writes,
 has_table_privilege('llp_app', 'migrations', 'SELECT') AS migrations,
 has_schema_privilege('llp_app', 'public', 'CREATE') AS ddl`);
			expect(privileges).toEqual({
				writes: true,
				migrations: false,
				ddl: false,
			});
			await owner.query("CREATE TABLE future_records (id integer)");
			const [future] = await first.query(
				"SELECT has_table_privilege('llp_app', 'future_records', 'INSERT') AS allowed",
			);
			expect(future.allowed).toBe(true);
		} finally {
			vi.unstubAllEnvs();
			await owner.destroy();
		}
	});
});

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getPostgresSsl } from "./postgres-ssl";

describe("getPostgresSsl", () => {
	beforeEach(() => {
		vi.stubEnv("POSTGRES_SSL", "");
		vi.stubEnv("POSTGRES_SSL_CA_PATH", "");
	});

	afterEach(() => vi.unstubAllEnvs());

	it("keeps local TLS disabled by default", () => {
		expect(getPostgresSsl()).toBe(false);
	});

	it("accepts explicit false", () => {
		vi.stubEnv("POSTGRES_SSL", "false");
		expect(getPostgresSsl()).toBe(false);
	});

	it("rejects invalid settings instead of silently disabling TLS", () => {
		vi.stubEnv("POSTGRES_SSL", "yes");
		expect(getPostgresSsl).toThrow("POSTGRES_SSL must be true or false");
	});

	it("requires a CA bundle when TLS is enabled", () => {
		vi.stubEnv("POSTGRES_SSL", "true");
		expect(getPostgresSsl).toThrow("POSTGRES_SSL_CA_PATH is required");
	});

	it("loads the configured CA and enforces certificate verification", () => {
		const directory = mkdtempSync(join(tmpdir(), "llp-postgres-ssl-"));
		try {
			const caPath = join(directory, "ca.pem");
			writeFileSync(caPath, "test-ca-bundle");
			vi.stubEnv("POSTGRES_SSL", "true");
			vi.stubEnv("POSTGRES_SSL_CA_PATH", caPath);
			expect(getPostgresSsl()).toEqual({
				ca: "test-ca-bundle",
				rejectUnauthorized: true,
			});
		} finally {
			rmSync(directory, { recursive: true, force: true });
		}
	});
});

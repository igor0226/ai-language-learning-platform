import { afterEach, describe, expect, it, vi } from "vitest";
import { getPostgresPassword } from "./postgres-password";

const { token, signer } = vi.hoisted(() => ({
	token: vi.fn(),
	signer: vi.fn(),
}));
vi.mock("@aws-sdk/rds-signer", () => ({
	Signer: class {
		constructor(options: unknown) {
			signer(options);
		}
		getAuthToken() {
			return token();
		}
	},
}));
const INPUT = {
	host: "db.example.com",
	port: 5432,
	username: "llp_app",
	ssl: true,
};

afterEach(() => {
	vi.unstubAllEnvs();
	vi.clearAllMocks();
});

describe("database authentication", () => {
	it("generates a fresh token for every new pool connection", async () => {
		vi.stubEnv("POSTGRES_AUTH_MODE", "iam");
		vi.stubEnv("AWS_REGION", "eu-north-1");
		token.mockResolvedValueOnce("first").mockResolvedValueOnce("second");
		const password = getPostgresPassword(INPUT) as () => Promise<string>;
		expect(token).not.toHaveBeenCalled();
		expect(await password()).toBe("first");
		expect(await password()).toBe("second");
		expect(signer).toHaveBeenCalledWith({
			hostname: INPUT.host,
			port: 5432,
			username: "llp_app",
			region: "eu-north-1",
		});
	});
	it("rejects IAM without verified TLS", () => {
		vi.stubEnv("POSTGRES_AUTH_MODE", "iam");
		expect(() => getPostgresPassword({ ...INPUT, ssl: false })).toThrow(
			"requires TLS",
		);
	});
	it("preserves local password authentication", () => {
		vi.stubEnv("POSTGRES_AUTH_MODE", "password");
		vi.stubEnv("POSTGRES_PASSWORD", "local-password");
		expect(getPostgresPassword(INPUT)).toBe("local-password");
		expect(signer).not.toHaveBeenCalled();
	});
});

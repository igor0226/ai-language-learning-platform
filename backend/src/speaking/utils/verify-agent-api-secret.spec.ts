import { describe, expect, it } from "vitest";

import {
	resolveAgentApiSecret,
	verifyAgentApiBearer,
} from "./verify-agent-api-secret";

describe("verifyAgentApiBearer", () => {
	it("accepts a matching bearer token", () => {
		process.env.SPEAKING_INTERNAL_API_SECRET = "test-secret";
		expect(verifyAgentApiBearer("Bearer test-secret")).toBe(true);
	});

	it("rejects missing or wrong authorization", () => {
		process.env.SPEAKING_INTERNAL_API_SECRET = "test-secret";
		expect(verifyAgentApiBearer(undefined)).toBe(false);
		expect(verifyAgentApiBearer("Bearer wrong")).toBe(false);
		expect(verifyAgentApiBearer("Basic test-secret")).toBe(false);
	});

	it("fails closed when secret is empty", () => {
		process.env.SPEAKING_INTERNAL_API_SECRET = "";
		expect(resolveAgentApiSecret()).toBe("");
		expect(verifyAgentApiBearer("Bearer anything")).toBe(false);
	});
});

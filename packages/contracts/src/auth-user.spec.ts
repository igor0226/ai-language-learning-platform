import { describe, expect, it } from "vitest";

import { authUserSchema } from "./auth-user";

describe("authUserSchema", () => {
	it("accepts a valid auth user", () => {
		const result = authUserSchema.safeParse({
			id: "550e8400-e29b-41d4-a716-446655440000",
			email: "learner@example.com",
			name: "Learner",
			pictureUrl: "https://example.com/avatar.png",
		});
		expect(result.success).toBe(true);
	});

	it("accepts null pictureUrl", () => {
		const result = authUserSchema.safeParse({
			id: "550e8400-e29b-41d4-a716-446655440000",
			email: "learner@example.com",
			name: "Learner",
			pictureUrl: null,
		});
		expect(result.success).toBe(true);
	});
});

import { describe, expect, it } from "vitest";

import { toGoogleUserInput } from "./google-profile";

describe("toGoogleUserInput", () => {
	it("maps a Google profile into upsert input", () => {
		const input = toGoogleUserInput({
			id: "google-sub-1",
			displayName: "Learner",
			emails: [{ value: "learner@example.com", verified: true }],
			photos: [{ value: "https://example.com/avatar.png" }],
		} as never);

		expect(input).toEqual({
			googleSub: "google-sub-1",
			email: "learner@example.com",
			name: "Learner",
			pictureUrl: "https://example.com/avatar.png",
		});
	});

	it("throws when email is missing", () => {
		expect(() =>
			toGoogleUserInput({
				id: "google-sub-1",
				displayName: "Learner",
				emails: [],
			} as never),
		).toThrow("Google profile is missing an email address");
	});
});

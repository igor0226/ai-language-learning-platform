import { UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { AuthenticatedRequest } from "../type/express-request";
import { loginAndSaveSession } from "./login-and-save-session";

describe("loginAndSaveSession", () => {
	it("rejects when the request has no user", async () => {
		await expect(
			loginAndSaveSession({} as AuthenticatedRequest),
		).rejects.toBeInstanceOf(UnauthorizedException);
	});

	it("logs the user in and saves the session", async () => {
		const user = { id: "user-1" };
		const request = {
			user,
			login: vi.fn((_user, done: (error?: Error) => void) => done()),
			session: {
				save: vi.fn((done: (error?: Error) => void) => done()),
			},
		} as unknown as AuthenticatedRequest;

		await loginAndSaveSession(request);

		expect(request.login).toHaveBeenCalledWith(user, expect.any(Function));
		expect(request.session?.save).toHaveBeenCalled();
	});
});

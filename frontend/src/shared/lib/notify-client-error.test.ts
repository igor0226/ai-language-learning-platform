import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { notifyClientError } from "./notify-client-error";

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
	},
}));

describe("notifyClientError", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("shows a toast with the error message", () => {
		notifyClientError({
			error: new Error("Failed to load videos"),
			id: "videos",
		});

		expect(toast.error).toHaveBeenCalledWith("Failed to load videos", {
			id: "videos",
		});
	});

	it("uses a fallback message for non-Error values", () => {
		notifyClientError({ error: "unexpected" });

		expect(toast.error).toHaveBeenCalledWith("Request failed", undefined);
	});

	it("skips auth-required errors", () => {
		const error = new Error("Authentication required");
		error.name = "AuthRequiredError";

		notifyClientError({ error });

		expect(toast.error).not.toHaveBeenCalled();
	});
});

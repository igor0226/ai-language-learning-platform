import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginPage } from "./LoginPage";

const useSearchParams = vi.fn();

vi.mock("next/navigation", () => ({
	useSearchParams: () => useSearchParams(),
}));

describe("LoginPage", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		useSearchParams.mockReset();
	});

	it("renders SSO chrome and a single Google sign-in link", () => {
		vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");
		useSearchParams.mockReturnValue(new URLSearchParams());

		render(<LoginPage />);

		expect(screen.getByText("LS")).toBeInTheDocument();
		expect(screen.getByText("Google Single Sign-On (SSO)")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /Continue with Google/i }),
		).toHaveAttribute("href", "http://localhost:3001/api/auth/google");
		expect(screen.getAllByRole("link")).toHaveLength(1);
		expect(screen.queryByText(/Alex/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/Ready/i)).not.toBeInTheDocument();
	});

	it("shows an oauth error alert when error=oauth is present", () => {
		useSearchParams.mockReturnValue(new URLSearchParams("error=oauth"));

		render(<LoginPage />);

		expect(screen.getByRole("alert")).toHaveTextContent("Sign-in failed");
		expect(screen.getByRole("alert")).toHaveTextContent(
			"Google sign-in did not complete. Please try again.",
		);
	});
});

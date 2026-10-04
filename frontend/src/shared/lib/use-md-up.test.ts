import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMdUp } from "./use-md-up";

function stubMatchMedia(matches: boolean) {
	vi.stubGlobal(
		"matchMedia",
		vi.fn().mockImplementation((query: string) => ({
			matches,
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		})),
	);
}

describe("useMdUp", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("is true at the md breakpoint", () => {
		stubMatchMedia(true);
		const { result } = renderHook(() => useMdUp());
		expect(result.current).toBe(true);
	});

	it("is false below the md breakpoint", () => {
		stubMatchMedia(false);
		const { result } = renderHook(() => useMdUp());
		expect(result.current).toBe(false);
	});
});

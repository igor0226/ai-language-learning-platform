import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TasksTable } from "./TasksTable";

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
}));

describe("TasksTable", () => {
	const baseProps = {
		videos: [],
		selectedIds: new Set<string>(),
		onSelectedIdsChange: vi.fn(),
		focusedId: null,
		onFocusedIdChange: vi.fn(),
	};

	it("shows loading placeholders while the first fetch is pending", () => {
		const { container } = render(<TasksTable {...baseProps} isLoading />);

		expect(container.querySelectorAll(".animate-pulse")).toHaveLength(5);
	});

	it("shows a load error placeholder when the first fetch fails", () => {
		render(<TasksTable {...baseProps} isError />);

		expect(screen.getByText("Couldn't load data.")).toBeInTheDocument();
	});
});

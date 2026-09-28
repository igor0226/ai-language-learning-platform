import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CallHistoryTable } from "./CallHistoryTable";

describe("CallHistoryTable", () => {
	it("shows loading placeholders while the first fetch is pending", () => {
		const { container } = render(<CallHistoryTable calls={[]} isLoading />);

		expect(container.querySelectorAll(".animate-pulse")).toHaveLength(5);
	});

	it("shows a load error placeholder when the first fetch fails", () => {
		render(<CallHistoryTable calls={[]} isError />);

		expect(screen.getByText("Couldn't load data.")).toBeInTheDocument();
	});
});

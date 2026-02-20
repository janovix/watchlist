import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LayoutContent } from "./layout-content";

// Mock the Header component
vi.mock("@/components/header", () => ({
	Header: () => <header data-testid="header">Header</header>,
}));

describe("LayoutContent", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders Header", () => {
		render(
			<LayoutContent>
				<div>Test content</div>
			</LayoutContent>,
		);

		expect(screen.getByTestId("header")).toBeInTheDocument();
	});

	it("renders children", () => {
		render(
			<LayoutContent>
				<div data-testid="child-content">Test content</div>
			</LayoutContent>,
		);

		expect(screen.getByTestId("child-content")).toBeInTheDocument();
	});

	it("renders Header and children in correct order", () => {
		render(
			<LayoutContent>
				<div data-testid="child-content">Test content</div>
			</LayoutContent>,
		);

		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("child-content")).toBeInTheDocument();
	});

	it("passes through multiple children", () => {
		render(
			<LayoutContent>
				<div data-testid="child-1">Child 1</div>
				<div data-testid="child-2">Child 2</div>
				<div data-testid="child-3">Child 3</div>
			</LayoutContent>,
		);

		expect(screen.getByTestId("child-1")).toBeInTheDocument();
		expect(screen.getByTestId("child-2")).toBeInTheDocument();
		expect(screen.getByTestId("child-3")).toBeInTheDocument();
	});
});

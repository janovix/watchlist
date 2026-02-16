import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LayoutContent } from "./layout-content";

// Mock the BackgroundWrapper component (contains Three.js)
vi.mock("@/components/background-wrapper", () => ({
	BackgroundWrapper: () => (
		<div data-testid="background-wrapper">Background</div>
	),
}));

// Mock the Header component
vi.mock("@/components/header", () => ({
	Header: () => <header data-testid="header">Header</header>,
}));

describe("LayoutContent", () => {
	afterEach(() => {
		cleanup();
	});
	it("renders BackgroundWrapper", () => {
		render(
			<LayoutContent>
				<div>Test content</div>
			</LayoutContent>,
		);

		expect(screen.getByTestId("background-wrapper")).toBeInTheDocument();
	});

	it("renders Header", () => {
		render(
			<LayoutContent>
				<div>Test content</div>
			</LayoutContent>,
		);

		expect(screen.getByTestId("header")).toBeInTheDocument();
	});

	it("renders children in z-10 container", () => {
		render(
			<LayoutContent>
				<div data-testid="child-content">Test content</div>
			</LayoutContent>,
		);

		const childContent = screen.getByTestId("child-content");
		expect(childContent).toBeInTheDocument();

		// Check that the parent div has the z-10 class
		const container = childContent.parentElement;
		expect(container).toHaveClass("relative", "z-10");
	});

	it("renders all components in correct order", () => {
		render(
			<LayoutContent>
				<div data-testid="child-content">Test content</div>
			</LayoutContent>,
		);

		// Verify all expected components are present
		expect(screen.getByTestId("background-wrapper")).toBeInTheDocument();
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

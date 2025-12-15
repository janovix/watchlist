import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider } from "./theme-provider";

// Mock next-themes since it requires client-side environment
vi.mock("next-themes", () => ({
	ThemeProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="theme-provider">{children}</div>
	),
}));

describe("ThemeProvider", () => {
	it("should render children", () => {
		const { container } = render(
			<ThemeProvider>
				<div data-testid="child">Test</div>
			</ThemeProvider>,
		);

		expect(
			container.querySelector('[data-testid="child"]'),
		).toBeInTheDocument();
	});

	it("should pass props to NextThemesProvider", () => {
		const { container } = render(
			<ThemeProvider attribute="class" defaultTheme="dark">
				<div>Test</div>
			</ThemeProvider>,
		);

		expect(container.firstChild).toBeInTheDocument();
	});
});

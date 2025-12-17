import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Logo } from "./logo";
import { ThemeProvider } from "./theme-provider";

// Mock next-themes
const mockUseTheme = vi.fn();

vi.mock("next-themes", () => ({
	useTheme: () => mockUseTheme(),
	ThemeProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="theme-provider">{children}</div>
	),
}));

describe("Logo", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseTheme.mockReturnValue({
			resolvedTheme: "light",
			systemTheme: "light",
			theme: "light",
			setTheme: vi.fn(),
			themes: ["light", "dark"],
		});
	});

	it("should render logo variant by default", () => {
		render(
			<ThemeProvider attribute="class" defaultTheme="light">
				<Logo />
			</ThemeProvider>,
		);
		const svg = document.querySelector("svg");
		expect(svg).toBeInTheDocument();
		expect(svg?.getAttribute("viewBox")).toBe("0 0 102 16");
	});

	it("should render logo variant when specified", () => {
		render(
			<ThemeProvider attribute="class" defaultTheme="light">
				<Logo variant="logo" />
			</ThemeProvider>,
		);
		const svg = document.querySelector("svg");
		expect(svg).toBeInTheDocument();
		expect(svg?.getAttribute("viewBox")).toBe("0 0 102 16");
	});

	it("should render icon variant when specified", () => {
		const { container } = render(
			<ThemeProvider attribute="class" defaultTheme="light">
				<Logo variant="icon" />
			</ThemeProvider>,
		);
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
		expect(svg?.getAttribute("viewBox")).toBe("0 0 200 200");
	});

	it("should use custom width and height", () => {
		const { container } = render(
			<ThemeProvider attribute="class" defaultTheme="light">
				<Logo variant="logo" width={150} height={24} />
			</ThemeProvider>,
		);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("width")).toBe("150");
		expect(svg?.getAttribute("height")).toBe("24");
	});

	it("should use forceTheme when provided", () => {
		render(
			<ThemeProvider attribute="class" defaultTheme="light">
				<Logo variant="logo" forceTheme="dark" />
			</ThemeProvider>,
		);
		const svg = document.querySelector("svg");
		expect(svg).toBeInTheDocument();
	});

	it("should apply className to wrapper", () => {
		const { container } = render(
			<ThemeProvider attribute="class" defaultTheme="light">
				<Logo className="test-class" />
			</ThemeProvider>,
		);
		// Logo wraps content in a div, which is inside ThemeProvider mock
		const wrapper = container.querySelector('[data-testid="theme-provider"]')
			?.firstChild as HTMLElement;
		expect(wrapper).toHaveClass("test-class");
	});

	it("should apply imgClassName to svg", () => {
		const { container } = render(
			<ThemeProvider attribute="class" defaultTheme="light">
				<Logo imgClassName="svg-class" />
			</ThemeProvider>,
		);
		const svg = container.querySelector("svg");
		expect(svg).toHaveClass("svg-class");
	});

	it("should handle dark theme", () => {
		mockUseTheme.mockReturnValue({
			resolvedTheme: "dark",
			systemTheme: "dark",
			theme: "dark",
			setTheme: vi.fn(),
			themes: ["light", "dark"],
		});

		render(
			<ThemeProvider attribute="class" defaultTheme="dark">
				<Logo variant="logo" />
			</ThemeProvider>,
		);
		const svg = document.querySelector("svg");
		expect(svg).toBeInTheDocument();
	});

	it("should handle system theme", () => {
		mockUseTheme.mockReturnValue({
			resolvedTheme: undefined,
			systemTheme: "light",
			theme: "system",
			setTheme: vi.fn(),
			themes: ["light", "dark", "system"],
		});

		render(
			<ThemeProvider attribute="class" defaultTheme="system">
				<Logo variant="logo" />
			</ThemeProvider>,
		);
		const svg = document.querySelector("svg");
		expect(svg).toBeInTheDocument();
	});

	it("should handle undefined resolvedTheme with systemTheme fallback", () => {
		mockUseTheme.mockReturnValue({
			resolvedTheme: undefined,
			systemTheme: "dark",
			theme: "system",
			setTheme: vi.fn(),
			themes: ["light", "dark", "system"],
		});

		const { container } = render(
			<ThemeProvider attribute="class" defaultTheme="system">
				<Logo variant="icon" />
			</ThemeProvider>,
		);
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
		expect(svg?.getAttribute("viewBox")).toBe("0 0 200 200");
	});
});

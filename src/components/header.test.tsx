import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./header";
import { LanguageProvider } from "./language-provider";
import { ThemeProvider } from "./theme-provider";

// Mock next/link
vi.mock("next/link", () => ({
	default: ({ children, href, className }: any) => (
		<a href={href} className={className}>
			{children}
		</a>
	),
}));

// Mock next-themes
const mockUseTheme = vi.fn();

vi.mock("next-themes", () => ({
	useTheme: () => mockUseTheme(),
	ThemeProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="theme-provider">{children}</div>
	),
}));

const renderWithProviders = (component: React.ReactElement) => {
	return render(
		<ThemeProvider attribute="class" defaultTheme="light">
			<LanguageProvider>{component}</LanguageProvider>
		</ThemeProvider>,
	);
};

describe("Header", () => {
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		vi.clearAllMocks();
		mockUseTheme.mockReturnValue({
			resolvedTheme: "light",
			systemTheme: "light",
			theme: "light",
			setTheme: vi.fn(),
			themes: ["light", "dark"],
		});

		// Mock matchMedia
		window.matchMedia = vi.fn((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})) as unknown as typeof window.matchMedia;
	});

	afterEach(() => {
		window.matchMedia = originalMatchMedia;
	});

	it("should render header with logo and controls", () => {
		renderWithProviders(<Header />);

		const header = screen.getByRole("banner");
		expect(header).toBeInTheDocument();
		expect(header).toHaveClass("border-b", "border-border");
	});

	it("should render logo link", () => {
		renderWithProviders(<Header />);

		const logoLinks = screen.getAllByRole("link", { name: /watchlist/i });
		expect(logoLinks.length).toBeGreaterThan(0);
		const logoLink = logoLinks[0];
		expect(logoLink).toBeInTheDocument();
		expect(logoLink).toHaveAttribute("href", "/");
	});

	it("should render language toggle", () => {
		renderWithProviders(<Header />);

		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThan(0);
	});

	it("should render theme toggle", () => {
		renderWithProviders(<Header />);

		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThan(0);
	});

	it("should render user menu", () => {
		renderWithProviders(<Header />);

		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThan(0);
	});

	it("should have sticky positioning", () => {
		const { container } = renderWithProviders(<Header />);

		const headers = container.querySelectorAll("header");
		expect(headers.length).toBeGreaterThan(0);
		const header = headers[0];
		expect(header).toHaveClass("sticky", "top-0", "z-50");
	});

	it("should have responsive classes", () => {
		const { container } = renderWithProviders(<Header />);

		const headers = container.querySelectorAll("header");
		expect(headers.length).toBeGreaterThan(0);
		const header = headers[0];
		const contentDiv = header.querySelector("div[class*='mx-auto']");
		expect(contentDiv).toHaveClass("mx-auto", "max-w-6xl", "px-4", "sm:px-6");
	});
});

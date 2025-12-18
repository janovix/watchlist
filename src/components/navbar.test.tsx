import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./navbar";
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

describe("Navbar", () => {
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

	it("should render navbar", () => {
		renderWithProviders(<Navbar />);

		const navbar = screen.getByRole("navigation");
		expect(navbar).toBeInTheDocument();
		expect(navbar).toHaveClass("border-b", "border-border");
	});

	it("should render logo link", () => {
		renderWithProviders(<Navbar />);

		const logoLinks = screen.getAllByRole("link", { name: /watchlist/i });
		expect(logoLinks.length).toBeGreaterThan(0);
		const logoLink = logoLinks[0];
		expect(logoLink).toBeInTheDocument();
		expect(logoLink).toHaveAttribute("href", "/");
	});

	it("should have sticky positioning", () => {
		const { container } = renderWithProviders(<Navbar />);

		const navbars = container.querySelectorAll("nav");
		expect(navbars.length).toBeGreaterThan(0);
		const navbar = navbars[0];
		expect(navbar).toHaveClass("sticky", "top-[81px]", "z-40");
	});

	it("should render with correct container classes", () => {
		const { container } = renderWithProviders(<Navbar />);

		const navbars = container.querySelectorAll("nav");
		expect(navbars.length).toBeGreaterThan(0);
		const navbar = navbars[0];
		const containerDiv = navbar.querySelector(".container");
		expect(containerDiv).toHaveClass("px-4", "py-2");
	});
});

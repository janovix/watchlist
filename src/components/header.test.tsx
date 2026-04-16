import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./header";
import { ThemeProvider } from "./theme-provider";

const mockSetLanguage = vi.fn();

vi.mock("@/components/language-provider", () => ({
	LanguageProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	useLanguage: () => ({
		language: "en" as const,
		setLanguage: mockSetLanguage,
		t: (key: string) => key,
	}),
}));

vi.mock("@algenium/blocks", () => ({
	LanguageSwitcher: ({
		onLanguageChange,
	}: {
		onLanguageChange: (key: string) => void;
	}) => (
		<div>
			<button
				type="button"
				data-testid="lang-fr"
				onClick={() => onLanguageChange("fr")}
			>
				lang-fr
			</button>
			<button
				type="button"
				data-testid="lang-en"
				onClick={() => onLanguageChange("en")}
			>
				lang-en
			</button>
		</div>
	),
	ThemeSwitcher: () => (
		<button type="button" data-testid="theme-switcher">
			theme
		</button>
	),
	EnvironmentSwitcher: () => (
		<button type="button" data-testid="environment-switcher">
			env
		</button>
	),
	EnvironmentBanner: () => null,
}));

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

const renderWithTheme = (component: React.ReactElement) => {
	return render(
		<ThemeProvider attribute="class" defaultTheme="light">
			{component}
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
		cleanup();
		window.matchMedia = originalMatchMedia;
	});

	it("should render header with logo and controls", () => {
		renderWithTheme(<Header />);

		const header = screen.getByRole("banner");
		expect(header).toBeInTheDocument();
		expect(header).toHaveClass("border-b", "border-border");
	});

	it("should render logo link", () => {
		renderWithTheme(<Header />);

		const logoLinks = screen.getAllByRole("link", { name: /watchlist/i });
		expect(logoLinks.length).toBeGreaterThan(0);
		const logoLink = logoLinks[0];
		expect(logoLink).toBeInTheDocument();
		expect(logoLink).toHaveAttribute("href", "/");
	});

	it("should render language and theme switchers from blocks", () => {
		renderWithTheme(<Header />);

		expect(screen.getByTestId("theme-switcher")).toBeInTheDocument();
		expect(screen.getByTestId("lang-en")).toBeInTheDocument();
		expect(screen.getByTestId("lang-fr")).toBeInTheDocument();
	});

	it("calls setLanguage only for supported watchlist language keys", async () => {
		const user = userEvent.setup();
		renderWithTheme(<Header />);

		await user.click(screen.getByTestId("lang-fr"));
		expect(mockSetLanguage).not.toHaveBeenCalled();

		await user.click(screen.getByTestId("lang-en"));
		expect(mockSetLanguage).toHaveBeenCalledWith("en");
	});

	it("should render user menu trigger", () => {
		renderWithTheme(<Header />);

		expect(
			screen.getByRole("button", { name: /user menu/i }),
		).toBeInTheDocument();
	});

	it("should have sticky positioning", () => {
		const { container } = renderWithTheme(<Header />);

		const headers = container.querySelectorAll("header");
		expect(headers.length).toBeGreaterThan(0);
		const header = headers[0];
		expect(header).toHaveClass("sticky", "top-0");
	});

	it("should have responsive classes", () => {
		const { container } = renderWithTheme(<Header />);

		const headers = container.querySelectorAll("header");
		expect(headers.length).toBeGreaterThan(0);
		const header = headers[0];
		const contentDiv = header.querySelector("div[class*='mx-auto']");
		expect(contentDiv).toHaveClass("mx-auto", "max-w-6xl", "px-4", "sm:px-6");
	});
});

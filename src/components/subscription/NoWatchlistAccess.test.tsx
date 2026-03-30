import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NoWatchlistAccess } from "./NoWatchlistAccess";

// Mock next/link
vi.mock("next/link", () => ({
	default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
	ShieldX: () => <div data-testid="shield-x-icon" />,
	ArrowRight: () => <div data-testid="arrow-right-icon" />,
	Loader2: () => <div data-testid="loader2-icon" />,
}));

// Mock useTranslation hook
vi.mock("@/lib/settings", () => ({
	useTranslation: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				loading: "Loading",
				"subscription.noWatchlistAccess.title": "No Watchlist Access",
				"subscription.noWatchlistAccess.description":
					"You don't have access to Watchlist",
				"subscription.noWatchlistAccess.upgradePrompt": "Please upgrade",
				"subscription.noWatchlistAccess.upgradeCta": "Upgrade Now",
				"subscription.noWatchlistAccess.backToSettings": "Back to Settings",
			};
			return translations[key] || key;
		},
	}),
}));

describe("NoWatchlistAccess", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("should render spinner when isLoading is true", () => {
		render(<NoWatchlistAccess isLoading={true} />);

		expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
		expect(screen.getByText("Loading")).toBeInTheDocument();
	});

	it("should render card with content when isLoading is false", () => {
		render(<NoWatchlistAccess isLoading={false} />);

		expect(screen.getByText("No Watchlist Access")).toBeInTheDocument();
		expect(
			screen.getByText("You don't have access to Watchlist"),
		).toBeInTheDocument();
		expect(screen.getByText("Please upgrade")).toBeInTheDocument();
		expect(screen.getByText("Upgrade Now")).toBeInTheDocument();
		expect(screen.getByText("Back to Settings")).toBeInTheDocument();
	});

	it("should render with isLoading false by default", () => {
		render(<NoWatchlistAccess />);

		// Use getAllByText to get the first one in case there are multiple
		const titles = screen.getAllByText("No Watchlist Access");
		expect(titles.length).toBeGreaterThan(0);
		expect(screen.queryByTestId("loader2-icon")).not.toBeInTheDocument();
	});

	it("should point plan and settings links at NEXT_PUBLIC_AUTH_APP_URL", () => {
		render(<NoWatchlistAccess />);

		const links = screen.getAllByRole("link");
		const billing = links.find(
			(a) =>
				a.getAttribute("href") ===
				"https://auth.example.workers.dev/settings/billing",
		);
		const settings = links.find(
			(a) =>
				a.getAttribute("href") === "https://auth.example.workers.dev/settings",
		);
		expect(billing).toBeDefined();
		expect(settings).toBeDefined();
	});
});

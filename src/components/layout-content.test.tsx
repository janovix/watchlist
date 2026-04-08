import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LayoutContent } from "./layout-content";
import { LanguageProvider } from "@/components/language-provider";
import type { SubscriptionContextValue } from "@/lib/subscription/useSubscription";
import type { SubscriptionStatus } from "@/lib/subscription/subscriptionClient";

const mockUseSubscriptionSafe = vi.fn();

vi.mock("@/lib/subscription", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/subscription")>();
	return {
		...actual,
		useSubscriptionSafe: () => mockUseSubscriptionSafe(),
	};
});

vi.mock("@/lib/settings", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/settings")>();
	return {
		...actual,
		getResolvedSettings: vi.fn().mockResolvedValue({
			language: "es",
			timezone: "UTC",
			clockFormat: "12h",
		}),
		updateUserSettings: vi.fn().mockResolvedValue(undefined),
	};
});

vi.mock("@/hooks/useOrganization", () => ({
	useOrganization: () => ({
		org: { name: "Test Org", logo: null, role: "member" },
		isLoading: false,
	}),
}));

// Mock the Header component
vi.mock("@/components/header", () => ({
	Header: () => <header data-testid="header">Header</header>,
}));

function baseSubscription(
	overrides: Partial<SubscriptionStatus>,
): SubscriptionStatus {
	return {
		hasSubscription: true,
		status: "active",
		plan: "watchlist",
		limits: null,
		isTrialing: false,
		trialDaysRemaining: null,
		currentPeriodStart: null,
		currentPeriodEnd: null,
		cancelAtPeriodEnd: false,
		isLicenseBased: false,
		licenseExpiresAt: null,
		organizationsOwned: 0,
		organizationsLimit: 0,
		...overrides,
	};
}

function ctx(
	overrides: Partial<SubscriptionContextValue>,
): SubscriptionContextValue {
	return {
		subscription: null,
		isLoading: false,
		error: null,
		refresh: vi.fn(),
		isFreeTier: true,
		hasPaidSubscription: false,
		isEnterprise: false,
		...overrides,
	};
}

describe("LayoutContent", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("renders Header", () => {
		mockUseSubscriptionSafe.mockReturnValue(
			ctx({
				subscription: baseSubscription({}),
				isFreeTier: false,
				hasPaidSubscription: true,
			}),
		);

		render(
			<LanguageProvider>
				<LayoutContent>
					<div>Test content</div>
				</LayoutContent>
			</LanguageProvider>,
		);

		expect(screen.getByTestId("header")).toBeInTheDocument();
	});

	it("renders children when outside SubscriptionProvider (safe null)", () => {
		mockUseSubscriptionSafe.mockReturnValue(null);

		render(
			<LanguageProvider>
				<LayoutContent>
					<div data-testid="child-content">Test content</div>
				</LayoutContent>
			</LanguageProvider>,
		);

		expect(screen.getByTestId("child-content")).toBeInTheDocument();
	});

	it("shows NoWatchlistAccess loading when subscription is loading", () => {
		mockUseSubscriptionSafe.mockReturnValue(
			ctx({
				isLoading: true,
				subscription: null,
			}),
		);

		render(
			<LanguageProvider>
				<LayoutContent>
					<div data-testid="child-content">Hidden</div>
				</LayoutContent>
			</LanguageProvider>,
		);

		expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
		expect(
			screen.getByTestId("no-watchlist-loading-skeleton"),
		).toBeInTheDocument();
	});

	it("shows NoWatchlistAccess when user lacks watchlist access", () => {
		mockUseSubscriptionSafe.mockReturnValue(
			ctx({
				isLoading: false,
				subscription: baseSubscription({
					hasSubscription: true,
					status: "canceled",
				}),
			}),
		);

		render(
			<LanguageProvider>
				<LayoutContent>
					<div data-testid="child-content">Hidden</div>
				</LayoutContent>
			</LanguageProvider>,
		);

		expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
		expect(
			screen.getByText("Acceso Watchlist No Disponible"),
		).toBeInTheDocument();
	});

	it("renders children when subscription has active watchlist access", () => {
		mockUseSubscriptionSafe.mockReturnValue(
			ctx({
				isLoading: false,
				subscription: baseSubscription({
					status: "active",
					plan: "watchlist",
				}),
				isFreeTier: false,
				hasPaidSubscription: true,
			}),
		);

		render(
			<LanguageProvider>
				<LayoutContent>
					<div data-testid="child-content">Visible</div>
				</LayoutContent>
			</LanguageProvider>,
		);

		expect(screen.getByTestId("child-content")).toBeInTheDocument();
	});

	it("passes through multiple children", () => {
		mockUseSubscriptionSafe.mockReturnValue(
			ctx({
				subscription: baseSubscription({}),
				isFreeTier: false,
				hasPaidSubscription: true,
			}),
		);

		render(
			<LanguageProvider>
				<LayoutContent>
					<div data-testid="child-1">Child 1</div>
					<div data-testid="child-2">Child 2</div>
				</LayoutContent>
			</LanguageProvider>,
		);

		expect(screen.getByTestId("child-1")).toBeInTheDocument();
		expect(screen.getByTestId("child-2")).toBeInTheDocument();
	});
});

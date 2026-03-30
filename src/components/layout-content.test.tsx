import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LayoutContent } from "./layout-content";
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

vi.mock("@/lib/settings", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
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
			<LayoutContent>
				<div>Test content</div>
			</LayoutContent>,
		);

		expect(screen.getByTestId("header")).toBeInTheDocument();
	});

	it("renders children when outside SubscriptionProvider (safe null)", () => {
		mockUseSubscriptionSafe.mockReturnValue(null);

		render(
			<LayoutContent>
				<div data-testid="child-content">Test content</div>
			</LayoutContent>,
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
			<LayoutContent>
				<div data-testid="child-content">Hidden</div>
			</LayoutContent>,
		);

		expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
		expect(screen.getByText("loading")).toBeInTheDocument();
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
			<LayoutContent>
				<div data-testid="child-content">Hidden</div>
			</LayoutContent>,
		);

		expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
		expect(
			screen.getByText("subscription.noWatchlistAccess.title"),
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
			<LayoutContent>
				<div data-testid="child-content">Visible</div>
			</LayoutContent>,
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
			<LayoutContent>
				<div data-testid="child-1">Child 1</div>
				<div data-testid="child-2">Child 2</div>
			</LayoutContent>,
		);

		expect(screen.getByTestId("child-1")).toBeInTheDocument();
		expect(screen.getByTestId("child-2")).toBeInTheDocument();
	});
});

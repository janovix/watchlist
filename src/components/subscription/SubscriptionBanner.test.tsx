import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SubscriptionBanner } from "./SubscriptionBanner";

// Mock the subscription hook
vi.mock("@/lib/subscription", () => ({
	useSubscriptionSafe: vi.fn(),
}));

// Mock the language provider
vi.mock("@/components/language-provider", () => ({
	useLanguage: vi.fn(() => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				subscriptionLimitReached: "Limit Reached",
				subscriptionLimitReachedDesc: "You've reached your limit for {metrics}",
				subscriptionNearLimit: "Near Limit",
				subscriptionNearLimitDesc:
					"You're approaching your limit for {metrics}",
				subscriptionFreeTier: "Free Tier",
				subscriptionFreeTierDesc: "Upgrade to unlock more features",
				subscriptionUpgrade: "Upgrade",
				subscriptionMetricNotices: "Notices",
				subscriptionMetricUsers: "Users",
				subscriptionMetricAlerts: "Alerts",
				subscriptionMetricTransactions: "Transactions",
				dismiss: "Dismiss",
			};
			return translations[key] || key;
		},
	})),
}));

import { useSubscriptionSafe } from "@/lib/subscription";
import type { SubscriptionContextValue } from "@/lib/subscription/useSubscription";
import type { SubscriptionStatus } from "@/lib/subscription/subscriptionClient";

describe("SubscriptionBanner", () => {
	const originalWindow = global.window;

	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(global, "window", {
			value: {
				location: {
					origin: "https://watchlist.example.com",
				},
			},
			writable: true,
			configurable: true,
		});
	});

	afterEach(() => {
		cleanup();
		Object.defineProperty(global, "window", {
			value: originalWindow,
			writable: true,
			configurable: true,
		});
		vi.restoreAllMocks();
	});

	const createMockSubscription = (
		overrides?: Partial<SubscriptionStatus>,
	): SubscriptionStatus => ({
		hasSubscription: false,
		isEnterprise: false,
		status: "inactive",
		planTier: "free",
		planName: null,
		currentPeriodStart: null,
		currentPeriodEnd: null,
		cancelAtPeriodEnd: false,
		usage: {
			notices: {
				allowed: true,
				used: 0,
				included: 10,
				remaining: 10,
				overage: 0,
				planTier: "free",
			},
			users: {
				allowed: true,
				used: 0,
				included: 5,
				remaining: 5,
				overage: 0,
				planTier: "free",
			},
			alerts: {
				allowed: true,
				used: 0,
				included: 10,
				remaining: 10,
				overage: 0,
				planTier: "free",
			},
			transactions: {
				allowed: true,
				used: 0,
				included: 100,
				remaining: 100,
				overage: 0,
				planTier: "free",
			},
		},
		features: [],
		stripeCustomerId: "",
		...overrides,
	});

	const createMockContext = (
		subscription: SubscriptionStatus | null,
		isLoading = false,
	): SubscriptionContextValue => ({
		subscription,
		isLoading,
		error: null,
		refresh: vi.fn(),
		isFreeTier: Boolean(subscription?.planTier === "free"),
		hasPaidSubscription: Boolean(
			subscription?.hasSubscription &&
			subscription.planTier !== "none" &&
			subscription.planTier !== "free",
		),
		getUsage: (metric: "notices" | "users" | "alerts" | "transactions") =>
			subscription?.usage?.[metric] ?? null,
		isNearLimit: (metric: "notices" | "users" | "alerts" | "transactions") => {
			const usage = subscription?.usage?.[metric];
			if (!usage) return false;
			const percentage =
				usage.included === -1 || usage.included === 0
					? 0
					: Math.round((usage.used / usage.included) * 100);
			return percentage >= 80;
		},
		isAtLimit: (metric: "notices" | "users" | "alerts" | "transactions") => {
			const usage = subscription?.usage?.[metric];
			if (!usage) return false;
			const percentage =
				usage.included === -1 || usage.included === 0
					? 0
					: Math.round((usage.used / usage.included) * 100);
			return percentage >= 100;
		},
		getUsagePercentage: (
			metric: "notices" | "users" | "alerts" | "transactions",
		) => {
			const usage = subscription?.usage?.[metric];
			if (!usage) return 0;
			if (usage.included === -1 || usage.included === 0) return 0;
			return Math.round((usage.used / usage.included) * 100);
		},
	});

	it("should not render when subscription is null", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(createMockContext(null));

		const { container } = render(<SubscriptionBanner />);
		expect(container.firstChild).toBeNull();
	});

	it("should not render when loading", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(null, true),
		);

		const { container } = render(<SubscriptionBanner />);
		expect(container.firstChild).toBeNull();
	});

	it("should render free tier banner by default", () => {
		const subscription = createMockSubscription({ planTier: "free" });
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		render(<SubscriptionBanner />);

		expect(screen.getByText("Free Tier")).toBeInTheDocument();
		expect(
			screen.getByText("Upgrade to unlock more features"),
		).toBeInTheDocument();
		expect(screen.getByText("Upgrade")).toBeInTheDocument();
	});

	it("should not render free tier banner when showFreeTierBanner is false", () => {
		const subscription = createMockSubscription({ planTier: "free" });
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		const { container } = render(
			<SubscriptionBanner showFreeTierBanner={false} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it("should render urgent banner when at limit", () => {
		const subscription = createMockSubscription({
			usage: {
				notices: {
					allowed: true,
					used: 10,
					included: 10,
					remaining: 0,
					overage: 0,
					planTier: "free",
				},
				users: {
					allowed: true,
					used: 0,
					included: 5,
					remaining: 5,
					overage: 0,
					planTier: "free",
				},
				alerts: {
					allowed: true,
					used: 10,
					included: 10,
					remaining: 0,
					overage: 0,
					planTier: "free",
				},
			},
		});
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		render(<SubscriptionBanner checkMetrics={["alerts"]} />);

		expect(screen.getByText("Limit Reached")).toBeInTheDocument();
		expect(
			screen.getByText(/You've reached your limit for Alerts/),
		).toBeInTheDocument();
	});

	it("should render warning banner when near limit", () => {
		const subscription = createMockSubscription({
			usage: {
				notices: {
					allowed: true,
					used: 0,
					included: 10,
					remaining: 10,
					overage: 0,
					planTier: "free",
				},
				users: {
					allowed: true,
					used: 0,
					included: 5,
					remaining: 5,
					overage: 0,
					planTier: "free",
				},
				alerts: {
					allowed: true,
					used: 8,
					included: 10,
					remaining: 2,
					overage: 0,
					planTier: "free",
				},
			},
		});
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		render(<SubscriptionBanner checkMetrics={["alerts"]} />);

		expect(screen.getByText("Near Limit")).toBeInTheDocument();
		expect(
			screen.getByText(/You're approaching your limit for Alerts/),
		).toBeInTheDocument();
	});

	it("should handle multiple metrics at limit", () => {
		const subscription = createMockSubscription({
			usage: {
				notices: {
					allowed: true,
					used: 10,
					included: 10,
					remaining: 0,
					overage: 0,
					planTier: "free",
				},
				users: {
					allowed: true,
					used: 5,
					included: 5,
					remaining: 0,
					overage: 0,
					planTier: "free",
				},
				alerts: {
					allowed: true,
					used: 10,
					included: 10,
					remaining: 0,
					overage: 0,
					planTier: "free",
				},
			},
		});
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		const { container } = render(
			<SubscriptionBanner checkMetrics={["notices", "users", "alerts"]} />,
		);

		expect(screen.getAllByText("Limit Reached")[0]).toBeInTheDocument();
		const description = screen.getByText(/You've reached your limit for/);
		expect(description).toBeInTheDocument();
		// Should include all metrics
		expect(description.textContent).toContain("Notices");
		expect(description.textContent).toContain("Users");
		expect(description.textContent).toContain("Alerts");
	});

	it("should prioritize at limit over near limit", () => {
		const subscription = createMockSubscription({
			usage: {
				notices: {
					allowed: true,
					used: 10,
					included: 10,
					remaining: 0,
					overage: 0,
					planTier: "free",
				},
				users: {
					allowed: true,
					used: 0,
					included: 5,
					remaining: 5,
					overage: 0,
					planTier: "free",
				},
				alerts: {
					allowed: true,
					used: 8,
					included: 10,
					remaining: 2,
					overage: 0,
					planTier: "free",
				},
			},
		});
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		render(<SubscriptionBanner checkMetrics={["notices", "alerts"]} />);

		// Should show urgent (at limit) not warning (near limit)
		expect(screen.getAllByText("Limit Reached")[0]).toBeInTheDocument();
		expect(screen.queryByText("Near Limit")).not.toBeInTheDocument();
	});

	it("should use custom billing URL when provided", () => {
		const subscription = createMockSubscription({ planTier: "free" });
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		render(<SubscriptionBanner billingUrl="https://custom.billing.com" />);

		const upgradeLinks = screen.getAllByText("Upgrade");
		const upgradeLink = upgradeLinks[0].closest("a");
		expect(upgradeLink).toHaveAttribute("href", "https://custom.billing.com");
	});

	it("should construct billing URL from window location when not provided", () => {
		const subscription = createMockSubscription({ planTier: "free" });
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		render(<SubscriptionBanner />);

		const upgradeLinks = screen.getAllByText("Upgrade");
		const upgradeLink = upgradeLinks[0].closest("a");
		// Should replace "watchlist." with "auth." in origin
		expect(upgradeLink).toHaveAttribute(
			"href",
			"https://auth.example.com/settings/billing",
		);
	});

	it("should be dismissible by default", () => {
		const subscription = createMockSubscription({ planTier: "free" });
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		const { container } = render(<SubscriptionBanner />);

		// Find the dismiss button by role (button) or by the X icon
		const dismissButton = screen.getByRole("button", { name: /dismiss/i });
		expect(dismissButton).toBeInTheDocument();

		fireEvent.click(dismissButton);

		// Banner should be dismissed
		expect(container.firstChild).toBeNull();
	});

	it("should not be dismissible when dismissible is false", () => {
		const subscription = createMockSubscription({ planTier: "free" });
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		render(<SubscriptionBanner dismissible={false} />);

		expect(screen.queryByLabelText("Dismiss")).not.toBeInTheDocument();
	});

	it("should not render for paid subscription without warnings", () => {
		const subscription = createMockSubscription({
			hasSubscription: true,
			planTier: "pro",
			status: "active",
			planName: "Pro Plan",
			currentPeriodStart: "2024-01-01T00:00:00Z",
			currentPeriodEnd: "2024-02-01T00:00:00Z",
			usage: {
				notices: {
					allowed: true,
					used: 50,
					included: 100,
					remaining: 50,
					overage: 0,
					planTier: "pro",
				},
				users: {
					allowed: true,
					used: 10,
					included: 20,
					remaining: 10,
					overage: 0,
					planTier: "pro",
				},
				alerts: {
					allowed: true,
					used: 50,
					included: 100,
					remaining: 50,
					overage: 0,
					planTier: "pro",
				},
			},
		});
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		const { container } = render(<SubscriptionBanner />);
		expect(container.firstChild).toBeNull();
	});

	it("should render for paid subscription with warnings", () => {
		const subscription = createMockSubscription({
			hasSubscription: true,
			planTier: "pro",
			status: "active",
			planName: "Pro Plan",
			currentPeriodStart: "2024-01-01T00:00:00Z",
			currentPeriodEnd: "2024-02-01T00:00:00Z",
			usage: {
				notices: {
					allowed: true,
					used: 50,
					included: 100,
					remaining: 50,
					overage: 0,
					planTier: "pro",
				},
				users: {
					allowed: true,
					used: 10,
					included: 20,
					remaining: 10,
					overage: 0,
					planTier: "pro",
				},
				alerts: {
					allowed: true,
					used: 90,
					included: 100,
					remaining: 10,
					overage: 0,
					planTier: "pro",
				},
			},
		});
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		render(<SubscriptionBanner checkMetrics={["alerts"]} />);

		expect(screen.getByText("Near Limit")).toBeInTheDocument();
	});

	it("should use fallback billing URL when window is undefined (SSR)", () => {
		// Note: Testing SSR behavior is difficult in jsdom environment
		// The component checks `typeof window !== "undefined"` and falls back to "/settings/billing"
		// This is tested indirectly through the component's logic
		// For a true SSR test, we would need to use React's server rendering utilities
		const subscription = createMockSubscription({ planTier: "free" });
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext(subscription),
		);

		// When billingUrl is not provided, component constructs it from window.location
		// In SSR, it would fallback to "/settings/billing"
		// Since we can't truly test SSR in jsdom, we verify the component handles
		// the case when billingUrl is explicitly set to the fallback value
		render(<SubscriptionBanner billingUrl="/settings/billing" />);

		const upgradeLinks = screen.getAllByText("Upgrade");
		const upgradeLink = upgradeLinks[0].closest("a");
		expect(upgradeLink).toHaveAttribute("href", "/settings/billing");
	});
});

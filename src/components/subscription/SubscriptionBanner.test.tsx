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
				subscriptionFreeTier: "Free Tier",
				subscriptionFreeTierDesc: "Upgrade to unlock more features",
				subscriptionUpgrade: "Upgrade",
				dismiss: "Dismiss",
			};
			return translations[key] || key;
		},
	})),
}));

vi.mock("@/hooks/useFlags", () => ({
	useFlags: vi.fn(() => ({
		flags: { "stripe-billing-enabled": true },
		error: null,
		isLoading: false,
	})),
}));

import { useSubscriptionSafe } from "@/lib/subscription";
import { useFlags } from "@/hooks/useFlags";
import type { SubscriptionContextValue } from "@/lib/subscription/useSubscription";

describe("SubscriptionBanner", () => {
	const originalWindow = global.window;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useFlags).mockReturnValue({
			flags: { "stripe-billing-enabled": true },
			error: null,
			isLoading: false,
		});
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

	const createMockContext = (
		overrides?: Partial<SubscriptionContextValue>,
	): SubscriptionContextValue => ({
		subscription: null,
		isLoading: false,
		error: null,
		refresh: vi.fn(),
		isFreeTier: false,
		hasPaidSubscription: false,
		isEnterprise: false,
		...overrides,
	});

	it("should not render when subscription context is null", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(null);

		const { container } = render(<SubscriptionBanner />);
		expect(container.firstChild).toBeNull();
	});

	it("should not render when loading", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ isLoading: true }),
		);

		const { container } = render(<SubscriptionBanner />);
		expect(container.firstChild).toBeNull();
	});

	it("should render free tier banner by default", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ isFreeTier: true }),
		);

		render(<SubscriptionBanner />);

		expect(screen.getByText("Free Tier")).toBeInTheDocument();
		expect(
			screen.getByText("Upgrade to unlock more features"),
		).toBeInTheDocument();
		expect(screen.getByText("Upgrade")).toBeInTheDocument();
	});

	it("does not render free tier banner when stripe billing is disabled", () => {
		vi.mocked(useFlags).mockReturnValue({
			flags: { "stripe-billing-enabled": false },
			error: null,
			isLoading: false,
		});
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ isFreeTier: true }),
		);

		const { container } = render(<SubscriptionBanner />);
		expect(container.firstChild).toBeNull();
	});

	it("renders free tier banner when stripe flags fail to load (fail-open)", () => {
		vi.mocked(useFlags).mockReturnValue({
			flags: {},
			error: "flags unavailable",
			isLoading: false,
		});
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ isFreeTier: true }),
		);

		render(<SubscriptionBanner />);

		expect(screen.getByText("Free Tier")).toBeInTheDocument();
	});

	it("should not render free tier banner when showFreeTierBanner is false", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ isFreeTier: true }),
		);

		const { container } = render(
			<SubscriptionBanner showFreeTierBanner={false} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it("should not render for paid subscription", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ hasPaidSubscription: true }),
		);

		const { container } = render(<SubscriptionBanner />);
		expect(container.firstChild).toBeNull();
	});

	it("should not render for enterprise license", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ hasPaidSubscription: true, isEnterprise: true }),
		);

		const { container } = render(<SubscriptionBanner />);
		expect(container.firstChild).toBeNull();
	});

	it("should use custom billing URL when provided", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ isFreeTier: true }),
		);

		render(<SubscriptionBanner billingUrl="https://custom.billing.com" />);

		const upgradeLinks = screen.getAllByText("Upgrade");
		const upgradeLink = upgradeLinks[0].closest("a");
		expect(upgradeLink).toHaveAttribute("href", "https://custom.billing.com");
	});

	it("should construct billing URL from window location when not provided", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ isFreeTier: true }),
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
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ isFreeTier: true }),
		);

		const { container } = render(<SubscriptionBanner />);

		const dismissButton = screen.getByRole("button", { name: /dismiss/i });
		expect(dismissButton).toBeInTheDocument();

		fireEvent.click(dismissButton);

		// Banner should be dismissed
		expect(container.firstChild).toBeNull();
	});

	it("should not be dismissible when dismissible is false", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ isFreeTier: true }),
		);

		render(<SubscriptionBanner dismissible={false} />);

		expect(screen.queryByLabelText("Dismiss")).not.toBeInTheDocument();
	});

	it("should use fallback billing URL when window is undefined (SSR)", () => {
		vi.mocked(useSubscriptionSafe).mockReturnValue(
			createMockContext({ isFreeTier: true }),
		);

		render(<SubscriptionBanner billingUrl="/settings/billing" />);

		const upgradeLinks = screen.getAllByText("Upgrade");
		const upgradeLink = upgradeLinks[0].closest("a");
		expect(upgradeLink).toHaveAttribute("href", "/settings/billing");
	});
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import {
	SubscriptionProvider,
	useSubscription,
	useSubscriptionSafe,
} from "./useSubscription";
import type { SubscriptionStatus } from "./subscriptionClient";

// Mock the subscription client
vi.mock("./subscriptionClient", async () => {
	const actual = await vi.importActual<typeof import("./subscriptionClient")>(
		"./subscriptionClient",
	);
	return {
		...actual,
		getSubscriptionStatus: vi.fn(),
		isFreeTier: vi.fn(),
		hasPaidSubscription: vi.fn(),
		isNearLimit: vi.fn(),
		isAtLimit: vi.fn(),
		getUsagePercentage: vi.fn(),
	};
});

import {
	getSubscriptionStatus,
	isFreeTier,
	hasPaidSubscription,
	isNearLimit,
	isAtLimit,
	getUsagePercentage,
} from "./subscriptionClient";

// Test component that uses the hook
function TestComponent() {
	const subscription = useSubscription();
	return (
		<div>
			<span data-testid="loading">
				{subscription.isLoading ? "true" : "false"}
			</span>
			<span data-testid="error">
				{subscription.error ? subscription.error.message : "none"}
			</span>
			<span data-testid="has-subscription">
				{subscription.subscription ? "yes" : "no"}
			</span>
			<span data-testid="is-free-tier">
				{subscription.isFreeTier ? "true" : "false"}
			</span>
			<span data-testid="has-paid">
				{subscription.hasPaidSubscription ? "true" : "false"}
			</span>
			<span data-testid="usage-notices">
				{subscription.getUsage("notices")?.used ?? "null"}
			</span>
			<span data-testid="is-near-limit">
				{subscription.isNearLimit("alerts") ? "true" : "false"}
			</span>
			<span data-testid="is-at-limit">
				{subscription.isAtLimit("alerts") ? "true" : "false"}
			</span>
			<span data-testid="usage-percentage">
				{subscription.getUsagePercentage("alerts")}
			</span>
			<button onClick={() => subscription.refresh()}>Refresh</button>
		</div>
	);
}

// Test component that uses the safe hook
function TestSafeComponent() {
	const subscription = useSubscriptionSafe();
	if (!subscription) {
		return <div data-testid="no-context">No context</div>;
	}
	return <div data-testid="has-context">Has context</div>;
}

describe("SubscriptionProvider and hooks", () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		cleanup();
		global.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	describe("SubscriptionProvider", () => {
		it("should provide subscription context to children", async () => {
			const mockStatus: SubscriptionStatus = {
				hasSubscription: true,
				isEnterprise: false,
				status: "active",
				planTier: "pro",
				planName: "Pro Plan",
				currentPeriodStart: "2024-01-01T00:00:00Z",
				currentPeriodEnd: "2024-02-01T00:00:00Z",
				cancelAtPeriodEnd: false,
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
						used: 80,
						included: 100,
						remaining: 20,
						overage: 0,
						planTier: "pro",
					},
				},
				features: [],
				stripeCustomerId: "cus_123",
			};

			vi.mocked(getSubscriptionStatus).mockResolvedValue(mockStatus);
			vi.mocked(isFreeTier).mockReturnValue(false);
			vi.mocked(hasPaidSubscription).mockReturnValue(true);
			vi.mocked(isNearLimit).mockReturnValue(true);
			vi.mocked(isAtLimit).mockReturnValue(false);
			vi.mocked(getUsagePercentage).mockReturnValue(80);

			render(
				<SubscriptionProvider>
					<TestComponent />
				</SubscriptionProvider>,
			);

			// Initially loading
			expect(screen.getByTestId("loading")).toHaveTextContent("true");

			// Wait for loading to complete
			await waitFor(() => {
				expect(screen.getByTestId("loading")).toHaveTextContent("false");
			});

			expect(screen.getByTestId("has-subscription")).toHaveTextContent("yes");
			expect(screen.getByTestId("is-free-tier")).toHaveTextContent("false");
			expect(screen.getByTestId("has-paid")).toHaveTextContent("true");
			expect(screen.getByTestId("usage-notices")).toHaveTextContent("50");
			expect(screen.getByTestId("is-near-limit")).toHaveTextContent("true");
			expect(screen.getByTestId("is-at-limit")).toHaveTextContent("false");
			expect(screen.getByTestId("usage-percentage")).toHaveTextContent("80");
		});

		it("should handle loading state", async () => {
			vi.mocked(getSubscriptionStatus).mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => resolve(null), 100);
					}),
			);

			render(
				<SubscriptionProvider>
					<TestComponent />
				</SubscriptionProvider>,
			);

			expect(screen.getByTestId("loading")).toHaveTextContent("true");

			await waitFor(
				() => {
					expect(screen.getByTestId("loading")).toHaveTextContent("false");
				},
				{ timeout: 200 },
			);
		});

		it("should handle errors", async () => {
			const error = new Error("Failed to fetch");
			vi.mocked(getSubscriptionStatus).mockRejectedValue(error);

			render(
				<SubscriptionProvider>
					<TestComponent />
				</SubscriptionProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("loading")).toHaveTextContent("false");
			});

			expect(screen.getByTestId("error")).toHaveTextContent("Failed to fetch");
		});

		it("should handle null subscription", async () => {
			vi.mocked(getSubscriptionStatus).mockResolvedValue(null);
			vi.mocked(isFreeTier).mockReturnValue(false);
			vi.mocked(hasPaidSubscription).mockReturnValue(false);

			render(
				<SubscriptionProvider>
					<TestComponent />
				</SubscriptionProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("loading")).toHaveTextContent("false");
			});

			expect(screen.getByTestId("has-subscription")).toHaveTextContent("no");
		});

		it("should refresh subscription on refresh call", async () => {
			const mockStatus: SubscriptionStatus = {
				hasSubscription: true,
				isEnterprise: false,
				status: "active",
				planTier: "pro",
				planName: "Pro Plan",
				currentPeriodStart: "2024-01-01T00:00:00Z",
				currentPeriodEnd: "2024-02-01T00:00:00Z",
				cancelAtPeriodEnd: false,
				usage: null,
				features: [],
				stripeCustomerId: "cus_123",
			};

			vi.mocked(getSubscriptionStatus).mockResolvedValue(mockStatus);
			vi.mocked(isFreeTier).mockReturnValue(false);
			vi.mocked(hasPaidSubscription).mockReturnValue(true);

			render(
				<SubscriptionProvider>
					<TestComponent />
				</SubscriptionProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("loading")).toHaveTextContent("false");
			});

			expect(getSubscriptionStatus).toHaveBeenCalledTimes(1);

			const refreshButton = screen.getByText("Refresh");
			await act(async () => {
				refreshButton.click();
			});

			await waitFor(() => {
				expect(getSubscriptionStatus).toHaveBeenCalledTimes(2);
			});
		});

		it("should handle free tier subscription", async () => {
			const mockStatus: SubscriptionStatus = {
				hasSubscription: false,
				isEnterprise: false,
				status: "inactive",
				planTier: "free",
				planName: null,
				currentPeriodStart: null,
				currentPeriodEnd: null,
				cancelAtPeriodEnd: false,
				usage: null,
				features: [],
				stripeCustomerId: "",
			};

			vi.mocked(getSubscriptionStatus).mockResolvedValue(mockStatus);
			vi.mocked(isFreeTier).mockReturnValue(true);
			vi.mocked(hasPaidSubscription).mockReturnValue(false);

			render(
				<SubscriptionProvider>
					<TestComponent />
				</SubscriptionProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("loading")).toHaveTextContent("false");
			});

			expect(screen.getByTestId("is-free-tier")).toHaveTextContent("true");
			expect(screen.getByTestId("has-paid")).toHaveTextContent("false");
		});

		it("should handle usage metrics correctly", async () => {
			const mockStatus: SubscriptionStatus = {
				hasSubscription: true,
				isEnterprise: false,
				status: "active",
				planTier: "pro",
				planName: "Pro Plan",
				currentPeriodStart: "2024-01-01T00:00:00Z",
				currentPeriodEnd: "2024-02-01T00:00:00Z",
				cancelAtPeriodEnd: false,
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
						used: 100,
						included: 100,
						remaining: 0,
						overage: 0,
						planTier: "pro",
					},
					transactions: {
						allowed: true,
						used: 200,
						included: 100,
						remaining: 0,
						overage: 100,
						planTier: "pro",
					},
				},
				features: [],
				stripeCustomerId: "cus_123",
			};

			vi.mocked(getSubscriptionStatus).mockResolvedValue(mockStatus);
			vi.mocked(isFreeTier).mockReturnValue(false);
			vi.mocked(hasPaidSubscription).mockReturnValue(true);
			vi.mocked(isNearLimit).mockImplementation((usage) => {
				return usage.used >= usage.included * 0.8;
			});
			vi.mocked(isAtLimit).mockImplementation((usage) => {
				return usage.used >= usage.included;
			});
			vi.mocked(getUsagePercentage).mockImplementation((usage) => {
				if (usage.included === -1 || usage.included === 0) return 0;
				return Math.round((usage.used / usage.included) * 100);
			});

			render(
				<SubscriptionProvider>
					<TestComponent />
				</SubscriptionProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("loading")).toHaveTextContent("false");
			});

			expect(screen.getByTestId("usage-notices")).toHaveTextContent("50");
			expect(screen.getByTestId("is-at-limit")).toHaveTextContent("true");
		});

		it("should return null for missing usage metrics", async () => {
			const mockStatus: SubscriptionStatus = {
				hasSubscription: true,
				isEnterprise: false,
				status: "active",
				planTier: "pro",
				planName: "Pro Plan",
				currentPeriodStart: "2024-01-01T00:00:00Z",
				currentPeriodEnd: "2024-02-01T00:00:00Z",
				cancelAtPeriodEnd: false,
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
				},
				features: [],
				stripeCustomerId: "cus_123",
			};

			vi.mocked(getSubscriptionStatus).mockResolvedValue(mockStatus);
			vi.mocked(isFreeTier).mockReturnValue(false);
			vi.mocked(hasPaidSubscription).mockReturnValue(true);
			vi.mocked(isNearLimit).mockReturnValue(false);
			vi.mocked(isAtLimit).mockReturnValue(false);
			vi.mocked(getUsagePercentage).mockReturnValue(0);

			render(
				<SubscriptionProvider>
					<TestComponent />
				</SubscriptionProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("loading")).toHaveTextContent("false");
			});

			// alerts metric is not in usage, so should return null/0
			expect(screen.getByTestId("is-near-limit")).toHaveTextContent("false");
			expect(screen.getByTestId("is-at-limit")).toHaveTextContent("false");
			expect(screen.getByTestId("usage-percentage")).toHaveTextContent("0");
		});
	});

	describe("useSubscription", () => {
		it("should throw error when used outside provider", () => {
			// Suppress console.error for this test
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			expect(() => {
				render(<TestComponent />);
			}).toThrow("useSubscription must be used within a SubscriptionProvider");

			consoleSpy.mockRestore();
		});
	});

	describe("useSubscriptionSafe", () => {
		it("should return null when used outside provider", () => {
			render(<TestSafeComponent />);
			expect(screen.getByTestId("no-context")).toBeInTheDocument();
		});

		it("should return context when used inside provider", async () => {
			const mockStatus: SubscriptionStatus = {
				hasSubscription: true,
				isEnterprise: false,
				status: "active",
				planTier: "pro",
				planName: "Pro Plan",
				currentPeriodStart: "2024-01-01T00:00:00Z",
				currentPeriodEnd: "2024-02-01T00:00:00Z",
				cancelAtPeriodEnd: false,
				usage: null,
				features: [],
				stripeCustomerId: "cus_123",
			};

			vi.mocked(getSubscriptionStatus).mockResolvedValue(mockStatus);
			vi.mocked(isFreeTier).mockReturnValue(false);
			vi.mocked(hasPaidSubscription).mockReturnValue(true);

			render(
				<SubscriptionProvider>
					<TestSafeComponent />
				</SubscriptionProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("has-context")).toBeInTheDocument();
			});
		});
	});
});

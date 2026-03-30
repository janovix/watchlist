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
		isEnterprise: vi.fn(),
	};
});

import {
	getSubscriptionStatus,
	isFreeTier,
	hasPaidSubscription,
	isEnterprise,
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
			<span data-testid="is-enterprise">
				{subscription.isEnterprise ? "true" : "false"}
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
				status: "active",
				plan: "pro",
				limits: {
					maxOrganizations: 3,
					usersPerOrg: 10,
					reportsPerMonth: 50,
					noticesPerMonth: 100,
					alertsPerMonth: 50,
					operationsPerMonth: 200,
					clientsPerMonth: 100,
				},
				isTrialing: false,
				trialDaysRemaining: null,
				currentPeriodStart: "2024-01-01T00:00:00Z",
				currentPeriodEnd: "2024-02-01T00:00:00Z",
				cancelAtPeriodEnd: false,
				isLicenseBased: false,
				licenseExpiresAt: null,
				organizationsOwned: 1,
				organizationsLimit: 3,
			};

			vi.mocked(getSubscriptionStatus).mockResolvedValue(mockStatus);
			vi.mocked(isFreeTier).mockReturnValue(false);
			vi.mocked(hasPaidSubscription).mockReturnValue(true);
			vi.mocked(isEnterprise).mockReturnValue(false);

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
			expect(screen.getByTestId("is-enterprise")).toHaveTextContent("false");
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
			vi.mocked(isEnterprise).mockReturnValue(false);

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
				status: "active",
				plan: "pro",
				limits: null,
				isTrialing: false,
				trialDaysRemaining: null,
				currentPeriodStart: "2024-01-01T00:00:00Z",
				currentPeriodEnd: "2024-02-01T00:00:00Z",
				cancelAtPeriodEnd: false,
				isLicenseBased: false,
				licenseExpiresAt: null,
				organizationsOwned: 1,
				organizationsLimit: 3,
			};

			vi.mocked(getSubscriptionStatus).mockResolvedValue(mockStatus);
			vi.mocked(isFreeTier).mockReturnValue(false);
			vi.mocked(hasPaidSubscription).mockReturnValue(true);
			vi.mocked(isEnterprise).mockReturnValue(false);

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

		it("should surface error when refresh fails", async () => {
			const mockStatus: SubscriptionStatus = {
				hasSubscription: true,
				status: "active",
				plan: "pro",
				limits: null,
				isTrialing: false,
				trialDaysRemaining: null,
				currentPeriodStart: null,
				currentPeriodEnd: null,
				cancelAtPeriodEnd: false,
				isLicenseBased: false,
				licenseExpiresAt: null,
				organizationsOwned: 1,
				organizationsLimit: 3,
			};

			vi.mocked(getSubscriptionStatus)
				.mockResolvedValueOnce(mockStatus)
				.mockRejectedValueOnce(new Error("refresh failed"));
			vi.mocked(isFreeTier).mockReturnValue(false);
			vi.mocked(hasPaidSubscription).mockReturnValue(true);
			vi.mocked(isEnterprise).mockReturnValue(false);

			render(
				<SubscriptionProvider>
					<TestComponent />
				</SubscriptionProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("loading")).toHaveTextContent("false");
			});

			const refreshButton = screen.getByText("Refresh");
			await act(async () => {
				refreshButton.click();
			});

			await waitFor(() => {
				expect(screen.getByTestId("error")).toHaveTextContent("refresh failed");
			});
		});

		it("should handle free tier subscription", async () => {
			const mockStatus: SubscriptionStatus = {
				hasSubscription: false,
				status: null,
				plan: null,
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
			};

			vi.mocked(getSubscriptionStatus).mockResolvedValue(mockStatus);
			vi.mocked(isFreeTier).mockReturnValue(true);
			vi.mocked(hasPaidSubscription).mockReturnValue(false);
			vi.mocked(isEnterprise).mockReturnValue(false);

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

		it("should handle enterprise license subscription", async () => {
			const mockStatus: SubscriptionStatus = {
				hasSubscription: true,
				status: "active",
				plan: "enterprise",
				limits: {
					maxOrganizations: 0,
					usersPerOrg: 0,
					reportsPerMonth: 0,
					noticesPerMonth: 0,
					alertsPerMonth: 0,
					operationsPerMonth: 0,
					clientsPerMonth: 0,
				},
				isTrialing: false,
				trialDaysRemaining: null,
				currentPeriodStart: null,
				currentPeriodEnd: null,
				cancelAtPeriodEnd: false,
				isLicenseBased: true,
				licenseExpiresAt: "2026-12-31T00:00:00Z",
				organizationsOwned: 1,
				organizationsLimit: 0,
			};

			vi.mocked(getSubscriptionStatus).mockResolvedValue(mockStatus);
			vi.mocked(isFreeTier).mockReturnValue(false);
			vi.mocked(hasPaidSubscription).mockReturnValue(true);
			vi.mocked(isEnterprise).mockReturnValue(true);

			render(
				<SubscriptionProvider>
					<TestComponent />
				</SubscriptionProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("loading")).toHaveTextContent("false");
			});

			expect(screen.getByTestId("is-enterprise")).toHaveTextContent("true");
			expect(screen.getByTestId("has-paid")).toHaveTextContent("true");
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
				status: "active",
				plan: "pro",
				limits: null,
				isTrialing: false,
				trialDaysRemaining: null,
				currentPeriodStart: "2024-01-01T00:00:00Z",
				currentPeriodEnd: "2024-02-01T00:00:00Z",
				cancelAtPeriodEnd: false,
				isLicenseBased: false,
				licenseExpiresAt: null,
				organizationsOwned: 1,
				organizationsLimit: 3,
			};

			vi.mocked(getSubscriptionStatus).mockResolvedValue(mockStatus);
			vi.mocked(isFreeTier).mockReturnValue(false);
			vi.mocked(hasPaidSubscription).mockReturnValue(true);
			vi.mocked(isEnterprise).mockReturnValue(false);

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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	getSubscriptionStatus,
	isFreeTier,
	hasPaidSubscription,
	getUsagePercentage,
	isNearLimit,
	isAtLimit,
	type SubscriptionStatus,
	type UsageCheckResult,
} from "./subscriptionClient";

// Mock the auth config
vi.mock("../auth/config", () => ({
	getAuthCoreBaseUrl: () => "https://auth-svc.test",
}));

describe("subscriptionClient", () => {
	const originalFetch = global.fetch;
	const originalConsoleWarn = console.warn;

	beforeEach(() => {
		global.fetch = vi.fn();
		console.warn = vi.fn();
	});

	afterEach(() => {
		global.fetch = originalFetch;
		console.warn = originalConsoleWarn;
		vi.restoreAllMocks();
	});

	describe("getSubscriptionStatus", () => {
		it("should fetch and return subscription status successfully", async () => {
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
				features: ["feature1", "feature2"],
				stripeCustomerId: "cus_123",
			};

			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, data: mockStatus }),
			} as Response);

			const result = await getSubscriptionStatus();

			expect(global.fetch).toHaveBeenCalledWith(
				"https://auth-svc.test/api/subscription",
				{ credentials: "include" },
			);
			expect(result).toEqual(mockStatus);
		});

		it("should return null when response is not ok", async () => {
			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: false,
				status: 404,
			} as Response);

			const result = await getSubscriptionStatus();

			expect(result).toBeNull();
			expect(console.warn).toHaveBeenCalledWith(
				"Failed to fetch subscription status:",
				404,
			);
		});

		it("should return null when API response indicates failure", async () => {
			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: false }),
			} as Response);

			const result = await getSubscriptionStatus();

			expect(result).toBeNull();
		});

		it("should return null when API response has no data", async () => {
			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true }),
			} as Response);

			const result = await getSubscriptionStatus();

			expect(result).toBeNull();
		});

		it("should handle fetch errors gracefully", async () => {
			vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

			const result = await getSubscriptionStatus();

			expect(result).toBeNull();
			expect(console.warn).toHaveBeenCalledWith(
				"Error fetching subscription status:",
				expect.any(Error),
			);
		});
	});

	describe("isFreeTier", () => {
		it("should return false when subscription is null", () => {
			expect(isFreeTier(null)).toBe(false);
		});

		it("should return true when planTier is free", () => {
			const subscription: SubscriptionStatus = {
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
			expect(isFreeTier(subscription)).toBe(true);
		});

		it("should return true when has stripeCustomerId but no subscription", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: false,
				isEnterprise: false,
				status: "inactive",
				planTier: "none",
				planName: null,
				currentPeriodStart: null,
				currentPeriodEnd: null,
				cancelAtPeriodEnd: false,
				usage: null,
				features: [],
				stripeCustomerId: "cus_123",
			};
			expect(isFreeTier(subscription)).toBe(true);
		});

		it("should return false when has paid subscription", () => {
			const subscription: SubscriptionStatus = {
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
			expect(isFreeTier(subscription)).toBe(false);
		});
	});

	describe("hasPaidSubscription", () => {
		it("should return false when subscription is null", () => {
			expect(hasPaidSubscription(null)).toBe(false);
		});

		it("should return false when planTier is none", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: false,
				isEnterprise: false,
				status: "inactive",
				planTier: "none",
				planName: null,
				currentPeriodStart: null,
				currentPeriodEnd: null,
				cancelAtPeriodEnd: false,
				usage: null,
				features: [],
				stripeCustomerId: "",
			};
			expect(hasPaidSubscription(subscription)).toBe(false);
		});

		it("should return false when planTier is free", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				isEnterprise: false,
				status: "active",
				planTier: "free",
				planName: "Free Plan",
				currentPeriodStart: "2024-01-01T00:00:00Z",
				currentPeriodEnd: "2024-02-01T00:00:00Z",
				cancelAtPeriodEnd: false,
				usage: null,
				features: [],
				stripeCustomerId: "cus_123",
			};
			expect(hasPaidSubscription(subscription)).toBe(false);
		});

		it("should return true when has subscription with business tier", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				isEnterprise: false,
				status: "active",
				planTier: "business",
				planName: "Business Plan",
				currentPeriodStart: "2024-01-01T00:00:00Z",
				currentPeriodEnd: "2024-02-01T00:00:00Z",
				cancelAtPeriodEnd: false,
				usage: null,
				features: [],
				stripeCustomerId: "cus_123",
			};
			expect(hasPaidSubscription(subscription)).toBe(true);
		});

		it("should return true when has subscription with pro tier", () => {
			const subscription: SubscriptionStatus = {
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
			expect(hasPaidSubscription(subscription)).toBe(true);
		});

		it("should return true when has subscription with enterprise tier", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				isEnterprise: true,
				status: "active",
				planTier: "enterprise",
				planName: "Enterprise Plan",
				currentPeriodStart: "2024-01-01T00:00:00Z",
				currentPeriodEnd: "2024-02-01T00:00:00Z",
				cancelAtPeriodEnd: false,
				usage: null,
				features: [],
				stripeCustomerId: "cus_123",
			};
			expect(hasPaidSubscription(subscription)).toBe(true);
		});
	});

	describe("getUsagePercentage", () => {
		it("should return 0 when included is -1 (unlimited)", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 1000,
				included: -1,
				remaining: -1,
				overage: 0,
				planTier: "enterprise",
			};
			expect(getUsagePercentage(usage)).toBe(0);
		});

		it("should return 0 when included is 0", () => {
			const usage: UsageCheckResult = {
				allowed: false,
				used: 0,
				included: 0,
				remaining: 0,
				overage: 0,
				planTier: "none",
			};
			expect(getUsagePercentage(usage)).toBe(0);
		});

		it("should calculate percentage correctly", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 50,
				included: 100,
				remaining: 50,
				overage: 0,
				planTier: "pro",
			};
			expect(getUsagePercentage(usage)).toBe(50);
		});

		it("should round percentage correctly", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 33,
				included: 100,
				remaining: 67,
				overage: 0,
				planTier: "pro",
			};
			expect(getUsagePercentage(usage)).toBe(33);
		});

		it("should handle 100% usage", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 100,
				included: 100,
				remaining: 0,
				overage: 0,
				planTier: "pro",
			};
			expect(getUsagePercentage(usage)).toBe(100);
		});

		it("should handle overage (over 100%)", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 150,
				included: 100,
				remaining: 0,
				overage: 50,
				planTier: "pro",
			};
			expect(getUsagePercentage(usage)).toBe(150);
		});
	});

	describe("isNearLimit", () => {
		it("should return false when usage is below 80%", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 50,
				included: 100,
				remaining: 50,
				overage: 0,
				planTier: "pro",
			};
			expect(isNearLimit(usage)).toBe(false);
		});

		it("should return true when usage is exactly 80%", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 80,
				included: 100,
				remaining: 20,
				overage: 0,
				planTier: "pro",
			};
			expect(isNearLimit(usage)).toBe(true);
		});

		it("should return true when usage is above 80%", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 90,
				included: 100,
				remaining: 10,
				overage: 0,
				planTier: "pro",
			};
			expect(isNearLimit(usage)).toBe(true);
		});

		it("should return true when usage is at 100%", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 100,
				included: 100,
				remaining: 0,
				overage: 0,
				planTier: "pro",
			};
			expect(isNearLimit(usage)).toBe(true);
		});

		it("should return false for unlimited usage", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 1000,
				included: -1,
				remaining: -1,
				overage: 0,
				planTier: "enterprise",
			};
			expect(isNearLimit(usage)).toBe(false);
		});
	});

	describe("isAtLimit", () => {
		it("should return false when usage is below 100%", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 50,
				included: 100,
				remaining: 50,
				overage: 0,
				planTier: "pro",
			};
			expect(isAtLimit(usage)).toBe(false);
		});

		it("should return true when usage is exactly 100%", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 100,
				included: 100,
				remaining: 0,
				overage: 0,
				planTier: "pro",
			};
			expect(isAtLimit(usage)).toBe(true);
		});

		it("should return true when usage is above 100%", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 150,
				included: 100,
				remaining: 0,
				overage: 50,
				planTier: "pro",
			};
			expect(isAtLimit(usage)).toBe(true);
		});

		it("should return false for unlimited usage", () => {
			const usage: UsageCheckResult = {
				allowed: true,
				used: 1000,
				included: -1,
				remaining: -1,
				overage: 0,
				planTier: "enterprise",
			};
			expect(isAtLimit(usage)).toBe(false);
		});
	});
});

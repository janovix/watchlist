import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	getSubscriptionStatus,
	isFreeTier,
	hasPaidSubscription,
	isEnterprise,
	getUsagePercentage,
	hasAMLAccess,
	hasWatchlistAccess,
	type SubscriptionStatus,
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

			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, data: mockStatus }),
			} as Response);

			const result = await getSubscriptionStatus();

			expect(global.fetch).toHaveBeenCalledWith(
				"https://auth-svc.test/api/subscription/status?resolveFromOrg=true",
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

		it("should return true when no subscription", () => {
			const subscription: SubscriptionStatus = {
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
			expect(isFreeTier(subscription)).toBe(true);
		});

		it("should return false when has active subscription", () => {
			const subscription: SubscriptionStatus = {
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
			expect(isFreeTier(subscription)).toBe(false);
		});
	});

	describe("hasPaidSubscription", () => {
		it("should return false when subscription is null", () => {
			expect(hasPaidSubscription(null)).toBe(false);
		});

		it("should return false when plan is none", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: false,
				status: null,
				plan: "none",
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
			expect(hasPaidSubscription(subscription)).toBe(false);
		});

		it("should return false when plan is free", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				status: "active",
				plan: "free",
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
			expect(hasPaidSubscription(subscription)).toBe(false);
		});

		it("should return true when has subscription with business plan", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				status: "active",
				plan: "business",
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
			expect(hasPaidSubscription(subscription)).toBe(true);
		});

		it("should return true when has subscription with enterprise plan", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				status: "active",
				plan: "enterprise",
				limits: null,
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
			expect(hasPaidSubscription(subscription)).toBe(true);
		});
	});

	describe("isEnterprise", () => {
		it("should return false when subscription is null", () => {
			expect(isEnterprise(null)).toBe(false);
		});

		it("should return true when isLicenseBased is true", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				status: "active",
				plan: "enterprise",
				limits: null,
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
			expect(isEnterprise(subscription)).toBe(true);
		});

		it("should return true when plan is enterprise", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				status: "active",
				plan: "enterprise",
				limits: null,
				isTrialing: false,
				trialDaysRemaining: null,
				currentPeriodStart: null,
				currentPeriodEnd: null,
				cancelAtPeriodEnd: false,
				isLicenseBased: false,
				licenseExpiresAt: null,
				organizationsOwned: 1,
				organizationsLimit: 0,
			};
			expect(isEnterprise(subscription)).toBe(true);
		});

		it("should return false for non-enterprise plan", () => {
			const subscription: SubscriptionStatus = {
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
			expect(isEnterprise(subscription)).toBe(false);
		});
	});

	describe("getUsagePercentage", () => {
		it("should return 0 when included is 0 (unlimited)", () => {
			expect(getUsagePercentage(1000, 0)).toBe(0);
		});

		it("should return 0 when included is negative", () => {
			expect(getUsagePercentage(1000, -1)).toBe(0);
		});

		it("should calculate percentage correctly", () => {
			expect(getUsagePercentage(50, 100)).toBe(50);
		});

		it("should round percentage correctly", () => {
			expect(getUsagePercentage(33, 100)).toBe(33);
		});

		it("should handle 100% usage", () => {
			expect(getUsagePercentage(100, 100)).toBe(100);
		});

		it("should handle overage (over 100%)", () => {
			expect(getUsagePercentage(150, 100)).toBe(150);
		});
	});

	describe("hasWatchlistAccess", () => {
		it("should return false when subscription is null", () => {
			expect(hasWatchlistAccess(null)).toBe(false);
		});

		it("should return false when no subscription", () => {
			const subscription: SubscriptionStatus = {
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
			expect(hasWatchlistAccess(subscription)).toBe(false);
		});

		it("should return true when subscription is active", () => {
			const subscription: SubscriptionStatus = {
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
				licenseExpiresAt: "2026-02-28T00:00:00.002",
				organizationsOwned: 1,
				organizationsLimit: 0,
			};
			expect(hasWatchlistAccess(subscription)).toBe(true);
		});

		it("should return true when subscription is trialing", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				status: "trialing",
				plan: "pro",
				limits: null,
				isTrialing: true,
				trialDaysRemaining: 10,
				currentPeriodStart: null,
				currentPeriodEnd: null,
				cancelAtPeriodEnd: false,
				isLicenseBased: false,
				licenseExpiresAt: null,
				organizationsOwned: 1,
				organizationsLimit: 3,
			};
			expect(hasWatchlistAccess(subscription)).toBe(true);
		});

		it("should return false when subscription is canceled", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				status: "canceled",
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
			expect(hasWatchlistAccess(subscription)).toBe(false);
		});

		it("should return false when subscription is past_due", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				status: "past_due",
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
			expect(hasWatchlistAccess(subscription)).toBe(false);
		});
	});

	describe("hasAMLAccess", () => {
		it("should return false when subscription is null", () => {
			expect(hasAMLAccess(null)).toBe(false);
		});

		it("should return true for active subscription", () => {
			const subscription: SubscriptionStatus = {
				hasSubscription: true,
				status: "active",
				plan: "business",
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
			expect(hasAMLAccess(subscription)).toBe(true);
		});
	});
});

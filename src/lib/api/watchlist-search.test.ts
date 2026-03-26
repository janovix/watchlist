import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	searchWatchlist,
	isUsageLimitError,
	type WatchlistSearchRequest,
	type WatchlistSearchApiResponse,
	type OfacMatch,
} from "./watchlist-search";
import * as httpModule from "./http";

// Mock the http module
vi.mock("./http", () => ({
	fetchJson: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		body: unknown;
		constructor(message: string, details: { status: number; body: unknown }) {
			super(message);
			this.status = details.status;
			this.body = details.body;
		}
	},
}));

describe("watchlist-search", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("searchWatchlist", () => {
		it("should call POST /search with correct parameters", async () => {
			const mockResponse: WatchlistSearchApiResponse = {
				success: true,
				result: {
					queryId: "test-query-id",
					ofac: { matches: [], count: 0 },
					unsc: { matches: [], count: 0 },
					sat69b: { matches: [], count: 0 },
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			const params: WatchlistSearchRequest = {
				q: "Juan Perez",
			};

			const result = await searchWatchlist(params);

			expect(result).toEqual(mockResponse);
			expect(httpModule.fetchJson).toHaveBeenCalledWith(
				expect.stringContaining("/search"),
				expect.objectContaining({
					method: "POST",
					headers: {
						"content-type": "application/json",
					},
					body: JSON.stringify(params),
				}),
			);
		});

		it("should include JWT token when provided", async () => {
			const mockResponse: WatchlistSearchApiResponse = {
				success: true,
				result: {
					queryId: "test-query-id",
					ofac: { matches: [], count: 0 },
					unsc: { matches: [], count: 0 },
					sat69b: { matches: [], count: 0 },
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			await searchWatchlist({ q: "test" }, { jwt: "test-jwt" });

			expect(httpModule.fetchJson).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					jwt: "test-jwt",
				}),
			);
		});

		it("should send all advanced search parameters", async () => {
			const mockResponse: WatchlistSearchApiResponse = {
				success: true,
				result: {
					queryId: "test-query-id",
					ofac: { matches: [], count: 0 },
					unsc: { matches: [], count: 0 },
					sat69b: { matches: [], count: 0 },
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			const params: WatchlistSearchRequest = {
				q: "Juan Perez",
				identifiers: ["HEMA-621127"],
				birthDate: "1980-01-15",
				countries: ["MX", "US"],
				dataset: "ofac_sdn",
				topK: 10,
				threshold: 0.9,
			};

			await searchWatchlist(params);

			expect(httpModule.fetchJson).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					body: JSON.stringify(params),
				}),
			);
		});

		it("should include countries in request body when provided", async () => {
			const mockResponse: WatchlistSearchApiResponse = {
				success: true,
				result: {
					queryId: "test-query-id",
					ofac: { matches: [], count: 0 },
					unsc: { matches: [], count: 0 },
					sat69b: { matches: [], count: 0 },
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			await searchWatchlist({
				q: "Test",
				countries: ["MX", "US", "CO"],
			});

			const call = vi.mocked(httpModule.fetchJson).mock.calls[0];
			expect(call).toBeDefined();
			expect(call[1]).toBeDefined();
			const body = JSON.parse(
				(call[1] as { body: string }).body,
			) as WatchlistSearchRequest;
			expect(body.countries).toEqual(["MX", "US", "CO"]);
		});

		it("should return matches separated by dataset", async () => {
			const mockOfacMatch: OfacMatch = {
				target: {
					id: "test-1",
					partyType: "Individual",
					primaryName: "Juan Perez Lopez",
					aliases: ["JP Perez"],
					birthDate: "1980-01-15",
					birthPlace: "Mexico City, Mexico",
					addresses: null,
					identifiers: [
						{
							type: "R.F.C.",
							number: "HEMA-621127",
						},
					],
					remarks: null,
					sourceList: "SDN",
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.95,
				breakdown: {
					vectorScore: 0.92,
					nameScore: 0.98,
					metaScore: 1.0,
					identifierMatch: true,
				},
			};

			const mockResponse: WatchlistSearchApiResponse = {
				success: true,
				result: {
					queryId: "test-query-id",
					ofac: { matches: [mockOfacMatch], count: 1 },
					unsc: { matches: [], count: 0 },
					sat69b: { matches: [], count: 0 },
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			const result = await searchWatchlist({ q: "Juan Perez" });

			expect(result.result.ofac.matches).toHaveLength(1);
			expect(result.result.ofac.matches[0].score).toBe(0.95);
			expect(result.result.ofac.matches[0].breakdown.vectorScore).toBe(0.92);
			expect(result.result.ofac.matches[0].breakdown.identifierMatch).toBe(
				true,
			);
			expect(result.result.unsc.count).toBe(0);
			expect(result.result.sat69b.count).toBe(0);
		});

		it("should handle unsuccessful API response", async () => {
			const mockResponse = {
				success: false,
				errors: [{ code: 400, message: "Invalid request" }],
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			await expect(searchWatchlist({ q: "test" })).rejects.toThrow();
		});

		it("should handle network errors", async () => {
			vi.mocked(httpModule.fetchJson).mockRejectedValue(
				new Error("Network error"),
			);

			await expect(searchWatchlist({ q: "test" })).rejects.toThrow();
		});

		it("should use correct API base URL from environment", async () => {
			const mockResponse: WatchlistSearchApiResponse = {
				success: true,
				result: {
					queryId: "test-query-id",
					ofac: { matches: [], count: 0 },
					unsc: { matches: [], count: 0 },
					sat69b: { matches: [], count: 0 },
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			await searchWatchlist({ q: "test" });

			// Should call with URL containing /search endpoint
			const callArgs = vi.mocked(httpModule.fetchJson).mock.calls[0];
			expect(callArgs[0]).toMatch(/\/search$/);
		});

		it("should handle 403 usage limit error and re-throw with message", async () => {
			const usageLimitError = {
				success: false,
				error: "Usage limit exceeded",
				code: "USAGE_LIMIT_EXCEEDED",
				upgradeRequired: true,
				metric: "queries",
				used: 100,
				limit: 100,
				entitlementType: "stripe" as const,
				message: "Daily watchlist query limit reached",
			};

			const apiError = new (httpModule.ApiError as any)("403 error", {
				status: 403,
				body: usageLimitError,
			});

			vi.mocked(httpModule.fetchJson).mockRejectedValue(apiError);

			await expect(searchWatchlist({ q: "test" })).rejects.toThrow(
				"Daily watchlist query limit reached",
			);
		});

		it("should handle 403 usage limit error with default message", async () => {
			const usageLimitError = {
				success: false,
				error: "Usage limit exceeded",
				code: "USAGE_LIMIT_EXCEEDED",
				upgradeRequired: true,
				metric: "queries",
				used: 100,
				limit: 100,
				entitlementType: "stripe" as const,
				message: "", // Empty message
			};

			const apiError = new (httpModule.ApiError as any)("403 error", {
				status: 403,
				body: usageLimitError,
			});

			vi.mocked(httpModule.fetchJson).mockRejectedValue(apiError);

			await expect(searchWatchlist({ q: "test" })).rejects.toThrow(
				/Monthly watchlist query limit reached/,
			);
		});

		it("should re-throw non-usage-limit 403 error as-is", async () => {
			const apiError = new (httpModule.ApiError as any)("403 Forbidden", {
				status: 403,
				body: { error: "Some other 403 error" },
			});

			vi.mocked(httpModule.fetchJson).mockRejectedValue(apiError);

			await expect(searchWatchlist({ q: "test" })).rejects.toThrow(
				"403 Forbidden",
			);
		});

		it("should wrap non-ApiError exceptions in ApiError", async () => {
			vi.mocked(httpModule.fetchJson).mockRejectedValue(
				new TypeError("Something went wrong"),
			);

			await expect(searchWatchlist({ q: "test" })).rejects.toThrow(
				/Failed to search watchlist/,
			);
		});
	});

	describe("isUsageLimitError", () => {
		it("should return true for valid usage limit error", () => {
			const error = {
				code: "USAGE_LIMIT_EXCEEDED",
				message: "Limit exceeded",
			};
			expect(isUsageLimitError(error)).toBe(true);
		});

		it("should return false for null", () => {
			expect(isUsageLimitError(null)).toBe(false);
		});

		it("should return false for non-object", () => {
			expect(isUsageLimitError("not an object")).toBe(false);
			expect(isUsageLimitError(123)).toBe(false);
			expect(isUsageLimitError(true)).toBe(false);
		});

		it("should return false for object without code property", () => {
			const error = { message: "Some error" };
			expect(isUsageLimitError(error)).toBe(false);
		});

		it("should return false for object with wrong code", () => {
			const error = { code: "SOME_OTHER_ERROR", message: "Error" };
			expect(isUsageLimitError(error)).toBe(false);
		});
	});
});

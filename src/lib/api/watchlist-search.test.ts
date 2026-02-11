import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	searchWatchlist,
	type WatchlistSearchRequest,
	type WatchlistSearchApiResponse,
	type WatchlistMatch,
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
					matches: [],
					count: 0,
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
					matches: [],
					count: 0,
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
					matches: [],
					count: 0,
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

		it("should return matches with hybrid scoring breakdown", async () => {
			const mockMatch: WatchlistMatch = {
				target: {
					id: "test-1",
					schema: null,
					name: "Juan Perez Lopez",
					aliases: ["JP Perez"],
					birthDate: "1980-01-15",
					countries: ["MX"],
					addresses: null,
					identifiers: [{ type: "R.F.C.", number: "HEMA-621127" }],
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
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
					matches: [mockMatch],
					count: 1,
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			const result = await searchWatchlist({ q: "Juan Perez" });

			expect(result.result.matches).toHaveLength(1);
			expect(result.result.matches[0].score).toBe(0.95);
			expect(result.result.matches[0].breakdown.vectorScore).toBe(0.92);
			expect(result.result.matches[0].breakdown.identifierMatch).toBe(true);
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
					matches: [],
					count: 0,
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
	});
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchPep } from "./pep";
import { ApiError } from "./http";

// Mock the http module
vi.mock("./http", async () => {
	const actual = await vi.importActual<typeof import("./http")>("./http");
	return {
		...actual,
		fetchJson: vi.fn(),
	};
});

describe("pep API", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("searchPep", () => {
		it("should call the PEP search endpoint with correct parameters", async () => {
			const { fetchJson } = await import("./http");
			const mockResponse = {
				isPep: true,
				record: {
					dataset: "OFAC",
					id: "OFAC-12345",
					name: "John Doe",
					aliases: ["J. Doe"],
					birthDate: "1980-01-01",
					countries: ["US"],
					firstSeen: "2020-01-01T00:00:00Z",
					lastChange: "2023-01-01T00:00:00Z",
					lastSeen: "2024-01-01T00:00:00Z",
				},
			};

			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: mockResponse,
			});

			const result = await searchPep("John Doe");

			expect(fetchJson).toHaveBeenCalledWith(
				expect.stringContaining("/pep/search"),
				expect.objectContaining({
					method: "POST",
					headers: expect.objectContaining({
						"content-type": "application/json",
					}),
					body: JSON.stringify({ name: "John Doe" }),
				}),
			);

			expect(result).toEqual(mockResponse);
		});

		it("should handle non-PEP results", async () => {
			const { fetchJson } = await import("./http");
			const mockResponse = {
				isPep: false,
				record: null,
			};

			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: mockResponse,
			});

			const result = await searchPep("Jane Smith");

			expect(result).toEqual(mockResponse);
			expect(result.isPep).toBe(false);
			expect(result.record).toBeNull();
		});

		it("should throw ApiError when the API returns an error", async () => {
			const { fetchJson } = await import("./http");
			const apiError = new ApiError("Not Found", {
				status: 404,
				body: { message: "Not found" },
			});

			vi.mocked(fetchJson).mockRejectedValue(apiError);

			await expect(searchPep("Unknown Person")).rejects.toThrow(ApiError);
			await expect(searchPep("Unknown Person")).rejects.toThrow("Not Found");
		});

		it("should handle network errors", async () => {
			const { fetchJson } = await import("./http");
			const networkError = new Error("Network error");

			vi.mocked(fetchJson).mockRejectedValue(networkError);

			await expect(searchPep("Test")).rejects.toThrow(ApiError);
			await expect(searchPep("Test")).rejects.toThrow("Failed to search PEP");
		});

		it("should use environment variable for API base URL when set", async () => {
			const { fetchJson } = await import("./http");
			const originalEnv = process.env.WATCHLIST_API_BASE_URL;

			try {
				process.env.WATCHLIST_API_BASE_URL = "https://custom-api.example.com";
				const mockResponse = {
					isPep: false,
					record: null,
				};

				vi.mocked(fetchJson).mockResolvedValue({
					status: 200,
					json: mockResponse,
				});

				await searchPep("Test");

				expect(fetchJson).toHaveBeenCalledWith(
					"https://custom-api.example.com/pep/search",
					expect.any(Object),
				);
			} finally {
				if (originalEnv === undefined) {
					delete process.env.WATCHLIST_API_BASE_URL;
				} else {
					process.env.WATCHLIST_API_BASE_URL = originalEnv;
				}
			}
		});
	});
});

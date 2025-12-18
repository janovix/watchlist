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
			const mockApiResponse = {
				success: true,
				result: {
					target: {
						id: "OFAC-12345",
						schema: null,
						name: "John Doe",
						aliases: ["J. Doe"],
						birthDate: "1980-01-01",
						countries: ["US"],
						addresses: null,
						identifiers: null,
						sanctions: null,
						phones: null,
						emails: null,
						programIds: null,
						dataset: "OFAC",
						firstSeen: "2020-01-01T00:00:00Z",
						lastChange: "2023-01-01T00:00:00Z",
						lastSeen: "2024-01-01T00:00:00Z",
						createdAt: "2020-01-01T00:00:00Z",
						updatedAt: "2024-01-01T00:00:00Z",
					},
					pepStatus: true,
					pepDetails: "PEP match found",
					matchConfidence: "exact" as const,
				},
			};

			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: mockApiResponse,
			});

			const result = await searchPep("John Doe");

			expect(fetchJson).toHaveBeenCalledWith(
				expect.stringContaining("/pep/search"),
				expect.objectContaining({
					method: "POST",
					headers: expect.objectContaining({
						"content-type": "application/json",
					}),
					body: JSON.stringify({ query: "John Doe" }),
				}),
			);

			expect(result.isPep).toBe(true);
			expect(result.record).not.toBeNull();
			expect(result.record?.name).toBe("John Doe");
			expect(result.matchConfidence).toBe("exact");
		});

		it("should handle non-PEP results", async () => {
			const { fetchJson } = await import("./http");
			const mockApiResponse = {
				success: true,
				result: {
					target: {
						id: "TARGET-001",
						schema: null,
						name: "Jane Smith",
						aliases: null,
						birthDate: null,
						countries: null,
						addresses: null,
						identifiers: null,
						sanctions: null,
						phones: null,
						emails: null,
						programIds: null,
						dataset: null,
						firstSeen: null,
						lastSeen: null,
						lastChange: null,
						createdAt: "2024-01-01T00:00:00Z",
						updatedAt: "2024-01-01T00:00:00Z",
					},
					pepStatus: false,
					pepDetails: "No PEP match found",
					matchConfidence: "possible" as const,
				},
			};

			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: mockApiResponse,
			});

			const result = await searchPep("Jane Smith");

			expect(result.isPep).toBe(false);
			expect(result.record).toBeNull();
			expect(result.matchConfidence).toBe("possible");
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
				const mockApiResponse = {
					success: true,
					result: {
						target: {
							id: "TARGET-001",
							schema: null,
							name: "Test",
							aliases: null,
							birthDate: null,
							countries: null,
							addresses: null,
							identifiers: null,
							sanctions: null,
							phones: null,
							emails: null,
							programIds: null,
							dataset: null,
							firstSeen: null,
							lastSeen: null,
							lastChange: null,
							createdAt: "2024-01-01T00:00:00Z",
							updatedAt: "2024-01-01T00:00:00Z",
						},
						pepStatus: false,
						pepDetails: "No PEP match",
						matchConfidence: "possible" as const,
					},
				};

				vi.mocked(fetchJson).mockResolvedValue({
					status: 200,
					json: mockApiResponse,
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

		it("should throw error when API returns success: false", async () => {
			const { fetchJson } = await import("./http");
			const mockApiResponse = {
				success: false,
				result: {
					target: {
						id: "TARGET-001",
						schema: null,
						name: "Test",
						aliases: null,
						birthDate: null,
						countries: null,
						addresses: null,
						identifiers: null,
						sanctions: null,
						phones: null,
						emails: null,
						programIds: null,
						dataset: null,
						firstSeen: null,
						lastSeen: null,
						lastChange: null,
						createdAt: "2024-01-01T00:00:00Z",
						updatedAt: "2024-01-01T00:00:00Z",
					},
					pepStatus: false,
					pepDetails: "",
					matchConfidence: "possible" as const,
				},
			};

			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: mockApiResponse,
			});

			await expect(searchPep("Test")).rejects.toThrow(ApiError);
		});

		it("should use default values when target fields are null", async () => {
			const { fetchJson } = await import("./http");
			const mockApiResponse = {
				success: true,
				result: {
					target: {
						id: "TARGET-001",
						schema: null,
						name: null,
						aliases: null,
						birthDate: null,
						countries: null,
						addresses: null,
						identifiers: null,
						sanctions: null,
						phones: null,
						emails: null,
						programIds: null,
						dataset: null,
						firstSeen: null,
						lastSeen: null,
						lastChange: null,
						createdAt: "2024-01-01T00:00:00Z",
						updatedAt: "2024-01-01T00:00:00Z",
					},
					pepStatus: true,
					pepDetails: "PEP match",
					matchConfidence: "exact" as const,
				},
			};

			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: mockApiResponse,
			});

			const result = await searchPep("Test");

			expect(result.isPep).toBe(true);
			expect(result.record).not.toBeNull();
			expect(result.record?.dataset).toBe("UNKNOWN");
			expect(result.record?.name).toBe("Unknown");
			expect(result.record?.aliases).toEqual([]);
			expect(result.record?.countries).toEqual([]);
		});

		it("should handle non-Error exceptions", async () => {
			const { fetchJson } = await import("./http");

			vi.mocked(fetchJson).mockRejectedValue("String error");

			await expect(searchPep("Test")).rejects.toThrow(ApiError);
			await expect(searchPep("Test")).rejects.toThrow("Unknown error");
		});
	});
});

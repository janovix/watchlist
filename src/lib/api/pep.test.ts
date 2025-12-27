import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { evaluatePEP } from "./pep";
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

	describe("evaluatePEP", () => {
		it("should call the PEP evaluate endpoint with correct parameters", async () => {
			const { fetchJson } = await import("./http");
			const mockApiResponse = {
				success: true,
				result: {
					isPEP: true,
					confidence: "high" as const,
					currentPosition: "Senador de la República",
					country: "MX",
					evidence: ["Found in official records"],
					reasoning: "Person is a current senator",
					source: "ai" as const,
				},
			};

			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: mockApiResponse,
			});

			const result = await evaluatePEP({ fullName: "John Doe" });

			expect(fetchJson).toHaveBeenCalledWith(
				expect.stringContaining("/pep/evaluate"),
				expect.objectContaining({
					method: "POST",
					headers: expect.objectContaining({
						"content-type": "application/json",
					}),
					body: JSON.stringify({ fullName: "John Doe" }),
				}),
			);

			expect(result.isPep).toBe(true);
			expect(result.record).not.toBeNull();
			expect(result.record?.name).toBe("John Doe");
			expect(result.confidence).toBe("high");
			expect(result.currentPosition).toBe("Senador de la República");
			expect(result.source).toBe("ai");
		});

		it("should handle non-PEP results", async () => {
			const { fetchJson } = await import("./http");
			const mockApiResponse = {
				success: true,
				result: {
					isPEP: false,
					confidence: "high" as const,
					currentPosition: null,
					country: null,
					evidence: [],
					reasoning: "No PEP records found",
					source: "ai" as const,
				},
			};

			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: mockApiResponse,
			});

			const result = await evaluatePEP({
				fullName: "Jane Smith",
				country: "MX",
			});

			expect(result.isPep).toBe(false);
			expect(result.record).toBeNull();
			expect(result.confidence).toBe("high");
		});

		it("should throw ApiError when the API returns an error", async () => {
			const { fetchJson } = await import("./http");
			const apiError = new ApiError("Not Found", {
				status: 404,
				body: { message: "Not found" },
			});

			vi.mocked(fetchJson).mockRejectedValue(apiError);

			await expect(evaluatePEP({ fullName: "Unknown Person" })).rejects.toThrow(
				ApiError,
			);
			await expect(evaluatePEP({ fullName: "Unknown Person" })).rejects.toThrow(
				"Not Found",
			);
		});

		it("should handle network errors", async () => {
			const { fetchJson } = await import("./http");
			const networkError = new Error("Network error");

			vi.mocked(fetchJson).mockRejectedValue(networkError);

			await expect(evaluatePEP({ fullName: "Test" })).rejects.toThrow(ApiError);
			await expect(evaluatePEP({ fullName: "Test" })).rejects.toThrow(
				"Failed to evaluate PEP",
			);
		});

		it("should include all optional parameters", async () => {
			const { fetchJson } = await import("./http");
			const mockApiResponse = {
				success: true,
				result: {
					isPEP: true,
					confidence: "medium" as const,
					currentPosition: "Ex-Diputado",
					country: "MX",
					evidence: ["Historical record"],
					reasoning: "Former deputy",
					source: "gk" as const,
				},
			};

			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: mockApiResponse,
			});

			await evaluatePEP({
				fullName: "Roberto Fernández",
				birthDate: "1980-01-15",
				country: "MX",
				knownAliases: ["R. Fernández"],
				occupation: "Politician",
				additionalContext: "Former deputy",
				useHybrid: true,
			});

			expect(fetchJson).toHaveBeenCalledWith(
				expect.stringContaining("/pep/evaluate"),
				expect.objectContaining({
					body: JSON.stringify({
						fullName: "Roberto Fernández",
						birthDate: "1980-01-15",
						country: "MX",
						knownAliases: ["R. Fernández"],
						occupation: "Politician",
						additionalContext: "Former deputy",
						useHybrid: true,
					}),
				}),
			);
		});

		it("should throw error when API returns success: false", async () => {
			const { fetchJson } = await import("./http");
			const mockApiResponse = {
				success: false,
				result: {
					isPEP: false,
					confidence: "low" as const,
					currentPosition: null,
					country: null,
					evidence: [],
					reasoning: "",
					source: "ai" as const,
				},
			};

			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: mockApiResponse,
			});

			await expect(evaluatePEP({ fullName: "Test" })).rejects.toThrow(ApiError);
		});

		it("should handle non-Error exceptions", async () => {
			const { fetchJson } = await import("./http");

			vi.mocked(fetchJson).mockRejectedValue("String error");

			await expect(evaluatePEP({ fullName: "Test" })).rejects.toThrow(ApiError);
			await expect(evaluatePEP({ fullName: "Test" })).rejects.toThrow(
				"Unknown error",
			);
		});

		it("should handle null country in result", async () => {
			const { fetchJson } = await import("./http");
			const mockApiResponse = {
				success: true,
				result: {
					isPEP: true,
					confidence: "high" as const,
					currentPosition: "Senator",
					country: null,
					evidence: ["Found in records"],
					reasoning: "Person is a senator",
					source: "watchlist" as const,
				},
			};

			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: mockApiResponse,
			});

			const result = await evaluatePEP({ fullName: "John Doe" });

			expect(result.isPep).toBe(true);
			expect(result.record).not.toBeNull();
			expect(result.record?.countries).toEqual([]);
		});
	});
});
